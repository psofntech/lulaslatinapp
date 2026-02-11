import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonItem, IonDatetime,
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonCard, IonButton, IonLabel,
  NavController, ModalController
} from '@ionic/angular/standalone';

import { Observable, interval, Subscription, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Order } from 'src/interfaces/orders.interfaces';
import { OrderService } from 'src/app/services/order';
import { RouterModule } from '@angular/router';
import { DateFilterModalPage } from 'src/app/components/date-filter-modal/date-filter-modal.component';

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.page.html',
  styleUrls: ['./my-orders.page.scss'],
  standalone: true,
  imports: [
    IonList, IonCard, IonButton, IonLabel, IonContent,
    CommonModule, FormsModule, RouterModule
  ]
})
export class MyOrdersPage implements OnInit, OnDestroy {

  private fromDate$ = new BehaviorSubject<string | null>(null);
  private toDate$ = new BehaviorSubject<string | null>(null);

  groupedHistory$!: Observable<any[]>;
  totalFilteredAmount$!: Observable<number>;

  activeOrders$!: Observable<Order[]>;
  timerSub!: Subscription;
  now = Date.now();

  private readonly CANCEL_WINDOW_SECONDS = 600; // 10 minutos

  readonly RADIUS = 28;
  readonly CIRCUMFERENCE = 2 * Math.PI * this.RADIUS;

  getStrokeDasharray(): number {
    return this.CIRCUMFERENCE;
  }

  getStrokeDashoffset(order: Order): number {
    const progress = this.getProgress(order);
    return this.CIRCUMFERENCE * (1 - progress);
  }

  constructor(
    private orderService: OrderService,
    private navCtrl: NavController,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.orderService.loadOrders();

    this.activeOrders$ = this.orderService.orders$.pipe(
      map(orders =>
        orders.filter(o =>
          o.status === 'pending'
        )
      )
    );

    const filteredOrders$ = combineLatest([
      this.orderService.orders$,
      this.fromDate$,
      this.toDate$
    ]).pipe(
      map(([orders, from, to]) => {

        let filtered = orders.filter(o =>
          o.status === 'completed' ||
          o.status === 'cancelled'
        );

        if (from) {
          const fromDate = new Date(from).getTime();
          filtered = filtered.filter(o =>
            new Date(o.createdAt).getTime() >= fromDate
          );
        }

        if (to) {
          const toDate = new Date(to).getTime();
          filtered = filtered.filter(o =>
            new Date(o.createdAt).getTime() <= toDate
          );
        }

        return filtered.sort((a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
        );
      })
    );

    // 🔵 Total del período filtrado
    this.totalFilteredAmount$ = filteredOrders$.pipe(
      map(orders =>
        orders.reduce((sum, o) => sum + (o.total ?? 10), 0)
      )
    );

    // 🔵 Agrupar por mes
    this.groupedHistory$ = filteredOrders$.pipe(
      map(orders => {

        const groups: any = {};

        orders.forEach(order => {

          const date = new Date(order.createdAt);
          const key = `${date.getFullYear()}-${date.getMonth()}`;

          if (!groups[key]) {
            groups[key] = {
              monthLabel: date.toLocaleString('default', {
                month: 'long',
                year: 'numeric'
              }),
              total: 0,
              orders: []
            };
          }

          groups[key].orders.push(order);
          groups[key].total += order.total ?? 0;
        });

        return Object.values(groups);
      })
    );


    // Actualiza el reloj cada segundo
    this.timerSub = interval(1000).subscribe(() => {
      this.now = Date.now();
    });
  }

  getRemainingSeconds(order: Order): number {
    if (order.status !== 'pending') return 0;

    const secondsPassed =
      Math.floor((this.now - new Date(order.createdAt).getTime()) / 1000);

    const remaining = this.CANCEL_WINDOW_SECONDS - secondsPassed;

    return remaining > 0 ? remaining : 0;
  }

  getProgress(order: Order): number {
    const remaining = this.getRemainingSeconds(order);
    return remaining / this.CANCEL_WINDOW_SECONDS;
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${this.pad(m)}:${this.pad(s)}`;
  }

  pad(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  canCancel(order: Order): boolean {
    return this.getRemainingSeconds(order) > 0;
  }

  cancelOrder(orderId: string) {
    this.orderService.updateOrderStatus(orderId, 'cancelled').subscribe();
  }

  ngOnDestroy() {
    if (this.timerSub) {
      this.timerSub.unsubscribe();
    }
  }

  goOrderDetails(idOrder: string){
    this.navCtrl.navigateForward([`dashboard/my-orders/${idOrder}`]);
  }

  onFromDateChange(event: any) {
    this.fromDate$.next(event.detail.value);
  }

  onToDateChange(event: any) {
    this.toDate$.next(event.detail.value);
  }

  clearFilters() {
    this.fromDate$.next(null);
    this.toDate$.next(null);
  }

  async openDateFilter() {

    const modal = await this.modalCtrl.create({
      component: DateFilterModalPage,
      componentProps: {
        fromDate: this.fromDate$.value,
        toDate: this.toDate$.value
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data) {
      this.fromDate$.next(data.from);
      this.toDate$.next(data.to);
    }
  }
}
