import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { PushService } from 'src/app/services/push/push.service';
import { LocalNotifications } from '@capacitor/local-notifications';
import { WebSocketService } from 'src/app/services/ws/websocket.service';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {

  constructor(
    private platform: Platform,
    private pushService: PushService,
    private webSocketService: WebSocketService
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

    // WebSocket
    this.webSocketService.initWebSocket();

    // 🔥 PUSH ENTERPRISE (SOLO ESTO)
    if (Capacitor.isNativePlatform()) {
      setTimeout(() => {
        this.pushService.initPush();
      }, 800); // pequeño delay seguro Android 13+
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
      await StatusBar.setOverlaysWebView({ overlay: true });

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

}
