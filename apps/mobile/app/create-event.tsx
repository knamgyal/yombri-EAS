import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@yombri/native-runtime';

export default function CreateEventScreen() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>
        Create Event
      </Text>
      <Text style={{ color: theme.colors.text.secondary }}>
        NOTE: Implement your form here later.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 8 },
  title: { fontSize: 22, fontWeight: '800' },
});
