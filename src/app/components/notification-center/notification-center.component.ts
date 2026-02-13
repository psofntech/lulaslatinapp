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

}
