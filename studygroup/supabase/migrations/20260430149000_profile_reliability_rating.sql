-- AI-GENERATED: ChatGPT (GPT-5) — adds 1-5 profile reliability ratings for demo trust signals
alter table public.profiles
  add column if not exists reliability_rating smallint not null default 4;

alter table public.profiles
  drop constraint if exists profiles_reliability_rating_range;

alter table public.profiles
  add constraint profiles_reliability_rating_range
  check (reliability_rating between 1 and 5);
