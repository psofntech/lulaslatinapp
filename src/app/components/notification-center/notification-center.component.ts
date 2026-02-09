import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { Observable, Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { AppNotification } from 'src/app/services/push/push.interface';
import { NotificationStore } from 'src/app/stores/notification.store';
import { ModalController } from "@ionic/angular/standalone"
import { AlertFeedbackService } from 'src/app/services/push/alert.service';

@Component({
  selector: 'app-notification-center',
  templateUrl: './notification-center.component.html',
  styleUrls: ['./notification-center.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class NotificationCenterComponent implements OnInit, OnDestroy {

  notifications$!: Observable<AppNotification[]>;
  unreadCount = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private notificationStore: NotificationStore,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private alertFeedback: AlertFeedbackService
  ) {}

  ngOnInit(): void {
    this.notifications$ = this.notificationStore.notifications$;

    // Actualizar contador de no leídas
    this.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifs => {
        this.unreadCount = notifs.filter(n => !n.read).length;
      });

    // Simulación de notificaciones push para testing
    timer(5000, 15000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.pushFakeNotification());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  markRead(notification: AppNotification) {
    this.notificationStore.markAsRead(notification.id);
  }

  markAllRead() {
    this.notificationStore.markAllAsRead();
  }

  clearAll() {
    this.notificationStore.clearAll();
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  goToOrder(orderId: string) {
    // Aquí puedes usar NavController o Router para redirigir
    this.navCtrl.navigateForward(`/dashboard/manager/orders`);
    this.closeModal();
  }

  private pushFakeNotification() {
    this.alertFeedback.registerUserInteraction();
    const randomType: AppNotification['type'] = Math.random() > 0.5 ? 'order_created' : 'order_delayed';

    const fakeNotification: AppNotification = {
      id: uuidv4(),
      title: randomType === 'order_created' ? 'New Order' : 'Delayed Order',
      body: randomType === 'order_created'
        ? `A new order has been created at ${new Date().toLocaleTimeString()}`
        : `An order has exceeded 25 minutes waiting`,
      type: randomType,
      data: { orderId: `ORD-${Math.floor(Math.random() * 1000)}` },
      createdAt: new Date(),
      read: false
    };

    this.notificationStore.addNotification(fakeNotification);

    // 🔔 Solo sonido y vibración para nuevas órdenes
    if (randomType === 'order_created') {
      this.alertFeedback.play('new');
      this.alertFeedback.vibrate();
    }else{
      this.alertFeedback.play('critical');
      this.alertFeedback.vibrate();
    }
  }

}
