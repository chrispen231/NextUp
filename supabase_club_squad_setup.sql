-- Create Club Squad table
create table if not exists public.club_squad (
  id uuid default gen_random_uuid() primary key,
  club_id uuid references public.actors(id) on delete cascade not null,
  player_id uuid references public.actors(id) on delete set null, -- Optional link to platform player
  player_name text not null, -- Name (always required, even if linked)
  position text,
  jersey_number int,
  metadata jsonb default '{}'::jsonb, -- For extra info like height, weight if not on platform
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.club_squad enable row level security;

-- Policies
create policy "Anyone can view club squads" on public.club_squad 
  for select using (true);

create policy "Clubs can manage their own squad" on public.club_squad 
  for all using (auth.uid() = club_id);

create policy "Admins can manage any squad" on public.club_squad 
  for all using (
    exists (
      select 1 from public.actors 
      where id = auth.uid() and role = 'ADMIN'
    )
  );
