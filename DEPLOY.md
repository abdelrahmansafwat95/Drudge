# Deployment Guide — Vercel Only (No Railway Needed)

The entire app (API + frontend) runs on Next.js and deploys to **Vercel only**.

---

## Step 1 — Get your Supabase connection strings

1. Go to: https://supabase.com/dashboard/project/qliqgoqiejeoppfbegek/settings/database
2. Scroll to **"Connection string"** section
3. Copy two URLs:

| Variable | Tab | Port |
|---|---|---|
| `DATABASE_URL` | **Transaction** pooler | 6543 |
| `DIRECT_URL` | **Session** pooler | 5432 |

> The Transaction URL ends with `?pgbouncer=true` — keep that.

Your URLs look like:
```
DATABASE_URL = postgresql://postgres.qliqgoqiejeoppfbegek:DeltaCharlie689er%4044@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL   = postgresql://postgres:DeltaCharlie689er%4044@db.qliqgoqiejeoppfbegek.supabase.co:5432/postgres
```
*(Replace `REGION` with what Supabase shows, e.g. `us-east-1`)*

---

## Step 2 — Deploy to Vercel

### 2.1 Create Vercel project
1. Go to https://vercel.com → **New Project** → Import `abdelrahmansafwat95/Drudge`
2. Under **Root Directory** → type `apps/web`
3. Framework auto-detects as **Next.js**

### 2.2 Add environment variables

In Vercel → Project → **Settings → Environment Variables**, add:

```
DATABASE_URL        = [paste Transaction URL from step 1]
DIRECT_URL          = [paste Session URL from step 1]
JWT_SECRET          = 7f3e8b2a1d9c6f4e0a5b3c7d2e8f1a4b6c9d3e7f2a5b8c1d4e7f0a3b6c9d2e5
JWT_REFRESH_SECRET  = 9a2c5f8b1d4e7a0c3f6b9d2e5a8c1f4b7d0e3a6c9f2b5d8e1a4c7f0b3d6e9a2
JWT_EXPIRES_IN      = 15m
JWT_REFRESH_EXPIRES_IN = 7d
NODE_ENV            = production
```

### 2.3 Deploy
Click **Deploy**. Your app will be live at `https://your-project.vercel.app`

That's it — no Railway needed.

---

## Login Credentials (already in DB from SQL setup)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@pestcontrol.com | Admin@123 |
| Admin | admin@pestcontrol.com | Admin@123 |
| Manager | manager@pestcontrol.com | Admin@123 |
| Team Leader | leader@pestcontrol.com | Admin@123 |
| Agent | agent@pestcontrol.com | Admin@123 |

---

## Troubleshooting

**Build fails with "prisma generate" error** → Make sure `DATABASE_URL` is set in Vercel env vars

**401 on all API calls** → JWT secrets must be set in Vercel env vars

**Supabase free tier paused** → Go to dashboard → Resume project → Wait ~30 seconds

**"Can't reach database server"** → Copy the exact URLs from Supabase dashboard; ensure `%40` encodes the `@` in the password

**Wrong region** → In `DATABASE_URL`, replace `REGION` with the actual region from Supabase (e.g. `us-east-1`, `eu-central-1`)
