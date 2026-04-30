-- AI-GENERATED: ChatGPT (GPT-5) — demo seed data with fake VT auth users, profiles, and open lobby rows
-- Demo lobby seed: creates fake auth users/profile rows and realistic open lobbies for a polished demo.
-- Apply in Supabase SQL Editor when preparing the hosted demo database.

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
values
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-4111-8111-111111111111',
    'authenticated',
    'authenticated',
    'priya.shah@vt.edu',
    crypt('StudyGroupDemo!2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Priya Shah"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-4222-8222-222222222222',
    'authenticated',
    'authenticated',
    'marcus.johnson@vt.edu',
    crypt('StudyGroupDemo!2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Marcus Johnson"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '33333333-3333-4333-8333-333333333333',
    'authenticated',
    'authenticated',
    'emily.chen@vt.edu',
    crypt('StudyGroupDemo!2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Emily Chen"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '44444444-4444-4444-8444-444444444444',
    'authenticated',
    'authenticated',
    'noah.martinez@vt.edu',
    crypt('StudyGroupDemo!2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Noah Martinez"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '55555555-5555-4555-8555-555555555555',
    'authenticated',
    'authenticated',
    'ava.williams@vt.edu',
    crypt('StudyGroupDemo!2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Ava Williams"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '66666666-6666-4666-8666-666666666666',
    'authenticated',
    'authenticated',
    'ethan.nguyen@vt.edu',
    crypt('StudyGroupDemo!2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Ethan Nguyen"}'::jsonb,
    now(),
    now()
  )
on conflict (id) do update
set
  email = excluded.email,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = now();

insert into public.profiles (id, email, name, major, year)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'priya.shah@vt.edu',
    'Priya Shah',
    'Computer Science',
    'Junior'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'marcus.johnson@vt.edu',
    'Marcus Johnson',
    'Business Information Technology',
    'Senior'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'emily.chen@vt.edu',
    'Emily Chen',
    'Biochemistry',
    'Sophomore'
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'noah.martinez@vt.edu',
    'Noah Martinez',
    'Mechanical Engineering',
    'Junior'
  ),
  (
    '55555555-5555-4555-8555-555555555555',
    'ava.williams@vt.edu',
    'Ava Williams',
    'English',
    'Freshman'
  ),
  (
    '66666666-6666-4666-8666-666666666666',
    'ethan.nguyen@vt.edu',
    'Ethan Nguyen',
    'Physics',
    'Senior'
  )
on conflict (id) do update
set
  email = excluded.email,
  name = excluded.name,
  major = excluded.major,
  year = excluded.year;

insert into public.lobbies (
  host_id,
  course_id,
  location,
  description,
  max_size,
  created_at,
  expires_at
)
select *
from (
  values
    (
      '11111111-1111-4111-8111-111111111111'::uuid,
      'CS 3114',
      'Torgersen Hall',
      'Data structures exam review with practice problems and whiteboard walkthroughs.',
      6,
      now() - interval '7 minutes',
      '2099-12-31 23:59:59+00'::timestamptz
    ),
    (
      '11111111-1111-4111-8111-111111111111'::uuid,
      'CS 3704',
      'Newman Library',
      'Software engineering project planning and sprint backlog cleanup.',
      5,
      now() - interval '10 minutes',
      '2099-12-31 23:59:59+00'::timestamptz
    ),
    (
      '22222222-2222-4222-8222-222222222222'::uuid,
      'BIT 2406',
      'Surge Space',
      'Stats quiz prep with formula sheet review and sample business cases.',
      5,
      now() - interval '14 minutes',
      '2099-12-31 23:59:59+00'::timestamptz
    ),
    (
      '33333333-3333-4333-8333-333333333333'::uuid,
      'CHEM 1035',
      'Goodwin Hall',
      'General chemistry study group focused on stoichiometry and lab prep.',
      4,
      now() - interval '21 minutes',
      '2099-12-31 23:59:59+00'::timestamptz
    ),
    (
      '44444444-4444-4444-8444-444444444444'::uuid,
      'PHYS 2305',
      'McBryde Hall',
      'Mechanics problem set help for forces, energy, and circular motion.',
      6,
      now() - interval '28 minutes',
      '2099-12-31 23:59:59+00'::timestamptz
    ),
    (
      '55555555-5555-4555-8555-555555555555'::uuid,
      'ENGL 1106',
      'D2 (Dietrick)',
      'Peer editing session for research drafts before the next Canvas deadline.',
      4,
      now() - interval '35 minutes',
      '2099-12-31 23:59:59+00'::timestamptz
    ),
    (
      '66666666-6666-4666-8666-666666666666'::uuid,
      'MATH 1226',
      'Newman Library',
      'Calculus II homework sprint for sequences, series, and integration techniques.',
      5,
      now() - interval '42 minutes',
      '2099-12-31 23:59:59+00'::timestamptz
    )
) as seed_rows (
  host_id,
  course_id,
  location,
  description,
  max_size,
  created_at,
  expires_at
)
where not exists (
  select 1
  from public.lobbies existing
  where existing.host_id = seed_rows.host_id
    and existing.course_id = seed_rows.course_id
    and existing.description = seed_rows.description
);
