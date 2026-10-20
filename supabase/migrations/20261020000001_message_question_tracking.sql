-- The priority question is a measured question like the cards (docs/NEUTRALITE.md §4 and §6):
-- its themes are shown in a random order per person, and its wording has a version.
-- The table is still empty: no default, every row must say both.
alter table public.priority_messages
  add column question_version integer not null check (question_version > 0),
  add column display_seed bigint not null check (display_seed >= 0);

-- Full distribution of the question, not only the themes chosen (docs/NEUTRALITE.md §8):
-- one row per theme or non-answer, per question version, once that version has 100 messages.
drop function public.theme_message_stats();

create function public.message_choice_stats()
returns table (
  question_version integer,
  option text,
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
    select m.question_version, count(*) as total, min(m.created_at) as first_message_at
    from public.priority_messages m
    group by m.question_version
    having count(*) >= 100
  ),
  options as (
    select m.question_version, unnest(m.theme_ids) as option
    from public.priority_messages m
    where m.choice = 'themes'
    union all
    select m.question_version, m.choice
    from public.priority_messages m
    where m.choice <> 'themes'
  )
  select o.question_version, o.option, count(*), t.total, t.first_message_at
  from options o
  join totals t using (question_version)
  group by o.question_version, o.option, t.total, t.first_message_at;
$$;

revoke all on function public.message_choice_stats() from public;
grant execute on function public.message_choice_stats() to anon, authenticated;
