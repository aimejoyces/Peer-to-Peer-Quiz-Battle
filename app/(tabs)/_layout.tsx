import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useThemeStore } from '../../src/store/themeStore';

export default function TabLayout() {
  const { colors } = useThemeStore();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Canvas',
          tabBarIcon: ({ color }: { color: string }) =>
            <Ionicons name="brush" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          title: 'Gallery',
          tabBarIcon: ({ color }: { color: string }) =>
            <Ionicons name="images" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }: { color: string }) =>
            <Ionicons name="settings" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}