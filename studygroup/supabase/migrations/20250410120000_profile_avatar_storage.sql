-- Profile avatars: column + public storage bucket + RLS
-- Apply in Supabase SQL Editor or via `supabase db push` if using CLI.

alter table public.profiles
  add column if not exists avatar_url text;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;

-- Storage: anyone can read avatar images (public bucket URLs)
drop policy if exists "Avatar images are publicly accessible" on storage.objects;
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Users may upload only under their user id folder: {uid}/...
drop policy if exists "Users can upload own avatar" on storage.objects;
create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and coalesce((string_to_array(name, '/'))[1], '') = auth.uid()::text
  );

drop policy if exists "Users can update own avatar" on storage.objects;
create policy "Users can update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and coalesce((string_to_array(name, '/'))[1], '') = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and coalesce((string_to_array(name, '/'))[1], '') = auth.uid()::text
  );

drop policy if exists "Users can delete own avatar" on storage.objects;
create policy "Users can delete own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and coalesce((string_to_array(name, '/'))[1], '') = auth.uid()::text
  );

-- Profiles: allow users to update their own row (name/major/year/avatar_url)
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
