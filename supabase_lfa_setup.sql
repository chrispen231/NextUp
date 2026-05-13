-- 1. Create Leagues table
create table if not exists leagues (
  id uuid default gen_random_uuid() primary key,
  name text not null, -- e.g. "1st Division", "2nd Division"
  gender text not null check (gender in ('MALE', 'FEMALE')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Standings table
create table if not exists standings (
  id uuid default gen_random_uuid() primary key,
  league_id uuid references leagues(id) on delete cascade not null,
  team_name text not null,
  played int default 0,
  won int default 0,
  drawn int default 0,
  lost int default 0,
  points int default 0,
  goal_difference int default 0
);

-- 3. Create Top Scorers table
create table if not exists top_scorers (
  id uuid default gen_random_uuid() primary key,
  league_id uuid references leagues(id) on delete cascade not null,
  player_name text not null,
  team_name text not null,
  goals int default 0
);

-- 4. Enable RLS
alter table leagues enable row level security;
alter table standings enable row level security;
alter table top_scorers enable row level security;

-- 5. Public Read Policies
create policy "Anyone can read leagues" on leagues for select using (true);
create policy "Anyone can read standings" on standings for select using (true);
create policy "Anyone can read top scorers" on top_scorers for select using (true);
