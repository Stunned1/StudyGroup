-- AI-GENERATED: ChatGPT (GPT-5) — keeps existing lobbies visible by moving expiration far into the future
-- The app no longer treats study lobbies as time-limited; lobbies remain until manually closed.

update public.lobbies
set expires_at = '2099-12-31 23:59:59+00'::timestamptz
where expires_at < '2099-12-31 23:59:59+00'::timestamptz;
