import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@yombri/native-runtime';

export default function Index() {
  const { theme, isReady, themeMode, colorScheme, toggleTheme } = useTheme();

  // Should be rare because ThemeProvider gates rendering, but keep it safe.
  if (!isReady || !theme) {
    return <View style={[styles.container, { backgroundColor: '#ffffff' }]} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>
        Welcome to Yombri
      </Text>

      <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
        Mode: {themeMode} (resolved: {colorScheme})
      </Text>

      <View style={styles.swatches}>
        <View style={styles.swatchRow}>
          <View style={[styles.swatch, { backgroundColor: theme.colors.primary }]} />
          <Text style={[styles.swatchLabel, { color: theme.colors.text.secondary }]}>
            primary
          </Text>
        </View>

        <View style={styles.swatchRow}>
          <View style={[styles.swatch, { backgroundColor: theme.colors.background }]} />
          <Text style={[styles.swatchLabel, { color: theme.colors.text.secondary }]}>
            background
          </Text>
        </View>

        <View style={styles.swatchRow}>
          <View style={[styles.swatch, { backgroundColor: theme.colors.surface }]} />
          <Text style={[styles.swatchLabel, { color: theme.colors.text.secondary }]}>
            surface
          </Text>
        </View>
      </View>

      <Pressable
        onPress={toggleTheme}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: theme.colors.primary,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Text style={styles.buttonText}>Toggle theme</Text>
      </Pressable>

      {/* NOTE: Replace this screen later with your real UI components from ui-core/ui-native. */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
  },
  swatches: {
    marginTop: 18,
    width: '100%',
    gap: 12,
  },
  swatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
  },
  swatchLabel: {
    fontSize: 13,
  },
  button: {
    marginTop: 22,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
