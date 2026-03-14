-- ================================================
-- GALERIA APP — Execute este SQL no Supabase
-- Menu: SQL Editor → New query → Cole tudo abaixo
-- ================================================

-- 1. Tabela de álbuns
create table albums (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users on delete cascade not null,
  name        text not null,
  cover_url   text,
  created_at  timestamptz default now() not null
);

-- 2. Tabela de fotos
create table photos (
  id          uuid default gen_random_uuid() primary key,
  album_id    uuid references albums on delete cascade not null,
  user_id     uuid references auth.users on delete cascade not null,
  url         text not null,
  filename    text not null,
  size        bigint,
  created_at  timestamptz default now() not null
);

-- 3. Ativar segurança por linha (RLS)
alter table albums enable row level security;
alter table photos enable row level security;

-- 4. Regras de acesso para álbuns
create policy "Ver próprios álbuns"    on albums for select  using (auth.uid() = user_id);
create policy "Criar álbum"            on albums for insert  with check (auth.uid() = user_id);
create policy "Editar álbum"           on albums for update  using (auth.uid() = user_id);
create policy "Apagar álbum"           on albums for delete  using (auth.uid() = user_id);

-- 5. Regras de acesso para fotos
create policy "Ver próprias fotos"     on photos for select  using (auth.uid() = user_id);
create policy "Adicionar foto"         on photos for insert  with check (auth.uid() = user_id);
create policy "Editar foto"            on photos for update  using (auth.uid() = user_id);
create policy "Apagar foto"            on photos for delete  using (auth.uid() = user_id);

-- 6. Bucket de armazenamento (depois faça via interface do Supabase)
-- Vá em: Storage → Create bucket → nome: "photos" → marque "Public"

-- 7. Regras de armazenamento (cole numa segunda query após criar o bucket)
create policy "Upload de fotos" on storage.objects
  for insert with check (
    bucket_id = 'photos' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Ver fotos públicas" on storage.objects
  for select using (bucket_id = 'photos');

create policy "Apagar próprias fotos" on storage.objects
  for delete using (
    bucket_id = 'photos' and
    auth.uid()::text = (storage.foldername(name))[1]
  );
