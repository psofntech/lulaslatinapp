export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryMethod: 'pickup' | 'delivery',
  address?: string; // Si es restaurante, o es dirección si es delivery
  status: 'pending' | 'completed' | 'cancelled';
  total: number;
  createdAt: Date;
  tipType?: '15' | '18' | '20' | 'custom'; // se usa para el calculo de porcentajes de propina con el subtotal de la orden
  cutomTipAmount?: number; // usado solo cuando el cliente selecciona esta opcion al crear su roden
  items: OrderItem[];
}