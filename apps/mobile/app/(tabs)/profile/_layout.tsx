import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack>
<<<<<<< Updated upstream
      <Stack.Screen name="index" options={{ title: 'Profile' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
=======
      <Stack.Screen name="index" options={{ title: "Profile" }} />
      <Stack.Screen name="tracker" options={{ title: "My Tracker" }} />
      <Stack.Screen name="blocked" options={{ title: "Blocked users" }} />
      {__DEV__ ? <Stack.Screen name="social-debug" options={{ title: "Social debug" }} /> : null}
      <Stack.Screen name="settings" options={{ title: "Settings" }} />
>>>>>>> Stashed changes
    </Stack>
  );
}
