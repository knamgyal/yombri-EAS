import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@yombri/native-runtime';

export default function EventDetailScreen() {
  const { theme } = useTheme();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>
        Event Detail
      </Text>
      <Text style={{ color: theme.colors.text.secondary }}>
        eventId: {String(eventId)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 8 },
  title: { fontSize: 22, fontWeight: '800' },
});
