-- Create Notifications table
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.actors(id) on delete cascade not null, -- The recipient
  type text check (type in ('MESSAGE', 'LIKE', 'COMMENT', 'SHARE', 'VERIFICATION', 'TRIAL')) not null,
  title text not null,
  content text not null,
  link text, -- Path to navigate to when clicked
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.notifications enable row level security;

-- Policies
create policy "Users can view their own notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "Users can update their own notifications (mark as read)" on public.notifications
  for update using (auth.uid() = user_id);

-- System policy to allow inserting notifications (usually triggered by backend or other users' actions)
create policy "Anyone can create notifications for others" on public.notifications
  for insert with check (true);

-- Function to clean up old notifications (Optional)
create or replace function delete_old_notifications()
returns void as $$
begin
  delete from public.notifications where created_at < now() - interval '30 days';
end;
$$ language plpgsql;
