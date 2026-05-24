# PestControl Pro CRM

Pest control field service management — Next.js 15 + Supabase.

## Setup

### 1. Supabase
1. Create or use your Supabase project
2. Go to **SQL Editor** → run `supabase/setup.sql`
3. Go to **Authentication → Users** → create your first admin user
4. In SQL Editor, set that user's role:
   ```sql
   update profiles set role = 'ADMIN', first_name = 'Your', last_name = 'Name'
   where id = 'PASTE_USER_UUID_HERE';
   ```

### 2. Vercel
1. Import repo → Framework = Next.js, Root Directory = `/`
2. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL      = https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
   ```
3. Deploy

## Features
- Dashboard KPIs + recent visits
- Clients & sites with zones
- Visit scheduling — checklist, findings, chemicals
- Teams & staff management
- Chemical inventory
- Reports with CSV export
