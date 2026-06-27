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

create table if not exists post_metrics (
  post_id uuid primary key references posts(id) on delete cascade,
  view_count integer not null default 0,
  updated_at timestamptz default now()
);

create table if not exists post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  visitor_id text not null,
  created_at timestamptz default now(),
  unique (post_id, visitor_id)
);

create table if not exists post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  author_name text not null,
  body text not null,
  parent_id uuid references post_comments(id) on delete cascade,
  approved boolean default true,
  created_at timestamptz default now(),
  edited_at timestamptz
);

alter table post_comments add column if not exists parent_id uuid references post_comments(id) on delete cascade;
alter table post_comments add column if not exists edited_at timestamptz;

alter table admins enable row level security;
alter table posts enable row level security;
alter table post_metrics enable row level security;
alter table post_likes enable row level security;
alter table post_comments enable row level security;

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

drop policy if exists "Public can read post metrics" on post_metrics;
create policy "Public can read post metrics"
  on post_metrics for select
  using (true);

create or replace function increment_post_view(target_post_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  next_count integer;
begin
  insert into post_metrics (post_id, view_count, updated_at)
  values (target_post_id, 1, now())
  on conflict (post_id)
  do update set
    view_count = post_metrics.view_count + 1,
    updated_at = now()
  returning view_count into next_count;

  return next_count;
end;
$$;

grant execute on function increment_post_view(uuid) to anon, authenticated;

drop policy if exists "Public can read post likes" on post_likes;
create policy "Public can read post likes"
  on post_likes for select
  using (true);

drop policy if exists "Public can like posts" on post_likes;
create policy "Public can like posts"
  on post_likes for insert
  with check (visitor_id is not null and length(visitor_id) between 8 and 120);

drop policy if exists "Public can read approved comments" on post_comments;
create policy "Public can read approved comments"
  on post_comments for select
  using (approved = true);

drop policy if exists "Public can create approved comments" on post_comments;
create policy "Public can create approved comments"
  on post_comments for insert
  with check (
    approved = true
    and length(trim(author_name)) between 1 and 80
    and length(trim(body)) between 1 and 2000
    and (
      parent_id is null
      or exists (
        select 1
        from post_comments parent
        where parent.id = post_comments.parent_id
          and parent.post_id = post_comments.post_id
          and parent.approved = true
      )
    )
  );

drop policy if exists "Admins can read all comments" on post_comments;
create policy "Admins can read all comments"
  on post_comments for select
  to authenticated
  using (exists (select 1 from admins where admins.user_id = auth.uid()));

drop policy if exists "Admins can update comments" on post_comments;
create policy "Admins can update comments"
  on post_comments for update
  to authenticated
  using (exists (select 1 from admins where admins.user_id = auth.uid()))
  with check (exists (select 1 from admins where admins.user_id = auth.uid()));

drop policy if exists "Admins can delete comments" on post_comments;
create policy "Admins can delete comments"
  on post_comments for delete
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
