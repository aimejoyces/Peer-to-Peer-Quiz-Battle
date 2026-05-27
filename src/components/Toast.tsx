import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeStore } from '../store/themeStore';

export type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

let toastId = 0;
let toastCallback: ((msg: ToastMessage) => void) | null = null;

export const showToast = (message: string, type: ToastType = 'info', duration = 2000) => {
  const id = `toast-${++toastId}`;
  if (toastCallback) {
    toastCallback({ id, message, type, duration });
  }
};

export default function Toast() {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);
  const colors = useThemeStore((s) => s.colors);

  useEffect(() => {
    toastCallback = (msg) => {
      setToasts((prev) => [...prev, msg]);
      if (msg.duration) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== msg.id));
        }, msg.duration);
      }
    };
  }, []);

  const getTypeColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      case 'info':
      default:
        return colors.primary;
    }
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {toasts.map((toast) => (
        <View
          key={toast.id}
          style={[
            styles.toast,
            {
              backgroundColor: getTypeColor(toast.type),
              marginBottom: 8,
            },
          ]}
        >
          <Text style={styles.text}>{toast.message}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 9999,
  },
  toast: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
