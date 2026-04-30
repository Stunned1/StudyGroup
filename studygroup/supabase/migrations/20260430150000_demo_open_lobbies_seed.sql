-- AI-GENERATED: ChatGPT (GPT-5) — full recorded-demo seed data for users, lobbies, memberships, and schedules
-- AI-ASSISTED: ChatGPT (GPT-5) — resets demo viewer membership so the CS 3704 join step remains recordable
-- AI-ASSISTED: ChatGPT (GPT-5) — fills every seeded lobby with fake peer members and clears Aidan memberships
-- AI-ASSISTED: ChatGPT (GPT-5) — seeds 1-5 reliability ratings for demo profiles
-- Phase 1 demo world seed.
-- Apply after the base schema and `20260430120000_user_weekly_schedule.sql`.

with demo_users(id, email, name, major, year) as (
  values
    ('77777777-7777-4777-8777-777777777777'::uuid, 'anguy98@vt.edu', 'Aidan Nguyen', 'Computer Science', 'Junior'),
    ('11111111-1111-4111-8111-111111111111'::uuid, 'priya.shah@vt.edu', 'Priya Shah', 'Computer Science', 'Junior'),
    ('22222222-2222-4222-8222-222222222222'::uuid, 'marcus.johnson@vt.edu', 'Marcus Johnson', 'Business Information Technology', 'Senior'),
    ('33333333-3333-4333-8333-333333333333'::uuid, 'emily.chen@vt.edu', 'Emily Chen', 'Biochemistry', 'Sophomore'),
    ('44444444-4444-4444-8444-444444444444'::uuid, 'noah.martinez@vt.edu', 'Noah Martinez', 'Mechanical Engineering', 'Junior'),
    ('55555555-5555-4555-8555-555555555555'::uuid, 'ava.williams@vt.edu', 'Ava Williams', 'English', 'Freshman'),
    ('66666666-6666-4666-8666-666666666666'::uuid, 'ethan.nguyen@vt.edu', 'Ethan Nguyen', 'Physics', 'Senior')
)
update auth.users users
set
  encrypted_password = crypt('StudyGroupDemo!2026', gen_salt('bf')),
  email_confirmed_at = coalesce(users.email_confirmed_at, now()),
  raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data = jsonb_build_object('name', demo_users.name),
  updated_at = now()
from demo_users
where users.email = demo_users.email;

