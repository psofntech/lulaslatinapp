export interface AppNotification {
  id: string;
  title: string;
  body: string;
  data?: any;
  createdAt: Date;
  read: boolean;
  type: 'order_created' | 'order_delayed';
}