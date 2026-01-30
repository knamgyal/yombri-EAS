import React from "react";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";
import { useSignedAvatarUrl } from "../hooks/useSignedAvatarUrl";

export function AvatarImage(props: {
  avatarPath: string | null | undefined;
  size?: number;
}) {
  const { avatarPath, size = 88 } = props;
  const { signedUrl, loading } = useSignedAvatarUrl(avatarPath, 60);

  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size / 2 }]}>
      {loading ? (
        <ActivityIndicator />
      ) : signedUrl ? (
        <Image source={{ uri: signedUrl }} style={[styles.img, { borderRadius: size / 2 }]} />
      ) : (
        <View style={[styles.fallback, { borderRadius: size / 2 }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  img: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  fallback: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.10)",
  },
});
