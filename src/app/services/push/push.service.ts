import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token } from '@capacitor/push-notifications';
import { Preferences } from '@capacitor/preferences';
import { NotificationStore } from 'src/app/stores/notification.store';
import { AppNotification } from './push.interface';
import { firstValueFrom } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class PushService {

  private hasUserInteracted = false;
  private readonly TOKEN_KEY = 'fcm_token';
  private initialized = false;

  constructor(
    private router: Router,
    private notificationStore: NotificationStore,
    private http: HttpClient
  ) {
    document.addEventListener('click', () => this.hasUserInteracted = true, { once: true });
    document.addEventListener('touchstart', () => this.hasUserInteracted = true, { once: true });
  }

  async initPush() {
    if (!Capacitor.isNativePlatform()) return;
    if (this.initialized) return;

    this.initialized = true;

    await this.setupPermissions();
    this.registerListeners();
  }

  private async setupPermissions() {
    const status = await PushNotifications.checkPermissions();

    if (status.receive !== 'granted') {
      const request = await PushNotifications.requestPermissions();
      if (request.receive !== 'granted') {
        console.warn('Push permission denied');
        return;
      }
    }

    await PushNotifications.register();
  }

  private registerListeners() {

    // TOKEN REGISTRATION
    PushNotifications.addListener('registration', async (token: Token) => {
      console.log('✅ FCM Token:', token.value);
      await this.handleToken(token.value);
    });

    PushNotifications.addListener('registrationError', err => {
      console.error('❌ Registration error:', err);
    });

    // FOREGROUND PUSH
    PushNotifications.addListener('pushNotificationReceived', notification => {
      this.handleIncomingPush(notification);
    });

    // USER TAP NOTIFICATION
    PushNotifications.addListener('pushNotificationActionPerformed', action => {
      const orderId = action.notification.data?.orderId;
      if (orderId) {
        this.goToOrder(orderId);
      }
    });
  }

  private async handleToken(newToken: string) {
    const stored = await Preferences.get({ key: this.TOKEN_KEY });

    if (stored.value === newToken) {
      console.log('🔁 Token unchanged');
      return;
    }

    await Preferences.set({
      key: this.TOKEN_KEY,
      value: newToken
    });

    await this.sendTokenToBackend(newToken);
  }

  private async sendTokenToBackend(token: string) {
    try {
      await firstValueFrom(
        this.http.post('https://tudominio.com/api/push/token', { token })
      );

      console.log('✅ Token synced to backend');

    } catch (err) {
      console.error('Token sync failed', err);
    }
  }

  async removeToken() {
    await Preferences.remove({ key: this.TOKEN_KEY });
    // Opcional: notificar backend
  }

  handleIncomingPush(notification: any) {

    const payload: AppNotification = {
      id: notification.id?.toString() ?? Date.now().toString(),
      title: notification.title ?? 'Notification',
      body: notification.body ?? '',
      type: notification.data?.type ?? 'order_created',
      data: notification.data ?? {},
      createdAt: new Date(),
      read: false
    };

    this.notificationStore.addNotification(payload);

    // Solo reproducir si app activa y usuario interactuó
    if (Capacitor.isNativePlatform() && this.hasUserInteracted) {
      this.playFeedback(payload.type);
    }
  }

  goToOrder(orderId: string) {
    this.router.navigate(['/manager/orders'], {
      queryParams: { orderId }
    });
  }

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
}
