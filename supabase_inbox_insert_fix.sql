-- Add an insert policy for conversations
create policy "Users can create conversations" on conversations
  for insert with check (
    auth.uid() = any(participant_ids)
  );
