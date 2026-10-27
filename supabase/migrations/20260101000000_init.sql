-- Gym App MVP schema. Offline-created rows use client-generated UUIDs, so inserts upsert idempotently.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  goal text check (goal in ('build_muscle', 'lose_fat', 'strength', 'general_fitness')),
  experience_level text check (experience_level in ('beginner', 'intermediate', 'advanced')),
  days_per_week smallint check (days_per_week between 1 and 7),
  created_at timestamptz not null default now()
);

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  muscle_group text not null,
  equipment text not null,
  difficulty text not null check (difficulty in ('beginner', 'intermediate', 'advanced')),
  instructions text not null
);

create table public.exercise_media (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  storage_path text not null,
  angle text check (angle in ('front', 'side')),
  media_type text not null check (media_type in ('video', 'poster'))
);

create table public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  is_active boolean not null default false
);

create table public.plan_days (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.workout_plans (id) on delete cascade,
  name text not null,
  weekday smallint check (weekday between 0 and 6)
);

create table public.plan_exercises (
  id uuid primary key default gen_random_uuid(),
  plan_day_id uuid not null references public.plan_days (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id),
  position smallint not null,
  target_sets smallint not null default 3,
  min_reps smallint not null default 8,
  max_reps smallint not null default 12,
  rest_seconds smallint not null default 90
);

create table public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_day_id uuid references public.plan_days (id) on delete set null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  status text not null default 'active' check (status in ('active', 'completed', 'abandoned'))
);

create table public.session_exercises (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id),
  position smallint not null
);

create table public.exercise_sets (
  id uuid primary key default gen_random_uuid(),
  session_exercise_id uuid not null references public.session_exercises (id) on delete cascade,
  set_number smallint not null,
  weight_kg numeric(6, 2) not null default 0,
  reps smallint not null,
  completed_at timestamptz not null default now()
);

create table public.body_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  weight_kg numeric(5, 2) not null,
  recorded_at timestamptz not null default now()
);

-- One active session per user keeps offline sync conflict-free for the MVP.
create unique index one_active_session_per_user on public.workout_sessions (user_id) where status = 'active';

-- Row level security
alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.exercise_media enable row level security;
alter table public.workout_plans enable row level security;
alter table public.plan_days enable row level security;
alter table public.plan_exercises enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.session_exercises enable row level security;
alter table public.exercise_sets enable row level security;
alter table public.body_metrics enable row level security;

-- Curated content: readable by signed-in users, writable only via the service role.
create policy "exercises_read" on public.exercises for select to authenticated using (true);
create policy "exercise_media_read" on public.exercise_media for select to authenticated using (true);

create policy "profiles_owner" on public.profiles for all to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy "workout_plans_owner" on public.workout_plans for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "workout_sessions_owner" on public.workout_sessions for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "body_metrics_owner" on public.body_metrics for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "plan_days_owner" on public.plan_days for all to authenticated
  using (exists (select 1 from public.workout_plans p where p.id = plan_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.workout_plans p where p.id = plan_id and p.user_id = auth.uid()));
create policy "plan_exercises_owner" on public.plan_exercises for all to authenticated
  using (exists (select 1 from public.plan_days d join public.workout_plans p on p.id = d.plan_id
                 where d.id = plan_day_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.plan_days d join public.workout_plans p on p.id = d.plan_id
                      where d.id = plan_day_id and p.user_id = auth.uid()));
create policy "session_exercises_owner" on public.session_exercises for all to authenticated
  using (exists (select 1 from public.workout_sessions s where s.id = session_id and s.user_id = auth.uid()))
  with check (exists (select 1 from public.workout_sessions s where s.id = session_id and s.user_id = auth.uid()));
create policy "exercise_sets_owner" on public.exercise_sets for all to authenticated
  using (exists (select 1 from public.session_exercises se join public.workout_sessions s on s.id = se.session_id
                 where se.id = session_exercise_id and s.user_id = auth.uid()))
  with check (exists (select 1 from public.session_exercises se join public.workout_sessions s on s.id = se.session_id
                      where se.id = session_exercise_id and s.user_id = auth.uid()));
