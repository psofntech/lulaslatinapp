import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Preferences } from '@capacitor/preferences';
import { AppNotification } from '../services/push/push.interface';

@Injectable({ providedIn: 'root' })
export class NotificationStore {

  private readonly STORAGE_KEY = 'app_notifications';
  private readonly MAX_NOTIFICATIONS = 100;

  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  notifications$: Observable<AppNotification[]> = this.notificationsSubject.asObservable();

  constructor() {
    this.loadFromStorage();
  }

  private async loadFromStorage() {
    try {
      const stored = await Preferences.get({ key: this.STORAGE_KEY });

      if (!stored.value) return;

      const parsed: AppNotification[] = JSON.parse(stored.value);

      // Convertir createdAt string → Date
      const hydrated = parsed.map(n => ({
        ...n,
        createdAt: new Date(n.createdAt)
      }));

      this.notificationsSubject.next(hydrated);

    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  }

  private async persist(notifications: AppNotification[]) {
    try {
      await Preferences.set({
        key: this.STORAGE_KEY,
        value: JSON.stringify(notifications)
      });
    } catch (err) {
      console.error('Failed to persist notifications', err);
    }
  }

  async addNotification(notification: AppNotification) {
    const current = this.notificationsSubject.value;

    const updated = [notification, ...current]
      .slice(0, this.MAX_NOTIFICATIONS); // evita crecimiento infinito

    this.notificationsSubject.next(updated);
    await this.persist(updated);
  }

  async markAsRead(id: string) {
    const updated = this.notificationsSubject.value.map(n =>
      n.id === id ? { ...n, read: true } : n
    );

    this.notificationsSubject.next(updated);
    await this.persist(updated);
  }

  async markAllAsRead() {
    const updated = this.notificationsSubject.value.map(n => ({
      ...n,
      read: true
    }));

    this.notificationsSubject.next(updated);
    await this.persist(updated);
  }

  async clearAll() {
    this.notificationsSubject.next([]);
    await Preferences.remove({ key: this.STORAGE_KEY });
  }

  getUnreadCount(): number {
    return this.notificationsSubject.value.filter(n => !n.read).length;
  }
}
