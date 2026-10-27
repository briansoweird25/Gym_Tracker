import type { Angle, ExerciseMedia } from '../types';

export function pickMedia(media: ExerciseMedia[], angle: Angle) {
  const videos = media.filter((m) => m.media_type === 'video');
  return {
    video: videos.find((m) => m.angle === angle) ?? videos[0] ?? null,
    poster: media.find((m) => m.media_type === 'poster') ?? null,
    angles: [...new Set(videos.map((m) => m.angle).filter((a): a is Angle => !!a))].sort(),
  };
}

/** Public URL of a file in the `exercise-media` storage bucket. */
export const mediaUrl = (storagePath: string) =>
  `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/exercise-media/${storagePath}`;
