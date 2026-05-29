-- Retail Trader Risk Intelligence — Supabase Schema

-- Enable RLS
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;

-- =====================
-- USERS / PROFILES
-- =====================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'elite')),
  risk_tolerance text not null default 'moderate' check (risk_tolerance in ('conservative', 'moderate', 'aggressive')),
  email_alerts boolean not null default true,
  push_notifications boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================
-- WATCHLIST
-- =====================
create table if not exists public.watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  ticker text not null,
  name text not null default '',
  alert_price numeric,
  notes text default '',
  risk_score integer default 0,
  created_at timestamptz not null default now(),
  unique(user_id, ticker)
);

alter table public.watchlist enable row level security;

create policy "Users can manage their own watchlist"
  on public.watchlist for all
  using (auth.uid() = user_id);

create index watchlist_user_id_idx on public.watchlist(user_id);

-- =====================
-- TRADING JOURNAL
-- =====================
create table if not exists public.journal_trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  ticker text not null,
  direction text not null check (direction in ('long', 'short')),
  entry_price numeric not null,
  exit_price numeric,
  shares integer not null,
  entry_date timestamptz not null,
  exit_date timestamptz,
  emotion text not null default 'neutral' check (emotion in ('confident', 'fomo', 'revenge', 'greedy', 'fearful', 'neutral')),
  setup text default '',
  notes text default '',
  screenshot_url text,
  pnl numeric,
  risk_reward_ratio numeric,
  mistakes text[] default '{}',
  status text not null default 'open' check (status in ('open', 'closed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.journal_trades enable row level security;

create policy "Users can manage their own journal"
  on public.journal_trades for all
  using (auth.uid() = user_id);

create index journal_user_id_idx on public.journal_trades(user_id);
create index journal_ticker_idx on public.journal_trades(ticker);
create index journal_entry_date_idx on public.journal_trades(entry_date desc);

-- =====================
-- ANALYSIS CACHE
-- =====================
create table if not exists public.analysis_cache (
  id uuid primary key default gen_random_uuid(),
  ticker text not null,
  risk_score integer not null,
  risk_level text not null check (risk_level in ('LOW', 'MEDIUM', 'HIGH', 'EXTREME')),
  ai_summary text not null,
  dump_probability integer default 0,
  reverse_split_count integer default 0,
  dilution_count integer default 0,
  short_float numeric default 0,
  social_hype_score integer default 0,
  emotional_warnings text[] default '{}',
  raw_data jsonb,
  analyzed_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '15 minutes')
);

create index analysis_ticker_idx on public.analysis_cache(ticker);
create index analysis_expires_idx on public.analysis_cache(expires_at);

-- =====================
-- ALERTS
-- =====================
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  ticker text not null,
  alert_type text not null check (alert_type in ('price', 'risk_score', 'volume', 'social_hype')),
  threshold numeric not null,
  direction text not null check (direction in ('above', 'below')),
  is_active boolean not null default true,
  triggered_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.alerts enable row level security;

create policy "Users can manage their own alerts"
  on public.alerts for all
  using (auth.uid() = user_id);

-- =====================
-- ANALYSIS HISTORY (per user)
-- =====================
create table if not exists public.analysis_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  ticker text not null,
  risk_score integer not null,
  analyzed_at timestamptz not null default now()
);

alter table public.analysis_history enable row level security;

create policy "Users can view their own history"
  on public.analysis_history for all
  using (auth.uid() = user_id);

create index history_user_id_idx on public.analysis_history(user_id);
create index history_analyzed_at_idx on public.analysis_history(analyzed_at desc);
