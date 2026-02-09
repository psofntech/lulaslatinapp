// order.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Order } from 'src/interfaces/orders.interfaces';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  // Usamos un BehaviorSubject para actualizaciones en tiempo real (WebSockets idealmente)
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  public orders$ = this.ordersSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Obtener órdenes del backend
  loadOrders() {
    // this.http.get<Order[]>('api/orders').subscribe(orders => this.ordersSubject.next(orders));
    
    // SIMULACIÓN para este ejemplo:
    const mockOrders: Order[] = [
      {
        id: 'ORD-001',
        customerName: 'Juan Pérez',
        customerPhone: '305-555-1020',
        deliveryMethod: 'delivery',
        address: '8615 Washington Ave, Miami FL',
        status: 'pending',
        createdAt: new Date(Date.now() - 1 * 60000), // hace 5 min
        tipType: '18',
        items: [
          { id: '1', name: 'Hamburguesa Doble', quantity: 2, price: 12.75 }
        ],
        total: 0 // se recalcula en frontend
      },
      {
        id: 'ORD-002',
        customerName: 'Maria Lopez',
        customerPhone: '786-222-9988',
        deliveryMethod: 'pickup',
        status: 'pending',
        createdAt: new Date(Date.now() - 24 * 60000), // hace 18 min
        tipType: 'custom',
        cutomYipAmount: 5,
        items: [
          { id: '2', name: 'Tacos', quantity: 3, price: 4.5 }
        ],
        total: 0
      },
      {
        id: 'ORD-003',
        customerName: 'Carlos Ruiz',
        customerPhone: '954-333-8899',
        deliveryMethod: 'delivery',
        address: '9020 Coral Way, Miami FL',
        status: 'completed',
        createdAt: new Date(Date.now() - 45 * 60000),
        tipType: '15',
        items: [
          { id: '3', name: 'Burrito', quantity: 1, price: 11.5 }
        ],
        total: 0
      }
    ];
    this.ordersSubject.next(mockOrders);
  }

  // Marcar como atendida
  updateOrderStatus(orderId: string, status: 'completed' | 'cancelled'): Observable<any> {
    // Lógica de API real aquí
    // return this.http.patch(`api/orders/${orderId}`, { status });
    
    // Simulación local:
    const currentOrders = this.ordersSubject.value;
    const index = currentOrders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      currentOrders[index].status = status;
      this.ordersSubject.next([...currentOrders]); // Dispara actualización en UI
    }
    return of({ success: true });
  }
}