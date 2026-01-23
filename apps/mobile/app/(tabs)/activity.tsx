import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@yombri/native-runtime';

export default function PlaceholderScreen() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>
        Coming Soon
      </Text>
      <Text style={{ color: theme.colors.text.secondary }}>
        NOTE: Replace this screen later.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 8, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800' },
});
