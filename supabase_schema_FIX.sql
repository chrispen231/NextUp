-- This script is idempotent (can be run multiple times without errors)

-- 1. Create Trials Table if it doesn't exist
create table if not exists trials (
  id uuid default gen_random_uuid() primary key,
  club_id uuid references actors(id) on delete cascade not null,
  title text not null,
  description text not null,
  location text not null,
  trial_date timestamp with time zone not null,
  trial_time text,
  trial_type text check (trial_type in ('Professional', 'Youth', 'Elite', 'Amateur')) default 'Professional',
  requirements text[],
  contact_info text,
  status text check (status in ('OPEN', 'CLOSED', 'CANCELLED')) default 'OPEN',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Applications Table if it doesn't exist
create table if not exists trial_applications (
  id uuid default gen_random_uuid() primary key,
  trial_id uuid references trials(id) on delete cascade not null,
  player_id uuid references actors(id) on delete cascade not null,
  status text check (status in ('PENDING', 'ACCEPTED', 'REJECTED')) default 'PENDING',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(trial_id, player_id)
);

-- 3. Enable RLS (Safe to run multiple times)
alter table trials enable row level security;
alter table trial_applications enable row level security;

-- 4. Policies (Use DO blocks to prevent "already exists" errors)
do $$ 
begin
    if not exists (select 1 from pg_policies where policyname = 'Trials are viewable by everyone.') then
        create policy "Trials are viewable by everyone." on trials for select using (true);
    end if;
    
    if not exists (select 1 from pg_policies where policyname = 'Clubs can insert their own trials.') then
        create policy "Clubs can insert their own trials." on trials for insert with check (
            exists (select 1 from actors where id = auth.uid() and role = 'CLUB')
        );
    end if;

    if not exists (select 1 from pg_policies where policyname = 'Clubs can update their own trials.') then
        create policy "Clubs can update their own trials." on trials for update using (auth.uid() = club_id);
    end if;

    if not exists (select 1 from pg_policies where policyname = 'Players can view their own applications.') then
        create policy "Players can view their own applications." on trial_applications for select using (auth.uid() = player_id);
    end if;

    if not exists (select 1 from pg_policies where policyname = 'Clubs can view applications for their trials.') then
        create policy "Clubs can view applications for their trials." on trial_applications for select using (
            exists (select 1 from trials where id = trial_applications.trial_id and club_id = auth.uid())
        );
    end if;

    if not exists (select 1 from pg_policies where policyname = 'Players can apply for trials.') then
        create policy "Players can apply for trials." on trial_applications for insert with check (
            exists (select 1 from actors where id = auth.uid() and role = 'PLAYER')
        );
    end if;
end $$;
