import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Platform } from '@ionic/angular';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App as CapacitorApp } from '@capacitor/app';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(private platform: Platform) {
    this.initializeApp();
  }

  async initializeApp() {
    await this.platform.ready().then(() => {
      setTimeout(() => {
        SplashScreen.hide();
      }, 3000);
    });

    try {
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#222222' });
    } catch (e) {
      console.warn('StatusBar plugin error', e);
    }

    if ((window as any).NavigationBar) {
      const nav = (window as any).NavigationBar;
      nav.backgroundColorByHexString('#222222'); // fondo oscuro
      nav.setUp(true); // mantener visible
      // nav.hide(); // si quieres auto-ocultar
    }

    CapacitorApp.addListener('backButton', () => {
      console.log('Back button pressed');
    });
  }
}
