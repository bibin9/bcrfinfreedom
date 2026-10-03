import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor wraps the built `dist/` folder into a native iOS/Android binary.
 *
 * Build flow:
 *   1. `npm run build`            — produces dist/
 *   2. `npx cap sync`             — copies dist into the native projects
 *   3. `npx cap open android`     — open Android Studio (requires Android SDK)
 *   4. `npx cap open ios`         — open Xcode (macOS only — Apple toolchain)
 *
 * The first time, also run:
 *   npx cap add android
 *   npx cap add ios       # macOS only
 */
const config: CapacitorConfig = {
  appId: "com.bibincutriver.bcrfire",
  appName: "BCR FIRE",
  webDir: "dist",
  // Hide the splash quickly once the JS bundle is ready.
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: "#ea580c",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#ea580c",
    },
  },
  android: {
    allowMixedContent: false,
  },
  ios: {
    contentInset: "automatic",
  },
};

export default config;
