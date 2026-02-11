import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { Preferences } from '@capacitor/preferences';
import { PushService } from 'src/app/services/push/push.service';
import { LocalNotifications } from '@capacitor/local-notifications';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {

  constructor(
    private platform: Platform,
    private pushService: PushService
  ) {
    this.initializeApp();
  }

  private async initializeApp() {
    await this.platform.ready();

    await this.handleFirstInstall();

    
    setTimeout(async () => {

      
      await this.setupSystemUI();

      
      await SplashScreen.hide();

      if (Capacitor.isNativePlatform()) {
        await LocalNotifications.requestPermissions();
      }

      
      this.pushService.initWebSocket();

      
      if (Capacitor.isNativePlatform()) {
        await this.initPushSafely();
      }

    }, 400);
  }

  // -------------------------------
  // PRIMERA INSTALACIÓN
  // -------------------------------
  private async handleFirstInstall() {
    const installed = await Preferences.get({ key: 'installed' });

    if (!installed.value) {
      await Preferences.clear();
      await Preferences.set({ key: 'installed', value: 'true' });
    }
  }

  // -------------------------------
  // STATUS BAR / SYSTEM UI
  // -------------------------------
  private async setupSystemUI() {
    try {
      // NO overlay → Android reserva el espacio
      await StatusBar.setOverlaysWebView({ overlay: false });

      // Fondo NEGRO
      await StatusBar.setBackgroundColor({
        color: '#000000',
      });

      // Iconos BLANCOS
      await StatusBar.setStyle({
        style: Style.Light,
      });

    } catch (err) {
      console.warn('StatusBar error:', err);
    }
  }

  // -------------------------------
  // PUSH NOTIFICATIONS (ANDROID 13+ SAFE)
  // -------------------------------
  private async initPushSafely() {
    try {
      const permStatus = await PushNotifications.checkPermissions();
      console.log('🔍 Push permission status:', permStatus);

      if (permStatus.receive !== 'granted') {
        const perm = await PushNotifications.requestPermissions();
        if (perm.receive !== 'granted') {
          console.warn('🚫 Push permission denied by user');
          return;
        }
      }

      this.registerPushListeners();
      await PushNotifications.register();

      console.log('🔔 Push initialized successfully');

    } catch (err) {
      console.error('❌ Push init error (no crash):', err);
    }
  }

  private registerPushListeners() {
    PushNotifications.addListener('registration', token => {
      console.log('✅ Push token:', token.value);
      this.pushService.saveToken(token.value);
    });

    PushNotifications.addListener('registrationError', err => {
      console.error('❌ Push registration error:', err);
    });

    PushNotifications.addListener('pushNotificationReceived', notif => {
      this.pushService.handleIncomingPush({
        id: notif.id?.toString() ?? Date.now().toString(),
        title: notif.title ?? 'Notification',
        body: notif.body ?? '',
        type: notif.data?.type ?? 'order_created',
        data: notif.data,
        createdAt: new Date(),
        read: false
      });
    });

    PushNotifications.addListener('pushNotificationActionPerformed', action => {
      const orderId = action.notification.data?.orderId;
      if (orderId) {
        this.pushService.goToOrder(orderId);
      }
    });
  }
}
