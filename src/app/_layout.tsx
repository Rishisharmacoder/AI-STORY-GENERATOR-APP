import { Theme } from "@/constant/theme";
import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Theme.background },
            headerStyle: { backgroundColor: Theme.background },
            headerTintColor: Theme.text,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen
            name="story"
            options={{
              headerShown: false,
              title: "Your Story",
              headerBackTitle: "Back",
            }}
          />
        </Stack>
      </>
    </ThemeProvider>
  );
}
