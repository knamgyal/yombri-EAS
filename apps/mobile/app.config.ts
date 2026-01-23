import type { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,

  name: 'Yombri',
  slug: 'yombri',
  owner: 'knamgyal',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  scheme: 'yombri',
  newArchEnabled: true,

  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },

  ios: {
  supportsTablet: true,
  bundleIdentifier: 'com.yombri.app',

  // Expo-supported way to handle export compliance automatically:
  config: {
    usesNonExemptEncryption: false,
  },

  // Optional redundancy:
  infoPlist: {
    ITSAppUsesNonExemptEncryption: false,
  },
},


  android: {
    ...(config.android ?? {}),
    package: 'com.yombri.app',
    edgeToEdgeEnabled: true,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
  },

  web: {
    ...(config.web ?? {}),
    bundler: 'metro',
    output: 'static',
    favicon: './assets/favicon.png',
  },

  plugins: [
    'expo-router',
    'expo-font',
    'expo-dev-client',
    [
      'expo-local-authentication',
      { faceIDPermission: 'Allow $(PRODUCT_NAME) to use Face ID to unlock the app.' },
    ],
    [
      'expo-secure-store',
      {
        configureAndroidBackup: true,
        faceIDPermission: 'Allow $(PRODUCT_NAME) to use Face ID to unlock the app.',
      },
    ],
  ],

  experiments: {
    typedRoutes: true,
  },

  extra: {
    ...(config.extra ?? {}),
    router: {},
    eas: {
      projectId: 'e181db6b-4daa-4b30-b614-64c302e0fb42',
    },
  },
});