with demo_users(id, email, name) as (
  values
    ('77777777-7777-4777-8777-777777777777'::uuid, 'anguy98@vt.edu', 'Aidan Nguyen'),
    ('11111111-1111-4111-8111-111111111111'::uuid, 'priya.shah@vt.edu', 'Priya Shah'),
    ('22222222-2222-4222-8222-222222222222'::uuid, 'marcus.johnson@vt.edu', 'Marcus Johnson'),
    ('33333333-3333-4333-8333-333333333333'::uuid, 'emily.chen@vt.edu', 'Emily Chen'),
    ('44444444-4444-4444-8444-444444444444'::uuid, 'noah.martinez@vt.edu', 'Noah Martinez'),
    ('55555555-5555-4555-8555-555555555555'::uuid, 'ava.williams@vt.edu', 'Ava Williams'),
    ('66666666-6666-4666-8666-666666666666'::uuid, 'ethan.nguyen@vt.edu', 'Ethan Nguyen')
)
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
select
  '00000000-0000-0000-0000-000000000000',
  demo_users.id,
  'authenticated',
  'authenticated',
  demo_users.email,
  crypt('StudyGroupDemo!2026', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('name', demo_users.name),
  now(),
  now()
from demo_users
where not exists (
  select 1
  from auth.users existing
  where existing.email = demo_users.email
)
on conflict (id) do update
set
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = now();

with demo_users(email, name, major, year, reliability_rating) as (
  values
    ('anguy98@vt.edu', 'Aidan Nguyen', 'Computer Science', 'Junior', 5),
    ('priya.shah@vt.edu', 'Priya Shah', 'Computer Science', 'Junior', 5),
    ('marcus.johnson@vt.edu', 'Marcus Johnson', 'Business Information Technology', 'Senior', 4),
    ('emily.chen@vt.edu', 'Emily Chen', 'Biochemistry', 'Sophomore', 5),
    ('noah.martinez@vt.edu', 'Noah Martinez', 'Mechanical Engineering', 'Junior', 4),
    ('ava.williams@vt.edu', 'Ava Williams', 'English', 'Freshman', 3),
    ('ethan.nguyen@vt.edu', 'Ethan Nguyen', 'Physics', 'Senior', 4)
)
insert into public.profiles (id, email, name, major, year, reliability_rating)
select
  auth_users.id,
  demo_users.email,
  demo_users.name,
  demo_users.major,
  demo_users.year,
  demo_users.reliability_rating
from demo_users
join auth.users auth_users on auth_users.email = demo_users.email
on conflict (id) do update
set
  email = excluded.email,
  name = excluded.name,
  major = excluded.major,
  year = excluded.year,
  reliability_rating = excluded.reliability_rating;

insert into public.lobbies (
  id,
  host_id,
  course_id,
  location,
  description,
  max_size,
  created_at,
  expires_at
)
values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    '11111111-1111-4111-8111-111111111111',
    'CS 3704',
    'Newman Library',
    'Software engineering project planning and sprint backlog cleanup before the next team milestone.',
    6,
    now() - interval '8 minutes',
    '2099-12-31 23:59:59+00'::timestamptz
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
    '11111111-1111-4111-8111-111111111111',
    'CS 3114',
    'Torgersen Hall',
    'Data structures exam review with practice problems and whiteboard walkthroughs.',
    6,
    now() - interval '15 minutes',
    '2099-12-31 23:59:59+00'::timestamptz
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
    '22222222-2222-4222-8222-222222222222',
    'BIT 2406',
    'Surge Space',
    'Stats quiz prep with formula sheet review and sample business cases.',
    5,
    now() - interval '18 minutes',
    '2099-12-31 23:59:59+00'::timestamptz
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4',
    '33333333-3333-4333-8333-333333333333',
    'CHEM 1035',
    'Goodwin Hall',
    'General chemistry study group focused on stoichiometry and lab prep.',
    4,
    now() - interval '24 minutes',
    '2099-12-31 23:59:59+00'::timestamptz
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5',
    '44444444-4444-4444-8444-444444444444',
    'PHYS 2305',
    'McBryde Hall',
    'Mechanics problem set help for forces, energy, and circular motion.',
    6,
    now() - interval '31 minutes',
    '2099-12-31 23:59:59+00'::timestamptz
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6',
    '55555555-5555-4555-8555-555555555555',
    'ENGL 1106',
    'D2 (Dietrick)',
    'Peer editing session for research drafts before the next Canvas deadline.',
    4,
    now() - interval '36 minutes',
    '2099-12-31 23:59:59+00'::timestamptz
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa7',
    '66666666-6666-4666-8666-666666666666',
    'MATH 1226',
    'Newman Library',
    'Calculus II homework sprint for sequences, series, and integration techniques.',
    5,
    now() - interval '44 minutes',
    '2099-12-31 23:59:59+00'::timestamptz
  )
on conflict (id) do update
set
  host_id = excluded.host_id,
  course_id = excluded.course_id,
  location = excluded.location,
  description = excluded.description,
  max_size = excluded.max_size,
  expires_at = excluded.expires_at;

delete from public.lobby_members
where lobby_id in (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa7'
  )
  and user_id in (
    select id
    from auth.users
    where email in (
      'anguy98@vt.edu',
      'priya.shah@vt.edu',
      'marcus.johnson@vt.edu',
      'emily.chen@vt.edu',
      'noah.martinez@vt.edu',
      'ava.williams@vt.edu',
      'ethan.nguyen@vt.edu'
    )
  );

insert into public.lobby_members (lobby_id, user_id, joined_at)
values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    '11111111-1111-4111-8111-111111111111',
    now() - interval '8 minutes'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    '22222222-2222-4222-8222-222222222222',
    now() - interval '5 minutes'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
    '11111111-1111-4111-8111-111111111111',
    now() - interval '15 minutes'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
    '22222222-2222-4222-8222-222222222222',
    now() - interval '12 minutes'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
    '66666666-6666-4666-8666-666666666666',
    now() - interval '9 minutes'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
    '22222222-2222-4222-8222-222222222222',
    now() - interval '18 minutes'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
    '11111111-1111-4111-8111-111111111111',
    now() - interval '14 minutes'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
    '55555555-5555-4555-8555-555555555555',
    now() - interval '10 minutes'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4',
    '33333333-3333-4333-8333-333333333333',
    now() - interval '24 minutes'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4',
    '44444444-4444-4444-8444-444444444444',
    now() - interval '20 minutes'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4',
    '55555555-5555-4555-8555-555555555555',
    now() - interval '17 minutes'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5',
    '44444444-4444-4444-8444-444444444444',
    now() - interval '31 minutes'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5',
    '33333333-3333-4333-8333-333333333333',
    now() - interval '26 minutes'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5',
    '66666666-6666-4666-8666-666666666666',
    now() - interval '22 minutes'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6',
    '55555555-5555-4555-8555-555555555555',
    now() - interval '36 minutes'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6',
    '11111111-1111-4111-8111-111111111111',
    now() - interval '32 minutes'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6',
    '33333333-3333-4333-8333-333333333333',
    now() - interval '29 minutes'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa7',
    '66666666-6666-4666-8666-666666666666',
    now() - interval '44 minutes'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa7',
    '22222222-2222-4222-8222-222222222222',
    now() - interval '40 minutes'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa7',
    '44444444-4444-4444-8444-444444444444',
    now() - interval '37 minutes'
  )
