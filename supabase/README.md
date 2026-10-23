# Phase 3 schema draft (not applied anywhere)

This is a **reviewable draft, not a deployment**. Nothing in this folder has been run
against any Supabase project, live or otherwise. I don't have the credentials to run it
even if I wanted to — `index.html`'s `SUPA.key` (added in F7) is a public, client-safe
key by design, never the `service_role` key that DDL requires.

## What this is for

`BUILD_PLAN.md`'s Phase 3 (Supabase backend: accounts, child profiles, Hamon ng Araw
scores, content admin) needs a real schema and Row Level Security policies for
**children's personal data**. That needs a privacy/consent review before it's real, not
just a working SQL file — so this is scoped as reference material for that review and
for whoever does the real Phase 3 later, not a deliverable to merge and run.

It targets the **same Supabase project F7 already wired up** (`SUPA.url` in
`index.html`) rather than standing up a second one — Jace owns that project's admin
access; applying this for real is his and the team's call, after the decisions below
are actually made.

## Open decisions this draft does NOT make for the team

- **Admin access to `content_items`.** BUILD_PLAN says "a protected `/admin` page to
  edit content_items" but doesn't say who counts as admin. This draft leaves
  `content_items` writable only by the `service_role` (i.e. no client-side write policy
  at all) until the team decides how admin auth works.
- **Joining a class by code.** Guardians need to turn a `join_code` into a `class_id`
  without being able to read the full `classes` table (teacher-only per BUILD_PLAN).
  That needs a `security definer` function or Edge Function, not a plain RLS policy —
  not included here, flagged as a TODO in the migration file.
- **Matching `match_results` back to a child.** BUILD_PLAN's own spec stores players as
  `{nickname, char, korona, piso}` JSON with no `child_id`. Since nicknames reroll
  (F8.1), there's no stable way to implement "guardian reads own child's match
  results" as written. This draft includes the table as specified and flags the gap
  rather than silently inventing a new column.
- **Whether Supabase (vs. anything else) is actually the final call.** D3 in the PRD
  says "decide by Nov 1" — F7's existing integration suggests the team is already
  moving on Supabase in practice, but this draft doesn't treat that as a closed
  decision on the data/privacy side, which is a separate question from the
  realtime-rooms side F7 already uses it for.

## Files

- `migrations/20261023120000_phase3_schema_draft.sql` — the 10 tables and RLS policies
  from BUILD_PLAN's "Data model" section, as literally as that spec allows.
- `RLS_TEST_PLAN.md` — how to verify the policies once (if) this is ever applied for
  real; written as a manual test plan since I can't run it against a live project from
  here.
