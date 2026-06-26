-- Supabase schema for the dynamic portfolio.
-- Run this in Supabase SQL editor when you create the project.

create table if not exists blogs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  content text,
  cover_url text,
  published boolean default false,
  published_at timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists trades (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  thesis text,
  status text default 'Researching',
  tags text[] default '{}',
  created_at timestamptz default now()
);

-- Public read access for published blogs and trades.
alter table blogs enable row level security;
alter table trades enable row level security;

create policy "Public can read published blogs"
  on blogs for select
  using (published = true);

create policy "Public can read trades"
  on trades for select
  using (true);
