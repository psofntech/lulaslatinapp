import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App as CapacitorApp } from '@capacitor/app';
import { PushService } from 'src/app/services/push/push.service';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {

  private appStateListener: PluginListenerHandle | null = null;
  private pushInitialized = false;

  constructor(
    private platform: Platform,
    private pushService: PushService
  ) {
    this.initializeApp();
  }

  async initializeApp() {
    await this.platform.ready();

    // 🔹 Status bar segura
    await this.setupSystemUI();

    // 🔹 Splash
    setTimeout(() => SplashScreen.hide(), 800);

    // 🔹 Inicializar Push de forma segura
    this.waitForFirstActiveAndInitPush();
  }

  private async waitForFirstActiveAndInitPush() {
    if (!Capacitor.isNativePlatform()) return;

    this.appStateListener = await CapacitorApp.addListener(
      'appStateChange',
      async ({ isActive }) => {
        if (isActive && !this.pushInitialized) {
          this.pushInitialized = true;

          // ✅ remover listener correctamente
          await this.appStateListener?.remove();
          this.appStateListener = null;

          setTimeout(() => {
            this.initPushSafely();
          }, 600);
        }
      }
    );
  }

  private async initPushSafely() {
    try {
      this.registerPushListeners();

      const perm = await PushNotifications.requestPermissions();
      if (perm.receive !== 'granted') {
        console.warn('Permisos de push denegados');
        return;
      }

      await PushNotifications.register();
      console.log('🔔 Push inicializado correctamente');

    } catch (err) {
      console.error('Push init error', err);
    }
  }

  private registerPushListeners() {
    PushNotifications.addListener('registration', token => {
      console.log('✅ Push token:', token.value);
      this.pushService.saveToken(token.value);
    });

    PushNotifications.addListener('registrationError', err => {
      console.error('❌ Push registration error', err);
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
      if (orderId) this.pushService.goToOrder(orderId);
    });
  }

  // ============================
  // 🎨 SYSTEM UI (STATUS + NAV)
  // ============================
  private async setupSystemUI() {
    try {
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#000000' });
    } catch {}

    // Android Navigation Bar
    const nav = (window as any).NavigationBar;
    if (nav) {
      nav.backgroundColorByHexString('#000000');
      nav.setUp(true); // swipe up to show
      nav.setHideNavigationBar(true);
    }
  }
}