create table if not exists scheduled_lobbies (
  id              uuid        primary key default gen_random_uuid(),
  host_id         uuid        not null references profiles(id) on delete cascade,
  course_id       text        not null,
  location        text        not null,
  description     text,
  max_size        integer     not null default 5,
  duration_minutes integer    not null default 60,
  scheduled_for   timestamptz not null,
  triggered       boolean     not null default false,
  triggered_at    timestamptz,
  created_at      timestamptz not null default now()
);

alter table scheduled_lobbies enable row level security;

create policy "Users manage own scheduled lobbies"
  on scheduled_lobbies for all
  using  (host_id = auth.uid())
  with check (host_id = auth.uid());
