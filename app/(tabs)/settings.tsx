import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDrawStore } from '../../src/store/drawStore';
import { useThemeStore } from '../../src/store/themeStore';

import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { StyleSheet, Text, TouchableOpacity, View, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDrawStore } from '../../src/store/drawStore';
import { useThemeStore } from '../../src/store/themeStore';

export default function SettingsScreen() {
  const { strokeWidth, setStrokeWidth } = useDrawStore();
  const { theme, colors, setTheme } = useThemeStore();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
      </View>

      {/* Theme Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Appearance
        </Text>
        <View
          style={[
            styles.settingRow,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.settingLeft}>
            <Ionicons
              name="moon"
              size={22}
              color={colors.primary}
            />
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Dark Mode
            </Text>
          </View>
          <Switch
            value={theme === 'dark'}
            onValueChange={(val) => setTheme(val ? 'dark' : 'light')}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={theme === 'dark' ? colors.primary : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Brush Settings Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Brush Settings
        </Text>
        <View
          style={[
            styles.settingContainer,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.settingRow}>
            <Ionicons name="pencil" size={20} color={colors.primary} />
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Stroke Width
            </Text>
            <Text
              style={[styles.settingValue, { color: colors.primary }]}
            >
              {Math.round(strokeWidth)}px
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={30}
            value={strokeWidth}
            onValueChange={setStrokeWidth}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
          />
        </View>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          About
        </Text>
        <View
          style={[
            styles.aboutBox,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.appName, { color: colors.text }]}>DrawCanvas</Text>
          <Text style={[styles.appVersion, { color: colors.textSecondary }]}>
            Version 1.1.0
          </Text>
          <Text
            style={[
              styles.appDesc,
              { color: colors.textSecondary, marginTop: 12 },
            ]}
          >
            A modern and intuitive drawing app for creative sketches and digital artwork.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  settingContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  slider: {
    height: 40,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  aboutBox: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
  },
  appVersion: {
    fontSize: 13,
    marginTop: 4,
  },
  appDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
});