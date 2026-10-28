import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors, gradients } from '../../lib/theme';

type IconName = keyof typeof Ionicons.glyphMap;

export function Button({ title, onPress, loading, variant = 'primary', disabled }: {
  title: string; onPress: () => void; loading?: boolean; variant?: 'primary' | 'secondary' | 'light'; disabled?: boolean;
}) {
  const label = variant === 'secondary' ? 'text-text' : 'text-background';
  const content = loading ? (
    <ActivityIndicator color={variant === 'secondary' ? colors.text : colors.background} />
  ) : (
    <Text className={`text-base font-bold ${label}`}>{title}</Text>
  );
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: disabled ? 0.45 : pressed ? 0.85 : 1 })}
      className={`min-h-14 overflow-hidden rounded-2xl ${variant === 'secondary' ? 'border border-border bg-surface2' : variant === 'light' ? 'bg-text' : ''}`}
    >
      {variant === 'primary' ? (
        <LinearGradient colors={[...gradients.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ minHeight: 56, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 }}>
          {content}
        </LinearGradient>
      ) : (
        <View className="min-h-14 items-center justify-center px-4">{content}</View>
      )}
    </Pressable>
  );
}

export function TextField({ label, error, ...props }: TextInputProps & { label: string; error?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <View className="gap-1.5">
      <Text className="text-xs font-semibold uppercase tracking-widest text-muted">{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.textMuted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`min-h-14 rounded-2xl border bg-surface2 px-4 text-base text-text ${focused ? 'border-accent' : 'border-border'}`}
        style={{ outlineStyle: 'none' } as never}
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
      className={`min-h-11 justify-center rounded-full border px-4 ${selected ? 'border-accent bg-accent' : 'border-border bg-surface2'}`}
    >
      <Text className={selected ? 'font-bold text-background' : 'text-text'}>{label}</Text>
    </Pressable>
  );
}

/** Two-or-more option switch that sits in a single rounded track. */
export function Segmented<T extends string>({ options, value, onChange }: {
  options: { value: T; label: string }[]; value: T; onChange: (v: T) => void;
}) {
  return (
    <View className="flex-row rounded-2xl border border-border bg-surface p-1">
      {options.map((o) => (
        <Pressable
          key={o.value}
          accessibilityRole="button"
          accessibilityState={{ selected: o.value === value }}
          onPress={() => onChange(o.value)}
          className={`min-h-11 flex-1 items-center justify-center rounded-xl ${o.value === value ? 'bg-accent' : ''}`}
        >
          <Text className={o.value === value ? 'font-bold text-background' : 'text-muted'}>{o.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <View className={`gap-2 rounded-3xl border border-border bg-surface p-4 ${className}`}>{children}</View>;
}

export function Hero({ children }: { children: ReactNode }) {
  return (
    <LinearGradient colors={[...gradients.hero]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 28, padding: 20, gap: 10 }}>
      {children}
    </LinearGradient>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <Text className="text-xs font-semibold uppercase tracking-widest text-muted">{children}</Text>;
}

export function ScreenTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View className="gap-1">
      <Text className="text-3xl font-extrabold text-text">{title}</Text>
      {subtitle ? <Text className="text-base text-muted">{subtitle}</Text> : null}
    </View>
  );
}

export function IconBadge({ icon, color = colors.accent, size = 44 }: { icon: IconName; color?: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: `${color}22`, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={icon} size={size * 0.5} color={color} />
    </View>
  );
}

export function StatTile({ icon, label, value, color = colors.accent }: { icon: IconName; label: string; value: string; color?: string }) {
  return (
    <View className="flex-1 gap-2 rounded-2xl border border-border bg-surface p-3">
      <IconBadge icon={icon} color={color} size={34} />
      <Text className="text-xl font-extrabold text-text">{value}</Text>
      <Text className="text-xs text-muted">{label}</Text>
    </View>
  );
}

export function Pill({ label, color = colors.accent }: { label: string; color?: string }) {
  return (
    <View style={{ backgroundColor: `${color}22` }} className="self-start rounded-full px-2.5 py-1">
      <Text style={{ color }} className="text-xs font-bold">{label}</Text>
    </View>
  );
}

export function Brand() {
  return (
    <View className="items-center gap-3 pb-4">
      <LinearGradient colors={[...gradients.primary]} style={{ width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="barbell" size={38} color={colors.background} />
      </LinearGradient>
      <Text className="text-2xl font-extrabold text-text">Gym Tracker</Text>
    </View>
  );
}

export function EmptyState({ title, hint, icon = 'sparkles-outline' }: { title: string; hint?: string; icon?: IconName }) {
  return (
    <View className="flex-1 items-center justify-center gap-3 p-8">
      <IconBadge icon={icon} color={colors.accent2} size={64} />
      <Text className="text-lg font-bold text-text">{title}</Text>
      {hint ? <Text className="text-center text-sm text-muted">{hint}</Text> : null}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View className="flex-1 items-center justify-center gap-3 p-8">
      <IconBadge icon="cloud-offline-outline" color={colors.danger} size={64} />
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

export function Stepper({ label, value, onChange, min, max, step = 1 }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number;
}) {
  const btn = 'h-11 w-11 items-center justify-center rounded-xl bg-surface2';
  return (
    <View className="items-center gap-1">
      <Text className="text-xs text-muted">{label}</Text>
      <View className="flex-row items-center gap-2">
        <Pressable accessibilityLabel={`Decrease ${label}`} className={btn} onPress={() => onChange(Math.max(min, value - step))}><Text className="text-lg text-text">−</Text></Pressable>
        <Text className="min-w-8 text-center text-base font-bold text-text">{value}</Text>
        <Pressable accessibilityLabel={`Increase ${label}`} className={btn} onPress={() => onChange(Math.min(max, value + step))}><Text className="text-lg text-text">+</Text></Pressable>
      </View>
    </View>
  );
}
