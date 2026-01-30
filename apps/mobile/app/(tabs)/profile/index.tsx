import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useTheme } from "@yombri/native-runtime";
import { ProfileRow } from "@/components/ProfileRow";

export default function ProfileIndexScreen() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.header, { color: theme.colors.text.primary }]}>Profile</Text>
      <Text style={[styles.subheader, { color: theme.colors.text.secondary }]}>
        Account and social settings.
      </Text>

      <ProfileRow
        title="Settings"
        subtitle="Theme and preferences"
        onPress={() => router.push("/profile/settings")}
      />
      
      <ProfileRow
        title="Organizations"
        subtitle="Your org dashboards"
        onPress={() => router.push("/orgs")}
      />

      <ProfileRow
        title="Followers"
        subtitle="People who follow you"
        onPress={() => router.push("/profile/followers")}
      />

      <ProfileRow
        title="Following"
        subtitle="People you follow"
        onPress={() => router.push("/profile/following")}
      />

      <ProfileRow
        title="Blocked users"
        subtitle="Manage your block list"
        onPress={() => router.push("/profile/blocked")}
      />

      {__DEV__ ? (
        <ProfileRow
          title="Social debug (dev)"
          subtitle="Low-level follow/mutual/DM checks"
          onPress={() => router.push("/profile/social-debug")}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  header: { fontSize: 24, fontWeight: "700" },
  subheader: { fontSize: 14 },
});
