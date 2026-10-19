-- End-of-survey summary: each person may pass one priority message (up to 3 themes), and sees
-- how others answered the same cards. Only aggregates leave the database, and only above a
-- minimum count, so a percentage is never computed on a handful of people.

create table public.priority_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique,
  choice text not null check (choice in ('themes', 'dont_know', 'prefer_not')),
  theme_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  -- Themes only when themes were chosen, and then 1 to 3 of them.
  constraint priority_messages_theme_count check (
    (choice = 'themes' and cardinality(theme_ids) between 1 and 3)
    or (choice <> 'themes' and cardinality(theme_ids) = 0)
  )
);

alter table public.priority_messages enable row level security;

create policy "Anyone can insert a priority message"
  on public.priority_messages
  for insert
  to anon, authenticated
  with check (true);

-- Answer distribution per card version, only for versions with at least 100 answers
-- (threshold set in docs/DECISIONS.md; changing it takes a new migration).
create function public.card_answer_stats()
returns table (
  card_id text,
  card_version integer,
  total bigint,
  yes bigint,
  no bigint,
  dont_know bigint,
  prefer_not bigint,
  first_answer_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    a.card_id,
    a.card_version,
    count(*),
    count(*) filter (where a.answer = 'yes'),
    count(*) filter (where a.answer = 'no'),
    count(*) filter (where a.answer = 'dont_know'),
    count(*) filter (where a.answer = 'prefer_not'),
    min(a.created_at)
  from public.answers a
  group by a.card_id, a.card_version
  having count(*) >= 100;
$$;

-- How often each theme was chosen in priority messages, once there are at least 100 messages.
-- "total" counts every message, including "dont_know" and "prefer_not".
create function public.theme_message_stats()
returns table (
  theme_id text,
  chosen bigint,
  total bigint,
  first_message_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  with totals as (
    select count(*) as total, min(created_at) as first_message_at from public.priority_messages
  )
  select t.theme_id, count(*), totals.total, totals.first_message_at
  from public.priority_messages m
  cross join lateral unnest(m.theme_ids) as t(theme_id)
  cross join totals
  where totals.total >= 100
  group by t.theme_id, totals.total, totals.first_message_at;
$$;

revoke all on function public.card_answer_stats() from public;
revoke all on function public.theme_message_stats() from public;
grant execute on function public.card_answer_stats() to anon, authenticated;
grant execute on function public.theme_message_stats() to anon, authenticated;
