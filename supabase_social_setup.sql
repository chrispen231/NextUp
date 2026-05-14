-- Social features for clips: likes, comments, and shares

-- 1. Create likes table
create table if not exists clip_likes (
  id uuid default gen_random_uuid() primary key,
    clip_id uuid references clips(id) on delete cascade not null,
      user_id uuid references actors(id) on delete cascade not null,
        created_at timestamp with time zone default timezone('utc'::text, now()) not null,
          unique(clip_id, user_id)
          );

          -- 2. Create comments table
          create table if not exists clip_comments (
            id uuid default gen_random_uuid() primary key,
              clip_id uuid references clips(id) on delete cascade not null,
                user_id uuid references actors(id) on delete cascade not null,
                  content text not null,
                    created_at timestamp with time zone default timezone('utc'::text, now()) not null
                    );

                    -- 3. Create shares table (for tracking shares)
                    create table if not exists clip_shares (
                      id uuid default gen_random_uuid() primary key,
                        clip_id uuid references clips(id) on delete cascade not null,
                          user_id uuid references actors(id) on delete cascade not null,
                            platform text, -- 'native', 'whatsapp', 'twitter', etc.
                              created_at timestamp with time zone default timezone('utc'::text, now()) not null
                              );

                              -- 4. Create player favorites table
                              create table if not exists player_favorites (
                                id uuid default gen_random_uuid() primary key,
                                  player_id uuid references actors(id) on delete cascade not null,
                                    user_id uuid references actors(id) on delete cascade not null,
                                      created_at timestamp with time zone default timezone('utc'::text, now()) not null,
                                        unique(player_id, user_id)
                                        );

                              -- 5. Enable RLS for all tables
                              alter table clip_likes enable row level security;
                              alter table clip_comments enable row level security;
                              alter table clip_shares enable row level security;
                              alter table player_favorites enable row level security;

                              -- 6. Policies for likes
                              create policy "Anyone can view likes" on clip_likes
                                for select using (true);

                                create policy "Authenticated users can like clips" on clip_likes
                                  for insert with check (auth.uid() = user_id);

                                  create policy "Users can unlike their own likes" on clip_likes
                                    for delete using (auth.uid() = user_id);

                                    -- 6. Policies for comments
                                    create policy "Anyone can view comments" on clip_comments
                                      for select using (true);

                                      create policy "Authenticated users can comment" on clip_comments
                                        for insert with check (auth.uid() = user_id);

                                        create policy "Users can delete their own comments" on clip_comments
                                          for delete using (auth.uid() = user_id);

                                          -- 7. Policies for shares
                                          create policy "Anyone can view shares count" on clip_shares
                                            for select using (true);

                                            create policy "Authenticated users can share clips" on clip_shares
                                              for insert with check (auth.uid() = user_id);

                                            create policy "Anyone can view player favorites" on player_favorites
                                              for select using (true);

                                            create policy "Authenticated agents, scouts, and clubs can favorite players" on player_favorites
                                              for insert with check (
                                                auth.uid() = user_id
                                                and exists (select 1 from actors where id = player_id and role = 'PLAYER')
                                                and exists (select 1 from actors where id = auth.uid() and role in ('AGENT', 'SCOUT', 'CLUB'))
                                              );

                                            create policy "Users can remove their own player favorites" on player_favorites
                                              for delete using (
                                                auth.uid() = user_id
                                                and exists (select 1 from actors where id = player_id and role = 'PLAYER')
                                              );