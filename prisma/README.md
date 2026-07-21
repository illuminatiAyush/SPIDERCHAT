# SpiderChat Prisma Integration

This directory contains the database schema for SpiderChat.

## Schema Highlights
- `schema.prisma`: The single source of truth for the database layout.
- Uses PostgreSQL provider.

## Workflow

To sync changes to the database during development:
```bash
npx prisma db push
```

To generate the Prisma Client after schema changes:
```bash
npx prisma generate
```

To view and edit the database using Prisma Studio:
```bash
npx prisma studio
```

## Migrations
In production, use `npx prisma migrate deploy` instead of `db push` to apply versioned migrations.
