import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { memo, useEffect, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { colors } from '../../lib/theme';
import { mediaUrl, pickMedia } from '../../services/media';
import type { Angle, ExerciseMedia } from '../../types';

const SPEEDS = [0.5, 1, 1.5];

/**
 * Looping, muted exercise demo. Memoized and self-contained so that parent re-renders
 * (typing in the set logger, timers) never remount the video or restart playback.
 */
function Player({ media }: { media: ExerciseMedia[] }) {
  const [angle, setAngle] = useState<Angle>('front');
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(true);
  const { video, poster, angles } = pickMedia(media, angle);
  const uri = video ? mediaUrl(video.storage_path) : null;

  const player = useVideoPlayer(uri ? { uri, useCaching: true } : null, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  useEffect(() => {
    player.playbackRate = speed;
  }, [player, speed]);

  // Reapply play state when the angle swaps the source.
  useEffect(() => {
    if (!uri) return;
    if (playing) player.play();
    else player.pause();
  }, [player, uri, playing]);

  if (!uri) {
    return (
      <View className="aspect-video items-center justify-center overflow-hidden rounded-3xl border border-border bg-surface">
        {poster ? (
          <Image source={{ uri: mediaUrl(poster.storage_path) }} className="h-full w-full" resizeMode="cover" />
        ) : (
          <>
            <Ionicons name="videocam-off-outline" size={28} color={colors.textMuted} />
            <Text className="mt-2 text-muted">No demo available</Text>
          </>
        )}
      </View>
    );
  }

  return (
    <View className="gap-2">
      <View className="aspect-video overflow-hidden rounded-3xl border border-border bg-surface">
        <VideoView player={player} nativeControls={false} contentFit="contain" style={{ width: '100%', height: '100%' }} />
      </View>
      <View className="flex-row items-center gap-2">
        <Pressable accessibilityRole="button" onPress={() => setPlaying((p) => !p)} className="min-h-11 justify-center rounded-xl bg-surface2 px-4">
          <Text className="text-text">{playing ? 'Pause' : 'Play'}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => setSpeed((s) => SPEEDS[(SPEEDS.indexOf(s) + 1) % SPEEDS.length])}
          className="min-h-11 justify-center rounded-xl bg-surface2 px-4"
        >
          <Text className="text-text">{speed}x</Text>
        </Pressable>
        {angles.length > 1 &&
          angles.map((a) => (
            <Pressable key={a} accessibilityRole="button" onPress={() => setAngle(a)} className={`min-h-11 justify-center rounded-xl px-4 ${a === angle ? 'bg-accent' : 'bg-surface2'}`}>
              <Text className={a === angle ? 'text-background' : 'text-text'}>{a === 'front' ? 'Front' : 'Side'}</Text>
            </Pressable>
          ))}
      </View>
    </View>
  );
}

export const ExerciseAnimationPlayer = memo(Player);
