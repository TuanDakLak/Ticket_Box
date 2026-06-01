import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClientType | null = null;
  private readonly connectTimeoutMs = Number(process.env.REDIS_CONNECT_TIMEOUT_MS ?? 3000);
  private errorLogSuppressed = false;

  async onModuleInit() {
    const url = process.env.REDIS_URL;
    const host = process.env.REDIS_HOST ?? '127.0.0.1';
    const port = Number(process.env.REDIS_PORT ?? 6379);
    const socketOptions = {
      connectTimeout: this.connectTimeoutMs,
      // Fail fast when Redis is unavailable so app startup is not blocked.
      reconnectStrategy: (): false => false,
    };

    this.client = url
      ? createClient({ url, socket: socketOptions })
      : createClient({ socket: { ...socketOptions, host, port } });

    this.client.on('error', (error: unknown) => {
      if (!this.errorLogSuppressed) {
        this.logger.error('Redis client error', error);
        this.logger.warn('Suppressing repeated Redis client errors. Cache will be bypassed until Redis recovers.');
        this.errorLogSuppressed = true;
      }
    });

    try {
      await this.client.connect();
      this.errorLogSuppressed = false;
      this.logger.log(`Connected to Redis${url ? ` at ${url}` : ` at ${host}:${port}`}`);
    } catch (error) {
      this.logger.warn('Redis is unavailable; cache operations will be skipped', error as Error);
      await this.safeCloseClient();
      this.client = null;
    }
  }

  async onModuleDestroy() {
    if (!this.client) {
      return;
    }

    try {
      await this.safeCloseClient();
    } catch (error) {
      this.logger.warn('Failed to close Redis connection cleanly', error as Error);
    }
  }

  async getJson<T>(key: string): Promise<T | null> {
    const client = this.client;
    if (!client || !client.isOpen) {
      return null;
    }

    let value: string | null;
    try {
      value = await client.get(key);
    } catch {
      this.markClientUnavailable();
      return null;
    }

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.warn(`Failed to parse cached value for key ${key}`, error as Error);
      return null;
    }
  }

  async setJson(key: string, value: unknown, ttlSeconds?: number): Promise<boolean> {
    const client = this.client;
    if (!client || !client.isOpen) {
      return false;
    }

    const payload = JSON.stringify(value);
    try {
      if (ttlSeconds && ttlSeconds > 0) {
        await client.set(key, payload, { EX: ttlSeconds });
      } else {
        await client.set(key, payload);
      }
    } catch {
      this.markClientUnavailable();
      return false;
    }

    return true;
  }

  async setIfAbsentJson(key: string, value: unknown, ttlSeconds?: number): Promise<boolean> {
    const client = this.client;
    if (!client || !client.isOpen) {
      return false;
    }

    const payload = JSON.stringify(value);
    try {
      const result = await client.set(key, payload, {
        NX: true,
        ...(ttlSeconds && ttlSeconds > 0 ? { EX: ttlSeconds } : {}),
      });

      return result === 'OK';
    } catch {
      this.markClientUnavailable();
      return false;
    }
  }

  async delete(key: string): Promise<number> {
    const client = this.client;
    if (!client || !client.isOpen) {
      return 0;
    }

    try {
      return await client.del(key);
    } catch {
      this.markClientUnavailable();
      return 0;
    }
  }

  async deleteByPattern(pattern: string): Promise<number> {
    const client = this.client;
    if (!client || !client.isOpen) {
      return 0;
    }

    const keys: string[] = [];
    try {
      for await (const batch of client.scanIterator({ MATCH: pattern, COUNT: 100 })) {
        keys.push(...batch);
      }
    } catch {
      this.markClientUnavailable();
      return 0;
    }

    if (keys.length === 0) {
      return 0;
    }

    try {
      return await client.del(keys);
    } catch {
      this.markClientUnavailable();
      return 0;
    }
  }

  private markClientUnavailable(): void {
    void this.safeCloseClient();
    this.client = null;
  }

  private async safeCloseClient(): Promise<void> {
    if (!this.client) {
      return;
    }

    if (!this.client.isOpen) {
      return;
    }

    await this.client.quit();
  }
}