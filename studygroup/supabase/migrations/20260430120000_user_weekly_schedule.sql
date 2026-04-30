-- AI-GENERATED: ChatGPT (GPT-5) — account-owned weekly class schedule table with row-level security
-- Weekly schedule entries: each row is one recurring class block for one signed-in user.
-- Apply in Supabase SQL Editor or via `supabase db push` if using CLI.

create table if not exists public.schedule_classes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_name text not null,
  location text,
  day_of_week smallint not null check (day_of_week between 1 and 7),
  start_time time not null,
  end_time time not null,
  color text not null default '#8b7bff',
  created_at timestamptz not null default now(),
  constraint schedule_classes_time_order check (start_time < end_time)
);

alter table public.schedule_classes enable row level security;

drop policy if exists "Users can view own schedule classes" on public.schedule_classes;
create policy "Users can view own schedule classes"
  on public.schedule_classes for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own schedule classes" on public.schedule_classes;
create policy "Users can insert own schedule classes"
  on public.schedule_classes for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own schedule classes" on public.schedule_classes;
create policy "Users can update own schedule classes"
  on public.schedule_classes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own schedule classes" on public.schedule_classes;
create policy "Users can delete own schedule classes"
  on public.schedule_classes for delete
  using (auth.uid() = user_id);

create index if not exists schedule_classes_user_day_start_idx
  on public.schedule_classes (user_id, day_of_week, start_time);
