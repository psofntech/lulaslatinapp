import { Injectable } from '@angular/core';
import { PushService } from './push.service';
import { v4 as uuid } from 'uuid';

@Injectable({ providedIn: 'root' })
export class PushMockService {

  constructor(private push: PushService) {}

  simulateNewOrder() {
    this.push.handleIncomingPush({
      id: uuid(),
      title: '🆕 Nueva orden',
      body: 'Se ha creado una nueva orden pendiente',
      type: 'order_created',
      createdAt: new Date(),
      read: false,
      data: { orderId: 'ORD-' + Math.floor(Math.random() * 1000) }
    });
  }
}
