-- Anti-abuse: one answer per card per session, rate limits, single-use challenges.
-- No IP is stored: rate-limit keys are HMACs of the IP with a salt that changes every day.

alter table public.answers
  add constraint answers_one_per_card_per_session unique (session_id, card_id, card_version);

create table public.rate_limits (
  key_hash text not null,
  scope text not null,
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (key_hash, scope, window_start)
);

create table public.used_challenges (
  nonce text primary key,
  expires_at timestamptz not null
);

-- RLS on with no policy: these tables are only reachable through the functions below.
alter table public.rate_limits enable row level security;
alter table public.used_challenges enable row level security;

-- Counts one hit and returns whether the caller is still under the limit.
-- Rows older than a day are purged on the way, so keys never outlive their daily salt.
create function public.hit_rate_limit(
  p_key text,
  p_scope text,
  p_window_seconds integer,
  p_limit integer
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window timestamptz :=
    to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_hits integer;
begin
  delete from public.rate_limits where window_start < now() - interval '1 day';

  insert into public.rate_limits as r (key_hash, scope, window_start, hits)
  values (p_key, p_scope, v_window, 1)
  on conflict (key_hash, scope, window_start) do update set hits = r.hits + 1
  returning r.hits into v_hits;

  return v_hits <= p_limit;
end;
$$;

-- Marks a solved challenge as spent. Returns false when it was already used (replay).
create function public.consume_challenge(
  p_nonce text,
  p_expires_at timestamptz
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.used_challenges where expires_at < now();

  insert into public.used_challenges (nonce, expires_at)
  values (p_nonce, p_expires_at)
  on conflict (nonce) do nothing;

  return found;
end;
$$;

revoke all on function public.hit_rate_limit(text, text, integer, integer) from public;
revoke all on function public.consume_challenge(text, timestamptz) from public;
grant execute on function public.hit_rate_limit(text, text, integer, integer) to anon, authenticated;
grant execute on function public.consume_challenge(text, timestamptz) to anon, authenticated;
