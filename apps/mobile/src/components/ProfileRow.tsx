import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { useTheme } from "@yombri/native-runtime";

export function ProfileRow({
  title,
  subtitle,
  onPress,
  style,
}: {
  title: string;
  subtitle?: string;
  onPress: () => void;
  style?: ViewStyle;
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline ?? theme.colors.text.secondary,
          opacity: pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
          {subtitle}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 4,
  },
  title: { fontSize: 16, fontWeight: "600" },
  subtitle: { fontSize: 13 },
});
