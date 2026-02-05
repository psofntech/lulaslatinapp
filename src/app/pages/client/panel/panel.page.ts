import { Component } from '@angular/core';
import { IonCard, IonCardContent, IonContent, IonCardHeader, IonCardTitle, IonList, IonItem, IonLabel, IonIcon } from '@ionic/angular/standalone';
import { DatePipe } from '@angular/common';



interface ShippingMethod {
  name: string;
  count: number;
}

interface Order {
  id: number;
  date: Date;
}

@Component({
  selector: 'app-panel-dash',
  templateUrl: './panel.page.html',
  styleUrls: ['./panel.page.scss'],
  imports: [IonCard, IonCardContent, IonContent, IonIcon, IonCardHeader, IonCardTitle, IonList, IonItem, IonLabel, DatePipe,]
})
export class PanelPage {

   totalOrders: number = 0;

  mostUsedShipping: ShippingMethod[] = [
    { name: 'Delivery', count: 4 },
    { name: 'Pick Up', count: 1 }
  ];

  orderHistory: Order[] = []; // historial de pedidos

  constructor() {
    // Ejemplo de datos iniciales
    this.totalOrders = 0;
    this.orderHistory = []; // vacío al inicio
  }


}
