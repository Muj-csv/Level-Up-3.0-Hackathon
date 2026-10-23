-- Phase 3 schema draft — see supabase/README.md before running this anywhere.
-- NOT applied to any project. Ported from BUILD_PLAN.md's "Data model and realtime
-- events" table. Every RLS policy below implements that table's "Access rule" column
-- as literally as possible; open gaps are called out inline and in the README.

-- ============================================================================
-- guardians: a parent or teacher. id = the Supabase auth user id directly.
-- Access rule: own row only.
-- ============================================================================
create table public.guardians (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('parent', 'teacher')),
  display_name text not null,
  consent_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.guardians enable row level security;

create policy "guardians read own row" on public.guardians
  for select using (auth.uid() = id);
create policy "guardians insert own row" on public.guardians
  for insert with check (auth.uid() = id);
create policy "guardians update own row" on public.guardians
  for update using (auth.uid() = id);

-- ============================================================================
-- child_profiles: nickname + avatar only, per the no-real-names privacy rule.
-- Access rule: guardian only.
-- ============================================================================
create table public.child_profiles (
  id uuid primary key default gen_random_uuid (),
  guardian_id uuid not null references public.guardians (id) on delete cascade,
  nickname text not null,
  avatar_char text not null,
  language text not null default 'fil' check (language in ('fil', 'en')),
  created_at timestamptz not null default now()
);
alter table public.child_profiles enable row level security;

create policy "guardian manages own children" on public.child_profiles
  for all using (auth.uid() = guardian_id) with check (auth.uid() = guardian_id);

-- ============================================================================
-- classes: a teacher's class, joined by a code.
-- Access rule: teacher only.
-- TODO (not solved here): guardians need to resolve a join_code to a class_id
-- to add their child, without being able to read the full teacher-only table.
-- That needs a `security definer` function (e.g. join_class_by_code(code, child_id))
-- or an Edge Function — a plain RLS policy can't express "can look up one row by
-- code, but can't list the table."
-- ============================================================================
create table public.classes (
  id uuid primary key default gen_random_uuid (),
  teacher_id uuid not null references public.guardians (id) on delete cascade,
  name text not null,
  join_code text not null unique,
  created_at timestamptz not null default now()
);
alter table public.classes enable row level security;

create policy "teacher manages own classes" on public.classes
  for all using (auth.uid() = teacher_id) with check (auth.uid() = teacher_id);

-- ============================================================================
-- class_members: which children are in which class.
-- Access rule: teacher and the child's guardian.
-- ============================================================================
create table public.class_members (
  class_id uuid not null references public.classes (id) on delete cascade,
  child_id uuid not null references public.child_profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (class_id, child_id)
);
alter table public.class_members enable row level security;

create policy "teacher reads own class members" on public.class_members
  for select using (
    exists (select 1 from public.classes c where c.id = class_members.class_id and c.teacher_id = auth.uid())
  );
create policy "guardian reads own child's class membership" on public.class_members
  for select using (
    exists (select 1 from public.child_profiles cp where cp.id = class_members.child_id and cp.guardian_id = auth.uid())
  );
create policy "guardian adds own child to a class" on public.class_members
  for insert with check (
    exists (select 1 from public.child_profiles cp where cp.id = class_members.child_id and cp.guardian_id = auth.uid())
  );

-- ============================================================================
-- stamps: Pasaporte ng Laro — a red stamp (played) or gold stamp (outside).
-- Access rule: guardian; teacher of the child's class (and only the teacher can
-- confirm a gold "outside" stamp, per the Barkada Challenge flow in BUILD_PLAN).
-- ============================================================================
create table public.stamps (
  id uuid primary key default gen_random_uuid (),
  child_id uuid not null references public.child_profiles (id) on delete cascade,
  game_key text not null,
  kind text not null check (kind in ('played', 'outside')),
  count integer not null default 1,
  confirmed_by uuid references public.guardians (id),
  updated_at timestamptz not null default now(),
  unique (child_id, game_key, kind)
);
alter table public.stamps enable row level security;

create policy "guardian manages own child's stamps" on public.stamps
  for all using (
    exists (select 1 from public.child_profiles cp where cp.id = stamps.child_id and cp.guardian_id = auth.uid())
  ) with check (
    exists (select 1 from public.child_profiles cp where cp.id = stamps.child_id and cp.guardian_id = auth.uid())
  );
