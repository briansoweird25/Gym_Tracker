import { ActivityIndicator, Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors } from '../../lib/theme';

export function Button({ title, onPress, loading, variant = 'primary', disabled }: {
  title: string; onPress: () => void; loading?: boolean; variant?: 'primary' | 'secondary'; disabled?: boolean;
}) {
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      className={`min-h-14 items-center justify-center rounded-xl px-4 ${primary ? 'bg-accent' : 'border border-border bg-surface'} ${disabled ? 'opacity-50' : ''}`}
    >
      {loading ? <ActivityIndicator color={primary ? colors.background : colors.text} /> : (
        <Text className={`text-base font-semibold ${primary ? 'text-background' : 'text-text'}`}>{title}</Text>
      )}
    </Pressable>
  );
}

export function TextField({ label, error, ...props }: TextInputProps & { label: string; error?: string }) {
  return (
    <View className="gap-1">
      <Text className="text-sm text-muted">{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.textMuted}
        className="min-h-14 rounded-xl border border-border bg-surface px-4 text-base text-text"
        {...props}
      />
      {error ? <Text className="text-sm text-danger">{error}</Text> : null}
    </View>
  );
}

export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`min-h-12 justify-center rounded-full border px-4 ${selected ? 'border-accent bg-accent' : 'border-border bg-surface'}`}
    >
      <Text className={selected ? 'font-semibold text-background' : 'text-text'}>{label}</Text>
    </Pressable>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <View className="items-center gap-1 p-8">
      <Text className="text-base font-semibold text-text">{title}</Text>
      {hint ? <Text className="text-center text-sm text-muted">{hint}</Text> : null}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View className="items-center gap-3 p-8">
      <Text className="text-center text-danger">{message}</Text>
      {onRetry ? <Button title="Retry" variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}

export function Loading() {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}
