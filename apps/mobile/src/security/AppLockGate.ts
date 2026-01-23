import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@yombri/native-runtime';
import { useAppLock } from './AppLockProvider';

export function AppLockGate({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const { isEnabled, isUnlocked, requestUnlock } = useAppLock();

  if (!isEnabled || isUnlocked) return <>{children}</>;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>App locked</Text>
      <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
        Unlock to continue.
      </Text>

      <Pressable
        onPress={() => void requestUnlock()}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: theme.colors.primary, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Text style={[styles.buttonText, { color: theme.colors.onPrimary ?? '#fff' }]}>
          Unlock
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 10 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 14, textAlign: 'center' },
  button: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12, marginTop: 8 },
  buttonText: { fontSize: 16, fontWeight: '700' },
});
