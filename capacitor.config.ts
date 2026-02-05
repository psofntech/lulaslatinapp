import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.lulaslatincusine.orderapps',
  appName: 'latinCusineApp',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000, // Duración en ms
      launchAutoHide: true,     // Oculta automáticamente
      backgroundColor: '#ffffff', // Color de fondo
      androidSplashResourceName: 'splash', // nombre del recurso en Android
      iosSplashResourceName: 'splash',     // nombre del recurso en iOS
      showSpinner: true,         // Mostrar spinner de carga
      androidSpinnerStyle: 'large',
      spinnerColor: '#000000'
    }
  }
};

export default config;
