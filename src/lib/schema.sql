-- Supabase schema for trade blog / journal site.
-- Run this in Supabase SQL editor when you create the project.

create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

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
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table admins enable row level security;
alter table posts enable row level security;

drop policy if exists "Users can read their own admin row" on admins;
create policy "Users can read their own admin row"
  on admins for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Public can read published posts" on posts;
create policy "Public can read published posts"
  on posts for select
  using (published = true);

drop policy if exists "Admins can read all posts" on posts;
create policy "Admins can read all posts"
  on posts for select
  to authenticated
  using (exists (select 1 from admins where admins.user_id = auth.uid()));

drop policy if exists "Admins can create posts" on posts;
create policy "Admins can create posts"
  on posts for insert
  to authenticated
  with check (exists (select 1 from admins where admins.user_id = auth.uid()));

drop policy if exists "Admins can update posts" on posts;
create policy "Admins can update posts"
  on posts for update
  to authenticated
  using (exists (select 1 from admins where admins.user_id = auth.uid()))
  with check (exists (select 1 from admins where admins.user_id = auth.uid()));

drop policy if exists "Admins can delete posts" on posts;
create policy "Admins can delete posts"
  on posts for delete
  to authenticated
  using (exists (select 1 from admins where admins.user_id = auth.uid()));

insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can read post images" on storage.objects;
create policy "Public can read post images"
  on storage.objects for select
  using (bucket_id = 'post-images');

drop policy if exists "Admins can upload post images" on storage.objects;
create policy "Admins can upload post images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'post-images'
    and exists (select 1 from admins where admins.user_id = auth.uid())
  );

drop policy if exists "Admins can update post images" on storage.objects;
create policy "Admins can update post images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'post-images'
    and exists (select 1 from admins where admins.user_id = auth.uid())
  )
  with check (
    bucket_id = 'post-images'
    and exists (select 1 from admins where admins.user_id = auth.uid())
  );

drop policy if exists "Admins can delete post images" on storage.objects;
create policy "Admins can delete post images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'post-images'
    and exists (select 1 from admins where admins.user_id = auth.uid())
  );

-- After creating your Supabase Auth user, add yourself as admin:
-- insert into admins (user_id)
-- select id from auth.users where email = 'preetanurag5@gmail.com'
-- on conflict (user_id) do nothing;
