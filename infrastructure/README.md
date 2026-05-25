# Infrastructure

## Local dependencies (Docker)

Start Redis and RabbitMQ:

```bash
cd infrastructure
# Docker Compose V2
docker compose up -d
```

If you use Docker Compose V1:

```bash
docker-compose up -d
```

Ports:
- Redis: 6379
- RabbitMQ: 5672
- RabbitMQ Management UI: http://localhost:15672 (guest/guest)

Notes:
- `REDIS_URL` and `RABBITMQ_URL` are for application connections, not for browsers.
- Redis has no built-in web UI. Use `redis-cli` or RedisInsight if you need a GUI.
- If your app runs on the host, use `localhost` in the URLs. If it runs in Docker, use service names `redis` and `rabbitmq`.

Check that services are running:

```bash
docker ps
```

Connectivity checks:

```bash
# Redis (port check)
Test-NetConnection -ComputerName localhost -Port 6379

# RabbitMQ (port check)
Test-NetConnection -ComputerName localhost -Port 5672
```

If a port is in use, change the host port in [docker-compose.yml](docker-compose.yml).

Stop services:

```bash
docker compose down
```

## Schema snapshot

The file [data/init.sql](data/init.sql) is a snapshot of the current Prisma schema for quick review.
