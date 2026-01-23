import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@yombri/native-runtime';
import type { ThemeMode } from '@yombri/design-tokens';
import { useAppLock } from '../../../src/security/AppLockProvider';
import { APP_LOCK_TIMEOUTS, AppLockTimeoutSeconds } from '../../../src/security/appLock';

type ModeRowProps = {
  label: string;
  description: string;
  mode: ThemeMode;
  selected: boolean;
  onSelect: (mode: ThemeMode) => void;
};

function ModeRow({ label, description, mode, selected, onSelect }: ModeRowProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={() => onSelect(mode)}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.colors.surface,
          borderColor: selected ? theme.colors.primary : (theme.colors.outline ?? theme.colors.text.secondary),
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View style={styles.rowLeft}>
        <Text style={[styles.rowLabel, { color: theme.colors.text.primary }]}>{label}</Text>
        <Text style={[styles.rowDesc, { color: theme.colors.text.secondary }]}>{description}</Text>
      </View>

      <Text style={[styles.check, { color: selected ? theme.colors.primary : theme.colors.text.secondary }]}>
        {selected ? '✓' : ''}
      </Text>
    </Pressable>
  );
}

type ChoiceRowProps = {
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
};

function ChoiceRow({ label, description, selected, onPress }: ChoiceRowProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.colors.surface,
          borderColor: selected ? theme.colors.primary : (theme.colors.outline ?? theme.colors.text.secondary),
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View style={styles.rowLeft}>
        <Text style={[styles.rowLabel, { color: theme.colors.text.primary }]}>{label}</Text>
        <Text style={[styles.rowDesc, { color: theme.colors.text.secondary }]}>{description}</Text>
      </View>

      <Text style={[styles.check, { color: selected ? theme.colors.primary : theme.colors.text.secondary }]}>
        {selected ? '✓' : ''}
      </Text>
    </Pressable>
  );
}

export default function ProfileSettingsScreen() {
  const { theme, themeMode, setThemeMode, colorScheme, isDark } = useTheme();
  const { timeoutSeconds, setTimeoutSeconds, policy } = useAppLock();

  const canUseNever = policy !== 'required';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: 'Settings' }} />

      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Appearance</Text>
      <Text style={[styles.sectionHint, { color: theme.colors.text.secondary }]}>
        Current scheme: {colorScheme} ({isDark ? 'dark' : 'light'})
      </Text>

      <ModeRow
        label="Auto"
        description="Follow system appearance."
        mode="auto"
        selected={themeMode === 'auto'}
        onSelect={setThemeMode}
      />
      <ModeRow
        label="Light"
        description="Always use light theme."
        mode="light"
        selected={themeMode === 'light'}
        onSelect={setThemeMode}
      />
      <ModeRow
        label="Dark"
        description="Always use dark theme."
        mode="dark"
        selected={themeMode === 'dark'}
        onSelect={setThemeMode}
      />

      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary, marginTop: 18 }]}>
        App Lock
      </Text>
      <Text style={[styles.sectionHint, { color: theme.colors.text.secondary }]}>
        Lock the app after inactivity.
      </Text>

      {APP_LOCK_TIMEOUTS.filter(opt => canUseNever || opt.value !== 0).map((opt) => (
        <ChoiceRow
          key={opt.value}
          label={opt.label}
          description={opt.value === 0 ? 'Disable App Lock.' : `Lock after ${opt.label} of inactivity.`}
          selected={timeoutSeconds === opt.value}
          onPress={() => void setTimeoutSeconds(opt.value as AppLockTimeoutSeconds)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 6 },
  sectionHint: { fontSize: 13, marginBottom: 6 },
  row: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: { flex: 1, paddingRight: 12, gap: 4 },
  rowLabel: { fontSize: 16, fontWeight: '600' },
  rowDesc: { fontSize: 13 },
  check: { width: 24, textAlign: 'right', fontSize: 18, fontWeight: '700' },
});
