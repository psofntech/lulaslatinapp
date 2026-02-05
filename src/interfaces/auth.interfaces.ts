export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
