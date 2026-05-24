-- ============================================================
-- PestControl Pro CRM — Database Setup
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Profiles linked to Supabase auth.users
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null default 'AGENT',  -- ADMIN | MANAGER | TEAM_LEADER | AGENT
  first_name text not null default '',
  last_name text not null default '',
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text,
  contact_email text,
  contact_phone text,
  address text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sites (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients on delete cascade not null,
  name text not null,
  address text,
  latitude float,
  longitude float,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists zones (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references sites on delete cascade not null,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  leader_id uuid references profiles,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams on delete cascade not null,
  user_id uuid references profiles on delete cascade not null,
  joined_at timestamptz not null default now(),
  unique(team_id, user_id)
);

create table if not exists visits (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references sites not null,
  team_id uuid references teams not null,
  status text not null default 'SCHEDULED',  -- SCHEDULED | IN_PROGRESS | COMPLETED | CANCELLED
  scheduled_at timestamptz not null,
  started_at timestamptz,
  completed_at timestamptz,
  notes text,
  signature text,
  signed_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists checklist_items (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid references visits on delete cascade not null,
  description text not null,
  is_completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists findings (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid references visits on delete cascade not null,
  description text not null,
  severity text not null default 'LOW',  -- LOW | MEDIUM | HIGH | CRITICAL
  location text,
  is_resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists chemicals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active_ingredient text,
  unit text not null default 'ml',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists chemical_logs (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid references visits on delete cascade not null,
  chemical_id uuid references chemicals not null,
  quantity float not null,
  notes text,
  created_at timestamptz not null default now()
);

-- ── Row Level Security ────────────────────────────────────────
alter table profiles enable row level security;
alter table clients enable row level security;
alter table sites enable row level security;
alter table zones enable row level security;
alter table teams enable row level security;
alter table team_members enable row level security;
alter table visits enable row level security;
alter table checklist_items enable row level security;
alter table findings enable row level security;
alter table chemicals enable row level security;
alter table chemical_logs enable row level security;

-- Allow all authenticated users full access (role checks done in app)
create policy "auth_all" on profiles      for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth_all" on clients       for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth_all" on sites         for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth_all" on zones         for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth_all" on teams         for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth_all" on team_members  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth_all" on visits        for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth_all" on checklist_items for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth_all" on findings      for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth_all" on chemicals     for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth_all" on chemical_logs for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Auto-create profile when user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, first_name, last_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', 'New'),
    coalesce(new.raw_user_meta_data->>'last_name', 'User'),
    coalesce(new.raw_user_meta_data->>'role', 'AGENT')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Seed data ─────────────────────────────────────────────────
insert into chemicals (name, active_ingredient, unit) values
  ('Bifenthrin 100EC',   'Bifenthrin',   'ml'),
  ('Cypermethrin 25EC',  'Cypermethrin', 'ml'),
  ('Imidacloprid 200SL', 'Imidacloprid', 'ml'),
  ('Fipronil 50SC',      'Fipronil',     'g'),
  ('Deltamethrin 25EC',  'Deltamethrin', 'ml')
on conflict do nothing;
