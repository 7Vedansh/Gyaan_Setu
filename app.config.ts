import { ExpoConfig } from "expo/config";

// In SDK 46 and lower, use the following import instead:
// import { ExpoConfig } from '@expo/config-types';

const config: ExpoConfig = {
  name: "Gyaan Setu",
  description: "The free, fun, and effective way to learn a language.",
  slug: "gyaan-setu",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./src/assets/images/icon.jpg",
  scheme: "myapp",
  userInterfaceStyle: "dark",
  splash: {
    image: "./src/assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#1E293B",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./src/assets/images/adaptive-icon.jpg",
      backgroundColor: "#1E293B",
    },
  },
  web: {
    bundler: "metro",
    output: "single",
    favicon: "./src/assets/images/favicon.png",
  },
  plugins: ["expo-router"],
  experiments: {
    typedRoutes: true,
  },
  owner: "@7Vedansh",
};

export default config;
