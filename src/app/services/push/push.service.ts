import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { NotificationStore } from 'src/app/stores/notification.store';
import { AppNotification } from './push.interface';
import { WebSocketService } from '../ws/websocket.service';
import { v4 as uuid } from 'uuid';
import { OrderService } from '../order'; // Importamos el servicio de ordenes
import { AlertFeedbackService } from './alert.service'; // Usamos el servicio de audio

@Injectable({ providedIn: 'root' })
export class PushService {

  private hasUserInteracted = false;

  constructor(
    private router: Router,
    private notificationStore: NotificationStore,
    private ws: WebSocketService,
    private orderService: OrderService, // Inyección clave
    private alertFeedback: AlertFeedbackService // Limpieza de código
  ) {
    this.registerInteraction();
  }

  private registerInteraction() {
    const enable = () => this.hasUserInteracted = true;
    document.addEventListener('click', enable, { once: true });
    document.addEventListener('touchstart', enable, { once: true });
  }

  initWebSocket() {
    this.ws.connect();
    this.ws.stream$.subscribe(event => this.handleWsEvent(event));
  }

  private handleWsEvent(event: any) {
    if (event.type === 'order_created') {
      const order = event.data;
      const notification: AppNotification = {
        id: uuid(),
        title: 'Nueva Orden',
        body: `Orden #${order.id} recibida`,
        type: 'order_created',
        data: { orderId: order.id },
        createdAt: new Date(),
        read: false
      };
      this.handleIncomingPush(notification, order);
    }
  }

  async handleIncomingPush(notification: AppNotification, orderData?: any) {
    console.log('📩 Procesando evento:', notification);

    // 1. Guardar en historial interno
    this.notificationStore.addNotification(notification);

    // 2. ACTUALIZAR LISTA EN TIEMPO REAL (Punto clave)
    if (orderData && notification.type === 'order_created') {
      this.orderService.addNewOrderFromSocket(orderData);
    }

    // 3. Feedback auditivo/visual (App abierta)
    if (this.hasUserInteracted) {
      this.alertFeedback.play('new');
      this.alertFeedback.vibrate();
    }

    // 4. Notificación del Sistema (Barra de Android)
    await this.scheduleLocalNotification(notification);
  }

  private async scheduleLocalNotification(notif: AppNotification) {
    if (!Capacitor.isNativePlatform()) return;

    try {
      const permStatus = await LocalNotifications.checkPermissions();
      if (permStatus.display === 'prompt') await LocalNotifications.requestPermissions();

      if (permStatus.display === 'granted') {
        await LocalNotifications.schedule({
          notifications: [{
            id: Date.now(), // ID único
            title: notif.title,
            body: notif.body,
            schedule: { at: new Date(Date.now() + 500) },
            sound: 'beep.wav',
            smallIcon: 'ic_stat_icon_config', // Asegúrate de tener este icono en android/app/src/main/res/drawable
            iconColor: '#488AFF',
            extra: notif.data
          }]
        });
        console.log('✅ Notificación agendada');
      } else {
        console.warn('⚠️ Permisos denegados por usuario.');
      }
    } catch (e) {
      console.error('Error notificación local:', e);
    }
  }

  goToOrder(orderId: string) {
    this.router.navigate(['/manager/orders'], { queryParams: { orderId } });
  }

  saveToken(token: string) {
    console.log('📲 FCM Token:', token);
  }
}