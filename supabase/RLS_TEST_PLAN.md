# RLS test plan (manual — write this when the schema is actually applied)

This is a plan, not a runnable test suite — I can't execute SQL against a live
Supabase project from here (no `service_role` key, by design). Whoever applies
`migrations/20261023120000_phase3_schema_draft.sql` for real should turn this into
either Supabase's `pgTAP`-based test runner or a small script using two separate
authenticated clients. BUILD_PLAN's Phase 3 gate is explicit: *"a stamp earned on one
device appears on another; RLS tests prove a parent sees only their own children."*

## Setup

1. Create two guardian accounts (A and B), each with one child profile.
2. Create one teacher account (T) with a class, and add guardian A's child to it.

## Cases to check (each as both a positive and negative test)

| # | As | Action | Expect |
|---|---|---|---|
| 1 | Guardian A | `select * from child_profiles` | Only A's child, never B's |
| 2 | Guardian A | `select * from child_profiles where guardian_id = B.id` | Zero rows, not an error — RLS filters silently |
| 3 | Guardian A | `update child_profiles set nickname = '...' where id = B's child` | Fails (no row matched, since the row isn't visible) |
| 4 | Guardian A | `insert into stamps (child_id, ...) values (B's child, ...)` | Fails the `with check` |
| 5 | Teacher T | `select * from stamps` joined to `class_members` | Only sees stamps for children in T's class (A's child), not B's |
| 6 | Teacher T | `update stamps set kind='outside' where child_id = <A's child, in T's class>` | Succeeds |
| 7 | Teacher T | `update stamps set kind='outside' where child_id = B's child` (not in T's class) | Fails |
| 8 | Anon (no auth) | `select * from daily_scores` | Succeeds — public read |
| 9 | Anon (no auth) | `insert into daily_scores (...)` | Fails — no policy grants this to anon |
| 10 | Anon (no auth) | `select * from content_items where published = false` | Zero rows — only published content is visible |
| 11 | Guardian A | `select * from guardians where id = B.id` | Zero rows |

## Why this matters more than usual

These tables hold children's data. A policy that *looks* right but silently allows a
cross-guardian read (case 2 in particular — RLS failures are quiet, not errors) is
the exact kind of bug BUILD_PLAN's privacy section is worried about. Don't consider
Phase 3 done until each row above has actually been run against a real project with
two real accounts, not just read-reviewed.
