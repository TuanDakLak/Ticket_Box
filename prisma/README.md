 # Ticket_Box

## Database migration (Prisma)

1. Create a `.env` file at the repo root and set `DATABASE_URL` and `DIRECT_URL`.
2. Install dependencies: `npm install`.
3. Run the initial migration:

```bash
npx prisma migrate dev --name init_schema
```

## Database seed (Prisma)

```bash
npx prisma db seed
```