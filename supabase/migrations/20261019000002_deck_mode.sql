-- Records how the deck holding each answer was built, so analysis can tell answers to mixed
-- decks (themes interleaved at random) from answers to a theme the person picked: people who
-- choose a theme are self-selected, so per-theme rates differ between the two.
-- Additive with a default: code that does not send the mode keeps inserting 'mixed'.
alter table public.answers
  add column deck_mode text not null default 'mixed' check (deck_mode in ('mixed', 'theme'));
