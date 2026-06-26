-- Supabase schema for trade blog / journal site.
-- Run this in Supabase SQL editor when you create the project.

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  type text not null check (type in ('blog', 'trade_note')),
  title text not null,
  excerpt text,
  content text,
  cover_url text,
  tags text[] default '{}',
  symbol text,
  setup text,
  thesis text,
  invalidation text,
  outcome text,
  published boolean default false,
  published_at timestamptz default now(),
  created_at timestamptz default now()
);

alter table posts enable row level security;

create policy "Public can read published posts"
  on posts for select
  using (published = true);
