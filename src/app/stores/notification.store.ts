import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppNotification } from '../services/push/push.interface';

@Injectable({ providedIn: 'root' })
export class NotificationStore {

  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  notifications$: Observable<AppNotification[]> = this.notificationsSubject.asObservable();

  constructor() {}

  addNotification(notification: AppNotification) {
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([notification, ...current]);
  }

  markAsRead(id: string) {
    const updated = this.notificationsSubject.value.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    this.notificationsSubject.next(updated);
  }

  markAllAsRead() {
    const updated = this.notificationsSubject.value.map(n => ({ ...n, read: true }));
    this.notificationsSubject.next(updated);
  }

  clearAll() {
    this.notificationsSubject.next([]);
  }

  getUnreadCount(): number {
    return this.notificationsSubject.value.filter(n => !n.read).length;
  }
}
