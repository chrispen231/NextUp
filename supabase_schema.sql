-- Create a table for profiles (actors)
create table actors (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  display_name text,
  role text check (role in ('PLAYER', 'AGENT', 'SCOUT', 'CLUB', 'ADMIN')) not null,
  status text check (status in ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED')) default 'UNVERIFIED',
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table actors enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone." on actors
  for select using (true);

create policy "Users can insert their own profile." on actors
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on actors
  for update using (auth.uid() = id);

-- Create a function to handle updated_at
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create a trigger for updated_at
create trigger set_updated_at
  before update on actors
  for each row
  execute function handle_updated_at();