on conflict (lobby_id, user_id) do update
set joined_at = excluded.joined_at;

delete from public.schedule_classes
where user_id in (
  select id
  from auth.users
  where email in (
    'anguy98@vt.edu',
    'priya.shah@vt.edu',
    'marcus.johnson@vt.edu',
    'emily.chen@vt.edu',
    'noah.martinez@vt.edu',
    'ava.williams@vt.edu',
    'ethan.nguyen@vt.edu'
  )
);

insert into public.schedule_classes (
  user_id,
  course_name,
  location,
  day_of_week,
  start_time,
  end_time,
  color
)
values
  (
    (select id from auth.users where email = 'anguy98@vt.edu'),
    'CS 3704',
    'McBryde 100',
    2,
    '17:00',
    '18:15',
    '#8b7bff'
  ),
  (
    (select id from auth.users where email = 'anguy98@vt.edu'),
    'CS 3704',
    'McBryde 100',
    4,
    '17:00',
    '18:15',
    '#8b7bff'
  ),
  (
    (select id from auth.users where email = 'anguy98@vt.edu'),
    'CS 3114',
    'Torgersen 2150',
    1,
    '09:00',
    '10:15',
    '#06b6d4'
  ),
  (
    (select id from auth.users where email = 'anguy98@vt.edu'),
    'CS 3114',
    'Torgersen 2150',
    3,
    '09:00',
    '10:15',
    '#06b6d4'
  ),
  (
    (select id from auth.users where email = 'anguy98@vt.edu'),
    'MATH 1226',
    'McBryde 231',
    1,
    '13:00',
    '14:15',
    '#22c55e'
  ),
  (
    (select id from auth.users where email = 'anguy98@vt.edu'),
    'MATH 1226',
    'McBryde 231',
    3,
    '13:00',
    '14:15',
    '#22c55e'
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    'CS 3704',
    'McBryde 100',
    2,
    '17:00',
    '18:15',
    '#8b7bff'
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    'CS 3704',
    'McBryde 100',
    4,
    '17:00',
    '18:15',
    '#8b7bff'
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    'COMM 2004',
    'Pamplin 30',
    1,
    '11:00',
    '12:15',
    '#f97316'
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    'COMM 2004',
    'Pamplin 30',
    3,
    '11:00',
    '12:15',
    '#f97316'
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    'STAT 3615',
    'Newman Library',
    2,
    '13:00',
    '14:15',
    '#22c55e'
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    'STAT 3615',
    'Newman Library',
    4,
    '13:00',
    '14:15',
    '#22c55e'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'CS 3704',
    'McBryde 100',
    2,
    '17:00',
    '18:15',
    '#8b7bff'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'CS 3704',
    'McBryde 100',
    4,
    '17:00',
    '18:15',
    '#8b7bff'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'BIT 2406',
    'Surge Space',
    1,
    '10:30',
    '11:45',
    '#ec4899'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'BIT 2406',
    'Surge Space',
    3,
    '10:30',
    '11:45',
    '#ec4899'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'CHEM 1035',
    'Goodwin Hall',
    1,
    '09:30',
    '10:45',
    '#f97316'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'CHEM 1035',
    'Goodwin Hall',
    3,
    '09:30',
    '10:45',
    '#f97316'
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'PHYS 2305',
    'McBryde Hall',
    2,
    '11:00',
    '12:15',
    '#06b6d4'
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'PHYS 2305',
    'McBryde Hall',
    4,
    '11:00',
    '12:15',
    '#06b6d4'
  );
