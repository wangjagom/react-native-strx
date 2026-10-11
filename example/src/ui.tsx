import React, { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {children}
    </View>
  );
}

export function Button({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

export function Row({ children }: { children: ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

export const colors = {
  ink: '#111827',
  muted: '#6b7280',
  surface: '#ffffff',
  background: '#f6f7fb',
  accent: '#4f46e5',
  green: '#22c55e',
  red: '#ef4444',
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    gap: 12,
    padding: 16,
  },
  title: { color: colors.ink, fontSize: 17, fontWeight: '800' },
  hint: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  button: {
    backgroundColor: colors.ink,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  pressed: { opacity: 0.7 },
  buttonText: { color: 'white', fontSize: 13, fontWeight: '700' },
});
