-- 1. Create Conversations table
create table if not exists conversations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  participant_ids uuid[] not null -- Array of user IDs in the conversation
);

-- 2. Create Messages table
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references conversations(id) on delete cascade not null,
  sender_id uuid references actors(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_read boolean default false
);

-- 3. Enable RLS
alter table conversations enable row level security;
alter table messages enable row level security;

-- 4. RLS Policies
create policy "Users can view their conversations" on conversations
  for select using (auth.uid() = any(participant_ids));

create policy "Users can view messages in their conversations" on messages
  for select using (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
      and auth.uid() = any(conversations.participant_ids)
    )
  );

create policy "Users can send messages in their conversations" on messages
  for insert with check (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
      and auth.uid() = any(conversations.participant_ids)
    )
    and auth.uid() = sender_id
  );
