-- 1. Create the bucket
insert into storage.buckets (id, name, public)
values ('nextup-media', 'nextup-media', true)
on conflict (id) do nothing;

-- 2. Allow public access to view images
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'nextup-media' );

-- 3. Allow authenticated users to upload images
create policy "Authenticated users can upload images"
on storage.objects for insert
with check (
  bucket_id = 'nextup-media' 
  and auth.role() = 'authenticated'
);

-- 4. Allow users to update/delete their own images
-- Current implementation uses: avatars/userId-random.ext
create policy "Users can update their own images"
on storage.objects for update
using ( 
  bucket_id = 'nextup-media' 
  and (storage.filename(name)) ilike auth.uid()::text || '-%'
);

create policy "Users can delete their own images"
on storage.objects for delete
using ( 
  bucket_id = 'nextup-media' 
  and (storage.filename(name)) ilike auth.uid()::text || '-%'
);
