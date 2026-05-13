-- 1. Create the clips table
create table if not exists clips (
  id uuid default gen_random_uuid() primary key,
  player_id uuid references actors(id) on delete cascade not null,
  title text not null,
  video_url text not null,
  thumbnail_url text,
  tags text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table clips enable row level security;

-- 3. Policy: Everyone can view clips
create policy "Anyone can view clips" on clips
  for select using (true);

-- 4. Policy: Players can upload their own clips
create policy "Players can upload their own clips" on clips
  for insert with check (
    auth.uid() = player_id
    and exists (select 1 from actors where id = auth.uid() and role = 'PLAYER')
  );

-- 5. Create storage bucket for clips
insert into storage.buckets (id, name, public)
values ('nextup-clips', 'nextup-clips', true)
on conflict (id) do nothing;

-- 6. Storage Policies for clips
create policy "Public Access to clips"
on storage.objects for select
using ( bucket_id = 'nextup-clips' );

create policy "Players can upload clips"
on storage.objects for insert
with check (
  bucket_id = 'nextup-clips' 
  and auth.role() = 'authenticated'
);
