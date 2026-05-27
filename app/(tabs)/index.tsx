import { StyleSheet, View } from 'react-native';
import DrawingCanvas from '../../src/components/DrawingCanvas';
import Toast from '../../src/components/Toast';
import Toolbar from '../../src/components/Toolbar';
import { useThemeStore } from '../../src/store/themeStore';

export default function CanvasScreen() {
  const { colors } = useThemeStore();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <DrawingCanvas />
      <Toolbar />
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});