import { Platform } from 'react-native';
import type * as ExpoNotifications from 'expo-notifications';
import { isRunningInExpoGo } from 'expo';
import * as SecureStore from 'expo-secure-store';
import { NotificacionItem } from './notificacionesService';

const CHANNEL_ID = 'efact-activity';
const DELIVERED_KEY_PREFIX = 'efact_delivered_notifications_';
let notificationsModule: typeof ExpoNotifications | null = null;

function getNotificationsModule() {
  if (Platform.OS === 'web' || isRunningInExpoGo()) return null;
  if (!notificationsModule) {
    const candidate = require('expo-notifications') as Partial<typeof ExpoNotifications>;
    if (typeof candidate.setNotificationHandler !== 'function') return null;
    candidate.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: false,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    notificationsModule = candidate as typeof ExpoNotifications;
  }
  return notificationsModule;
}
const canUseDeviceNotifications = Platform.OS !== 'web' && !isRunningInExpoGo();

export async function syncDeviceNotifications(userId: number, items: NotificacionItem[]) {
  if (Platform.OS === 'web' || userId <= 0 || !items.length) return;
  const Notifications = getNotificationsModule();
  if (!Notifications) return;
  if (!canUseDeviceNotifications || userId <= 0 || !items.length) return;

  try {
    const granted = await ensureNotificationPermission(Notifications);
    if (!granted) return;

    const key = `${DELIVERED_KEY_PREFIX}${userId}`;
    const delivered = await readDeliveredIds(key);
    const pending = items
      .filter((item) => !item.read && !delivered.has(item.id))
      .slice(0, 3);

    if (!pending.length) return;

    for (const item of pending) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: item.title || 'E-FACT',
          body: item.text || 'Tienes una nueva notificacion.',
          data: { id: item.id, type: item.type ?? null },
        },
        trigger: null,
      });
      delivered.add(item.id);
    }

    await SecureStore.setItemAsync(key, JSON.stringify(Array.from(delivered).slice(-80)));
    await Notifications.setBadgeCountAsync(items.filter((item) => !item.read).length);
  } catch {
    // Expo Go Android no soporta push remoto; la bandeja interna sigue disponible.
  }
}

async function ensureNotificationPermission(Notifications: typeof ExpoNotifications) {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Actividad E-FACT',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function readDeliveredIds(key: string) {
  try {
    const raw = await SecureStore.getItemAsync(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set<string>();
  }
}
