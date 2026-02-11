import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonButtons, IonBackButton,
  IonToolbar, IonList, IonItem, IonIcon, IonCard,
  IonLabel,
  NavController
} from '@ionic/angular/standalone';

import { OrderService } from 'src/app/services/order';
import { Order } from 'src/interfaces/orders.interfaces';
import { Observable, map } from 'rxjs';

import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons'

@Component({
  selector: 'app-my-order-detail',
  templateUrl: './my-order-detail.page.html',
  styleUrls: ['./my-order-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader,
    IonTitle, IonToolbar, IonIcon, IonCard
  ]
})
export class MyOrderDetailPage implements OnInit {

  order$!: Observable<Order | undefined>;
  orderId!: string;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private navCtrl: NavController
  ) {
    addIcons({ arrowBackOutline });
  }

  ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('id')!;

    this.order$ = this.orderService.orders$.pipe(
      map(orders => orders.find(o => o.id === this.orderId))
    );
  }

  goBack() { this.navCtrl.back(); }
}
