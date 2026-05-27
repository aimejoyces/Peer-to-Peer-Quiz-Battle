import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useThemeStore } from '../src/store/themeStore';

export default function RootLayout() {
  const { colors } = useThemeStore();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="layers"
          options={{
            presentation: 'modal',
            title: 'Layer Manager',
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            headerTitleStyle: {
              color: colors.text,
              fontWeight: '600',
            },
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}