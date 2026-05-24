# Deployment Guide — Railway (API) + Vercel (Web)

## Step 1 — Get your Supabase connection strings

1. Go to: https://supabase.com/dashboard/project/qliqgoqiejeoppfbegek/settings/database
2. Scroll to **"Connection string"** section
3. Copy two URLs:

| Variable | Dropdown | Port |
|---|---|---|
| `DATABASE_URL` | **Transaction** | 6543 |
| `DIRECT_URL` | **Session** | 5432 |

> The Transaction URL ends with `?pgbouncer=true` — keep that.

Your URLs will look like:
```
DATABASE_URL = postgresql://postgres.qliqgoqiejeoppfbegek:DeltaCharlie689er%4044@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL   = postgresql://postgres.qliqgoqiejeoppfbegek:DeltaCharlie689er%4044@aws-0-REGION.pooler.supabase.com:5432/postgres
```
*(Replace `REGION` with the actual region shown, e.g. `eu-central-1`)*

---

## Step 2 — Deploy API to Railway

### 2.1 Create Railway project
1. Go to https://railway.app → **New Project** → **Deploy from GitHub repo**
2. Select `abdelrahmansafwat95/Drudge`
3. Click the service that appears → **Settings**
4. Set **Root Directory** → `apps/api`
5. Railway will use `railway.json` automatically (start command is already configured)

### 2.2 Add Railway environment variables

Click **Variables** tab and add all of these:

```
DATABASE_URL    = [paste Transaction URL from Supabase]
DIRECT_URL      = [paste Session URL from Supabase]
JWT_SECRET      = 7f3e8b2a1d9c6f4e0a5b3c7d2e8f1a4b6c9d3e7f2a5b8c1d4e7f0a3b6c9d2e5
JWT_REFRESH_SECRET = 9a2c5f8b1d4e7a0c3f6b9d2e5a8c1f4b7d0e3a6c9f2b5d8e1a4c7f0b3d6e9a2
JWT_EXPIRES_IN  = 15m
JWT_REFRESH_EXPIRES_IN = 7d
NODE_ENV        = production
```

> Railway auto-assigns `PORT`. Our API reads `process.env.PORT` automatically.

### 2.3 Deploy
Click **Deploy**. After it finishes, copy the public URL — you'll need it for Vercel.

Example: `https://drudge-api-production.up.railway.app`

Test it: `https://YOUR-RAILWAY-URL/api/v1/dashboard/kpis` → should return 401 (JWT working)

---

## Step 3 — Deploy Web to Vercel

### 3.1 Create Vercel project
1. Go to https://vercel.com → **New Project** → Import `abdelrahmansafwat95/Drudge`
2. Under **Root Directory** → type `apps/web`
3. Framework will auto-detect as **Next.js**

### 3.2 Add Vercel environment variables

```
NEXT_PUBLIC_API_URL  = https://YOUR-RAILWAY-URL/api/v1
NEXT_PUBLIC_APP_URL  = https://YOUR-PROJECT.vercel.app
NODE_ENV             = production
```

> Replace `YOUR-RAILWAY-URL` with the URL from Step 2.3

### 3.3 Deploy
Click **Deploy**. Your app will be live at `https://your-project.vercel.app`

---

## Step 4 — Update CORS after Vercel deploy

Once you know your Vercel URL, add it to Railway variables:
```
NEXT_PUBLIC_APP_URL = https://your-actual-project.vercel.app
```
The API CORS already allows all `*.vercel.app` domains, so this is optional but good practice.

---

## Login Credentials (already in DB)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@pestcontrol.com | Admin@123 |
| Admin | admin@pestcontrol.com | Admin@123 |
| Manager | manager@pestcontrol.com | Admin@123 |
| Team Leader | leader@pestcontrol.com | Admin@123 |
| Agent | agent@pestcontrol.com | Admin@123 |

---

## Troubleshooting

**Railway build fails** → Check that Root Directory is set to `apps/api`

**401 on all API calls** → JWT secrets must match between Railway env and what was used to sign tokens

**CORS error in browser** → Your Vercel URL must end in `.vercel.app` OR be set in `NEXT_PUBLIC_APP_URL` on Railway

**Supabase free tier paused** → Go to dashboard → Resume project

**`prisma db push` fails on Railway** → Double-check `DATABASE_URL` and `DIRECT_URL` are correctly set with the password `@` encoded as `%40`
