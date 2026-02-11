import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons,
  IonTabs, IonTabButton, IonTabBar, IonTab, IonButton,
  IonIcon, IonRefresher, IonRefresherContent, IonLabel,
  IonList, IonCard, IonCardHeader, IonCardContent, IonCardSubtitle,
  IonCardTitle, IonChip, IonModal, IonItem, IonFooter
} from '@ionic/angular/standalone';

import { RefresherCustomEvent } from '@ionic/angular';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { addIcons } from 'ionicons';
import { timeOutline, checkmarkDoneOutline, closeCircleOutline, cubeOutline, flash } from 'ionicons/icons';

import { interval } from 'rxjs';
import { startWith } from 'rxjs/operators';

import { Order, OrderItem } from 'src/interfaces/orders.interfaces';
import { OrderService } from 'src/app/services/order';
import { RoleUser, User } from 'src/interfaces/auth.interfaces';
import { AuthStorageService } from 'src/app/services/auth-storage';
import { AlertFeedbackService } from 'src/app/services/push/alert.service';

@Component({
  selector: 'app-order',
  templateUrl: './order.page.html',
  styleUrls: ['./order.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons,
    IonTabs, IonTabButton, IonTabBar, IonTab, IonButton,
    IonIcon, IonRefresher, IonRefresherContent, IonLabel,
    IonList, IonCard, IonCardHeader, IonCardContent,
    IonCardSubtitle, IonCardTitle, IonChip, IonModal,
    IonItem, IonFooter, CommonModule, FormsModule
  ]
})
export class OrderPage implements OnInit {
  @ViewChild('orderTabs') orderTabs!: IonTabs;

  currentUser: User | null = null;

  pendingOrders$!: Observable<Order[]>;
  completedOrders$!: Observable<Order[]>;

  selectedOrder: Order | null = null;
  isModalOpen = false;

  private alertedOrders = new Set<string>();

  now$ = interval(60000).pipe(
    startWith(0),
    map(() => new Date())
  );

  constructor(
    private authStorage: AuthStorageService,
    private orderService: OrderService,
    private alertFeedback: AlertFeedbackService
  ) {
    addIcons({ timeOutline, checkmarkDoneOutline, closeCircleOutline, cubeOutline, flash });
  }

  async ngOnInit() {
    this.currentUser = await this.authStorage.getUser();

    // 🔹 Carga inicial
    this.orderService.loadOrders();

    const orders$ = this.orderService.orders$;

    this.pendingOrders$ = orders$.pipe(
      map(orders =>
        orders
          .filter(o => o.status === 'pending')
          .sort(
            (a, b) =>
              this.getMinutesElapsed(b) -
              this.getMinutesElapsed(a)
          )
      ),
      tap(orders => this.checkCriticalOrders(orders))
    );

    this.completedOrders$ = orders$.pipe(
      map(orders =>
        orders.filter(
          o => o.status === 'completed' || o.status === 'cancelled'
        )
      )
    );
  }

  getMinutesElapsed(order: Order): number {
    return Math.floor(
      (Date.now() - new Date(order.createdAt).getTime()) / 60000
    );
  }

  // Pull to refresh
  refreshOrders(event?: RefresherCustomEvent) {
    this.orderService.loadOrders();
    event?.target.complete();
  }

  trackById(index: number, order: Order) {
    return order.id;
  }

  trackByItemId(index: number, item: OrderItem) {
    return item.id;
  }

  openOrderDetail(order: Order) {
    this.selectedOrder = order;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedOrder = null;
  }

  markAsCompleted(orderId: string) {
    this.orderService.updateOrderStatus(orderId, 'completed').subscribe();
    this.closeModal();
  }

  getSubtotal(order: Order): number {
    return order.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
  }

  getTipAmount(order: Order): number {
    const subtotal = this.getSubtotal(order);

    switch (order.tipType) {
      case '15':
        return subtotal * 0.15;
      case '18':
        return subtotal * 0.18;
      case '20':
        return subtotal * 0.20;
      case 'custom':
        return order.cutomTipAmount ?? 0;
      default:
        return 0;
    }
  }

  getTaxAmount(order: Order): number {
    // si ya tienes una constante global, puedes moverlo a env
    const TAX_RATE = 0.07;
    return this.getSubtotal(order) * TAX_RATE;
  }

  getFinalTotal(order: Order): number {
    return (
      this.getSubtotal(order) +
      this.getTipAmount(order) +
      this.getTaxAmount(order)
    );
  }

  isOrderDelayed(order: Order): boolean {
    return this.getMinutesElapsed(order) >= 25;
  }

  getMinutesSince(createdAt: Date): number {
    const created = new Date(createdAt).getTime();
    const now = Date.now();
    return Math.floor((now - created) / 60000);
  }

  getOrderTimeClass(order: Order): string | null {
    if (order.status !== 'pending') return null;

    const minutes = this.getMinutesSince(order.createdAt);

    if (minutes >= 25) return 'order-critical';
    if (minutes >= 15) return 'order-delayed';
    if (minutes >= 10) return 'order-warning';

    return null;
  }

  getOrderClasses(order: Order): string[] {
    const classes: string[] = [order.status];
    
    if (this.isNewOrder(order)) classes.push('new-order-entry');

    const timeClass = this.getOrderTimeClass(order);
    if (timeClass) classes.push(timeClass);

    return classes;
  }

  checkCriticalOrders(orders: Order[]) {
    orders.forEach(order => {
      if (order.status !== 'pending') return;

      const minutes = this.getMinutesSince(order.createdAt);

      if (minutes >= 25 && !this.alertedOrders.has(order.id)) {
        this.alertFeedback.registerUserInteraction();
        this.triggerAlert(order);
        this.alertedOrders.add(order.id);
      }
    });
  }

  private triggerAlert(order: Order) {
    this.alertFeedback.play('critical');
    this.alertFeedback.vibrate(); 

    console.warn(`🚨 Orden crítica: ${order.id}`);
  }

  isNewOrder(order: Order): boolean {
    return (Date.now() - new Date(order.createdAt).getTime()) < 10000; // Menos de 10 seg
  }
}
