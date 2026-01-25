import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@yombri/native-runtime';

export default function ProfileIndexScreen() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>Profile</Text>
      <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
        Account and app preferences.
      </Text>

<<<<<<< Updated upstream
      <Pressable
        onPress={() => router.push('/profile/settings')}
        style={({ pressed }) => [
          styles.row,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outline ?? theme.colors.text.secondary,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Text style={[styles.rowLabel, { color: theme.colors.text.primary }]}>Settings</Text>
        <Text style={[styles.rowHint, { color: theme.colors.text.secondary }]}>
          Theme and preferences
        </Text>
      </Pressable>
=======
      <TextInput
        placeholder="Display name"
        value={displayName}
        onChangeText={setDisplayName}
        style={{ borderWidth: 1, borderColor: "#ddd", padding: 12, borderRadius: 10 }}
      />
      <Button title="Save" onPress={save} />

      <Button title="My Tracker" onPress={() => router.push("/(tabs)/profile/tracker")} />
      <Button title="Blocked users" onPress={() => router.push("/(tabs)/profile/blocked")} />
      {__DEV__ ? (
        <Button title="Social debug (dev)" onPress={() => router.push("/(tabs)/profile/social-debug")} />
      ) : null}
      <Button title="Sign out" onPress={signOut} />
      <Text selectable>{log}</Text>
>>>>>>> Stashed changes
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 14 },
  row: { borderWidth: 1, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 14, gap: 4 },
  rowLabel: { fontSize: 16, fontWeight: '600' },
  rowHint: { fontSize: 13 },
});
