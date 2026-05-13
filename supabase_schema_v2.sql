-- [Previous actors table code...]

-- Create a table for trials
create table trials (
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

-- RLS for trials
alter table trials enable row level security;

create policy "Trials are viewable by everyone." on trials
  for select using (true);

create policy "Clubs can insert their own trials." on trials
  for insert with check (
    exists (
      select 1 from actors
      where id = auth.uid() and role = 'CLUB'
    )
  );

create policy "Clubs can update their own trials." on trials
  for update using (auth.uid() = club_id);

-- Create a table for trial applications
create table trial_applications (
  id uuid default gen_random_uuid() primary key,
  trial_id uuid references trials(id) on delete cascade not null,
  player_id uuid references actors(id) on delete cascade not null,
  status text check (status in ('PENDING', 'ACCEPTED', 'REJECTED')) default 'PENDING',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(trial_id, player_id)
);

-- RLS for applications
alter table trial_applications enable row level security;

create policy "Players can view their own applications." on trial_applications
  for select using (auth.uid() = player_id);

create policy "Clubs can view applications for their trials." on trial_applications
  for select using (
    exists (
      select 1 from trials
      where id = trial_applications.trial_id and club_id = auth.uid()
    )
  );

create policy "Players can apply for trials." on trial_applications
  for insert with check (
    exists (
      select 1 from actors
      where id = auth.uid() and role = 'PLAYER'
    )
  );
