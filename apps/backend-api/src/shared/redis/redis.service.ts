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
      this.safeCloseClient();
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
    if (!this.client) {
      return null;
    }

    let value: string | null;
    try {
      value = await this.client.get(key);
    } catch (error) {
      this.logger.warn('Redis get failed; bypassing cache read', error as Error);
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
    if (!this.client) {
      return false;
    }

    const payload = JSON.stringify(value);
    try {
      if (ttlSeconds && ttlSeconds > 0) {
        await this.client.set(key, payload, { EX: ttlSeconds });
      } else {
        await this.client.set(key, payload);
      }
    } catch (error) {
      this.logger.warn('Redis set failed; bypassing cache write', error as Error);
      return false;
    }

    return true;
  }

  async delete(key: string): Promise<number> {
    if (!this.client) {
      return 0;
    }

    try {
      return await this.client.del(key);
    } catch (error) {
      this.logger.warn('Redis delete failed', error as Error);
      return 0;
    }
  }

  async deleteByPattern(pattern: string): Promise<number> {
    if (!this.client) {
      return 0;
    }

    const keys: string[] = [];
    try {
      for await (const batch of this.client.scanIterator({ MATCH: pattern, COUNT: 100 })) {
        keys.push(...batch);
      }
    } catch (error) {
      this.logger.warn('Redis scan failed; skip pattern invalidation', error as Error);
      return 0;
    }

    if (keys.length === 0) {
      return 0;
    }

    try {
      return await this.client.del(keys);
    } catch (error) {
      this.logger.warn('Redis batch delete failed', error as Error);
      return 0;
    }
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