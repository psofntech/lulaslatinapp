export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: RoleUser;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export enum RoleUser {
  customer = 'customer',
  admin = 'admin',
  order_manager = 'order_manager'
}
