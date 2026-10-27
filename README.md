# Gym Tracker

Beginner muscle-building workout tracker. iOS-first, Android-compatible. One Expo app plus Supabase (see `Gym_App_Architecture.pdf`).

## Setup

1. `npm install`
2. Create a Supabase project and run the SQL in `supabase/migrations/` in order (schema + RLS, then the starter exercises and the public `exercise-media` bucket).
3. Copy `.env.example` to `.env` and set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
4. `npx expo start`

Exercise demo videos are **not** included. Create or license short looping MP4s, upload them to the `exercise-media` bucket and add `exercise_media` rows (`media_type` `video` with optional `angle` `front`/`side`, and a `poster`). Until then the demo area shows "No demo available".

## Tests

| Command | What it covers |
| --- | --- |
| `npm test` | Unit and component tests (jest): validation, auth gate, filters, planner, workout logic, no-remount player, SQLite persistence and sync, progress stats |
| `npm run test:db` | Real Postgres (PGlite) run of the migrations: row level security, idempotent upserts, one active session |
| `npm run typecheck` | TypeScript |

## Release acceptance checklist

| Item | Automated coverage | Still needs a device |
| --- | --- | --- |
| Create account, choose goals, save a routine | validation + gate + builder tests | Real Supabase sign-up/sign-in and routine save |
| Looping demo while logging, without restarting playback | `ActiveWorkout.test.tsx` (video mounts once through typing, sets, exercise change) | Visual check of real expo-video playback |
| Completed sets survive restart; offline sessions sync without duplicates | `offline.test.ts`, `tests-db` upsert test | Airplane-mode run on a phone |
| Rest timer, next/previous exercise, history and progress | `workout.test.ts`, `progress.test.ts`, component test | Charts rendering on device |
| Private records inaccessible to other users | `tests-db/rls.test.mjs` | — |

## Builds

`eas.json` defines development, preview and production profiles (`eas build --profile preview --platform ios`). Set the iOS bundle identifier and Android package in `app.json` to your own before the first build.
