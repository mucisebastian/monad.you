-- Drop: A link inbox for two friends
-- Run this in your Supabase SQL Editor

-- Users table
create table users (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  last_submitted_at timestamp with time zone
);

-- Seed the two users
insert into users (slug, name) values ('muci', 'Muci'), ('aj', 'AJ');

-- Links table
create table links (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references users(id),
  recipient_id uuid references users(id),
  url text not null,
  title text,
  thumbnail text,
  platform_tag text not null,
  custom_tags text[],
  note text,
  created_at timestamp with time zone default now(),
  watched boolean default false,
  watched_at timestamp with time zone
);

-- Index for faster inbox queries
create index idx_links_recipient on links(recipient_id, watched, created_at desc);

-- Enable Row Level Security (optional but recommended)
alter table users enable row level security;
alter table links enable row level security;

-- Allow public read/write for this simple app (no auth)
create policy "Allow public read on users" on users for select using (true);
create policy "Allow public update on users" on users for update using (true);

create policy "Allow public read on links" on links for select using (true);
create policy "Allow public insert on links" on links for insert with check (true);
create policy "Allow public update on links" on links for update using (true);