create policy "teacher reads stamps of children in their classes" on public.stamps
  for select using (
    exists (
      select 1
      from public.class_members cm
      join public.classes c on c.id = cm.class_id
      where cm.child_id = stamps.child_id and c.teacher_id = auth.uid()
    )
  );
create policy "teacher confirms a gold stamp for children in their classes" on public.stamps
  for update using (
    exists (
      select 1
      from public.class_members cm
      join public.classes c on c.id = cm.class_id
      where cm.child_id = stamps.child_id and c.teacher_id = auth.uid()
    )
  ) with check (kind = 'outside');

-- ============================================================================
-- best_scores: per-child best minigame score.
-- Access rule: guardian only.
-- ============================================================================
create table public.best_scores (
  id uuid primary key default gen_random_uuid (),
  child_id uuid not null references public.child_profiles (id) on delete cascade,
  game_key text not null,
  score integer not null,
  achieved_at timestamptz not null default now(),
  unique (child_id, game_key)
);
alter table public.best_scores enable row level security;

create policy "guardian manages own child's best scores" on public.best_scores
  for all using (
    exists (select 1 from public.child_profiles cp where cp.id = best_scores.child_id and cp.guardian_id = auth.uid())
  ) with check (
    exists (select 1 from public.child_profiles cp where cp.id = best_scores.child_id and cp.guardian_id = auth.uid())
  );

-- ============================================================================
-- daily_challenges: today's Hamon ng Araw seed, set by an Edge Function.
-- Access rule: public read. No write policy for anon/authenticated on purpose —
-- only the service_role (the Edge Function) can set the day's challenge.
-- ============================================================================
create table public.daily_challenges (
  day date primary key,
  game_key text not null,
  seed bigint not null,
  bot_difficulty integer not null check (bot_difficulty in (0, 1, 2))
);
alter table public.daily_challenges enable row level security;

create policy "anyone can read daily challenges" on public.daily_challenges
  for select using (true);

-- ============================================================================
-- daily_scores: Hamon ng Araw leaderboard, nickname + score only.
-- Access rule: public read of nickname + score only. No insert policy here on
-- purpose — BUILD_PLAN calls for "a score submit endpoint that rejects
-- impossible scores," which means validation logic that belongs in an Edge
-- Function (service_role), not a client-writable RLS policy.
-- ============================================================================
create table public.daily_scores (
  id uuid primary key default gen_random_uuid (),
  day date not null references public.daily_challenges (day),
  child_id uuid references public.child_profiles (id) on delete set null,
  nickname_snapshot text not null,
  score integer not null,
  created_at timestamptz not null default now()
);
alter table public.daily_scores enable row level security;

create policy "anyone can read daily scores" on public.daily_scores
  for select using (true);

-- ============================================================================
-- content_items: trivia / history / outdoor-challenge content, versioned.
-- Access rule: public read when published; admin write.
-- No write policy for anon/authenticated on purpose — "admin" isn't defined
-- anywhere in the schema yet (see README). Writes go through the service_role
-- until the team decides how admin auth works.
-- ============================================================================
create table public.content_items (
  id uuid primary key default gen_random_uuid (),
  type text not null check (type in ('trivia', 'history', 'challenge')),
  game_key text not null,
  lang text not null check (lang in ('fil', 'en')),
  body jsonb not null,
  version integer not null default 1,
  published boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.content_items enable row level security;

create policy "anyone can read published content" on public.content_items
  for select using (published = true);

-- ============================================================================
-- match_results: one row per finished game, for history/analytics.
-- Access rule: insert by server only (no insert policy here — service_role
-- bypasses RLS entirely, which is how "server only" is enforced); guardian
-- reads own child's.
-- GAP (see README): `players` is JSON with nickname only, no child_id, so
-- "guardian reads own child's" can't be implemented as a row filter against
-- this shape. Left as specified rather than silently adding a column; the
-- fix is a team decision (e.g. a parallel `child_ids uuid[]` column written
-- by the same server code that inserts the row).
-- ============================================================================
create table public.match_results (
  id uuid primary key default gen_random_uuid (),
  mode text not null check (mode in ('party', 'torneo', 'hamon')),
  rounds integer not null,
  finished_at timestamptz not null default now(),
  players jsonb not null
);
alter table public.match_results enable row level security;
-- No select policy yet — see the GAP note above. Leaving this table
-- unreadable by anon/authenticated until that's resolved is safer than
-- guessing at a policy that doesn't match the real data shape.
