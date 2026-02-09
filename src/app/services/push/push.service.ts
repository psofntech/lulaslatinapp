import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { NotificationStore } from 'src/app/stores/notification.store';
import { AppNotification } from './push.interface';

@Injectable({ providedIn: 'root' })
export class PushService {

  private hasUserInteracted = false;

  constructor(
    private router: Router,
    private notificationStore: NotificationStore
  ) {
    // Detectar interacción del usuario (necesario para audio)
    document.addEventListener('click', () => this.hasUserInteracted = true, { once: true });
    document.addEventListener('touchstart', () => this.hasUserInteracted = true, { once: true });
  }

  // ==========================
  // TOKEN
  // ==========================
  saveToken(token: string) {
    console.log('📲 Saving FCM token:', token);

    // 👉 Aquí luego lo envías a tu backend
    // this.http.post('/api/push/token', { token })
  }

  // ==========================
  // PUSH HANDLING
  // ==========================
  handleIncomingPush(notification: AppNotification) {
    console.log('📩 Push received:', notification);

    // Guardar en store
    this.notificationStore.addNotification(notification);

    // Feedback SOLO si la app está activa
    if (Capacitor.isNativePlatform() && this.hasUserInteracted) {
      this.playFeedback(notification.type);
    }
  }

  // ==========================
  // NAVEGACIÓN
  // ==========================
  goToOrder(orderId: string) {
    this.router.navigate(['/manager/orders'], {
      queryParams: { orderId }
    });
  }

  // ==========================
  // AUDIO + VIBRACIÓN (SEGURO)
  // ==========================
  private playFeedback(type: AppNotification['type']) {
    try {
      const sound =
        type === 'order_delayed'
          ? 'assets/sounds/alertcritical.mp3'
          : 'assets/sounds/alertNew.mp3';

      const audio = new Audio(sound);
      audio.volume = 1;
      audio.play().catch(() => {});

      if (navigator.vibrate) {
        navigator.vibrate(type === 'order_delayed' ? [400, 200, 400] : 200);
      }
    } catch (e) {
      console.warn('Feedback blocked:', e);
    }
  }

  // ==========================
  // ACTIVAR PUSH (DESDE UI)
  // ==========================
  async enablePush() {
    if (!Capacitor.isNativePlatform()) return;

    const perm = await PushNotifications.requestPermissions();
    if (perm.receive !== 'granted') return;

    await PushNotifications.register();
  }
}
