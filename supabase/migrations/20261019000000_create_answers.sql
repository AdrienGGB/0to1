-- One row per swipe. Deliberately holds no identity data: no IP, no user agent, no account.
create table public.answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  card_id text not null,
  card_version integer not null check (card_version > 0),
  answer text not null check (answer in ('yes', 'no', 'dont_know', 'prefer_not')),
  position integer not null check (position >= 0),
  deck_seed bigint not null check (deck_seed >= 0),
  response_ms integer not null check (response_ms >= 0),
  is_fast boolean not null,
  created_at timestamptz not null default now()
);

create index answers_card_idx on public.answers (card_id, card_version);

alter table public.answers enable row level security;

-- Anyone may submit an answer; nobody may read, update or delete through the public API.
-- Analysis goes through the service role or aggregated views only.
create policy "Anyone can insert answers"
  on public.answers
  for insert
  to anon, authenticated
  with check (true);
