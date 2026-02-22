import "react-native-reanimated";
import { useEffect } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { VarelaRound_400Regular } from "@expo-google-fonts/varela-round";
import { Nunito_400Regular, Nunito_700Bold } from "@expo-google-fonts/nunito";
import { LogBox } from "react-native";

import { StatusBar } from "@/components/status-bar";
import { BreakpointsProvider } from "@/context/breakpoints";
import { CourseProvider } from "@/context/course";
import { ProtectedRouteProvider } from "@/context/protected-route";
import { ThemeProvider } from "@/context/theme";
import SyncService from "@/services/sync.service";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(guest)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
LogBox.ignoreAllLogs(true);

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    VarelaRound: VarelaRound_400Regular,
    Nunito: Nunito_400Regular,
    NunitoBold: Nunito_700Bold,
    NunitoExtraBold: Nunito_700Bold,
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Initialize background sync service
  useEffect(() => {
    // console.log('[App] Initializing sync service...');
    SyncService.startMonitoring();

    return () => {
      // console.log('[App] Cleaning up sync service...');
      SyncService.stopMonitoring();
    };
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <BreakpointsProvider>
        <CourseProvider>
          <ProtectedRouteProvider>
            <Stack screenOptions={{ headerShown: false }} />
            <StatusBar />
          </ProtectedRouteProvider>
        </CourseProvider>
      </BreakpointsProvider>
    </ThemeProvider>
  );
}
