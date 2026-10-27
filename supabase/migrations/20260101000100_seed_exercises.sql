-- Small curated starter set. Demo videos are NOT seeded: they must be created or licensed,
-- uploaded to the public `exercise-media` bucket and referenced from exercise_media.
insert into public.exercises (name, muscle_group, equipment, difficulty, instructions) values
  ('Barbell Back Squat', 'legs', 'barbell', 'intermediate', 'Bar on upper back, feet shoulder-width. Brace your core, sit down and back until thighs are at least parallel, then drive up through mid-foot.'),
  ('Goblet Squat', 'legs', 'dumbbell', 'beginner', 'Hold one dumbbell at your chest. Keep your torso upright, squat between your knees, then stand tall.'),
  ('Leg Press', 'legs', 'machine', 'beginner', 'Feet shoulder-width on the platform. Lower until knees reach about 90 degrees, then press without locking the knees.'),
  ('Romanian Deadlift', 'hamstrings', 'barbell', 'intermediate', 'Soft knees, hinge at the hips pushing them back, keep the bar close to your legs, stop at a hamstring stretch, then drive hips forward.'),
  ('Barbell Bench Press', 'chest', 'barbell', 'intermediate', 'Lie with eyes under the bar, shoulder blades pinched. Lower to mid-chest under control, then press up and slightly back.'),
  ('Push-Up', 'chest', 'bodyweight', 'beginner', 'Hands under shoulders, body in a straight line. Lower your chest to the floor, then press back up.'),
  ('Dumbbell Shoulder Press', 'shoulders', 'dumbbell', 'beginner', 'Dumbbells at shoulder height. Press overhead until arms are straight without arching your back, then lower slowly.'),
  ('Dumbbell Lateral Raise', 'shoulders', 'dumbbell', 'beginner', 'Slight elbow bend, raise arms out to shoulder height, pause, then lower slowly. Avoid swinging.'),
  ('Lat Pulldown', 'back', 'machine', 'beginner', 'Grip slightly wider than shoulders. Pull the bar to your upper chest by driving elbows down, then control it back up.'),
  ('Seated Cable Row', 'back', 'machine', 'beginner', 'Sit tall, pull the handle to your lower ribs squeezing shoulder blades together, then extend arms with control.'),
  ('Dumbbell Biceps Curl', 'biceps', 'dumbbell', 'beginner', 'Elbows pinned to your sides. Curl the dumbbells up, squeeze at the top, then lower slowly.'),
  ('Triceps Pushdown', 'triceps', 'machine', 'beginner', 'Elbows pinned to your sides. Push the handle down until arms are straight, then return until forearms are just past 90 degrees.'),
  ('Plank', 'core', 'bodyweight', 'beginner', 'Forearms on the floor, body in a straight line from head to heels. Brace your abs and hold without letting hips sag.')
on conflict (name) do nothing;

-- Public bucket for demo videos and posters; only the service role can upload.
insert into storage.buckets (id, name, public) values ('exercise-media', 'exercise-media', true)
on conflict (id) do nothing;
