-- Allow Admins to manage leagues
create policy "Admins can manage leagues" on leagues 
  for all using (
    exists (
      select 1 from actors 
      where id = auth.uid() and role = 'ADMIN'
    )
  );

-- Allow Admins to manage standings
create policy "Admins can manage standings" on standings 
  for all using (
    exists (
      select 1 from actors 
      where id = auth.uid() and role = 'ADMIN'
    )
  );

-- Allow Admins to manage top scorers
create policy "Admins can manage top scorers" on top_scorers 
  for all using (
    exists (
      select 1 from actors 
      where id = auth.uid() and role = 'ADMIN'
    )
  );
