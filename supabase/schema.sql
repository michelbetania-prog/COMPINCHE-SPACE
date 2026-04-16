create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

create table if not exists quiz_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  skin_type text not null,
  problems text[] not null,
  commitment text not null check (commitment in ('bajo', 'medio', 'alto')),
  budget text not null check (budget in ('bajo', 'medio', 'alto')),
  created_at timestamptz not null default now()
);

create table if not exists routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  quiz_response_id uuid not null references quiz_responses(id) on delete cascade,
  morning_steps jsonb not null,
  night_steps jsonb not null,
  product_recommendations jsonb not null,
  phase int not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  routine_id uuid not null references routines(id) on delete cascade,
  date date not null,
  morning_completed jsonb not null,
  night_completed jsonb not null,
  streak_count int not null default 0,
  unique (routine_id, date)
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  tier text not null check (tier in ('bajo', 'medio', 'alto')),
  price numeric(10,2) not null,
  affiliate_url text not null,
  skin_types text[] not null,
  problems text[] not null
);
