# PestControl Pro — Enterprise Operations Platform

Full-stack pest control CRM built with NestJS + Next.js 15 + Supabase.

## Stack

- **API**: NestJS 10, TypeScript, Prisma, JWT Auth
- **Web**: Next.js 15, Tailwind CSS, Zustand
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel (web) + Railway (API)

## Quick Start

```bash
# Install all dependencies
npm install --legacy-peer-deps

# Copy env file and fill in values
cp .env.example .env

# Setup database
cd apps/api
npx prisma generate
npx prisma db push
npx ts-node prisma/seed.ts

# Run dev servers (2 terminals)
npm run dev  # from apps/api
npm run dev  # from apps/web
```

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@pestcontrol.com | Admin@123 |
| Admin | admin@pestcontrol.com | Admin@123 |
| Manager | manager@pestcontrol.com | Admin@123 |
| Team Leader | leader@pestcontrol.com | Admin@123 |
| Agent | agent@pestcontrol.com | Admin@123 |

## Deployment

- **API → Railway**: Set root directory to `apps/api`
- **Web → Vercel**: Set root directory to `apps/web`

See the full setup guide for environment variables and configuration.

---
*Built by FoxSystems Tech — foxsystemstech.com*
