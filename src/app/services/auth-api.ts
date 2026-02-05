import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { AuthResponse, User } from 'src/interfaces/auth.interfaces';

const USERS_KEY = 'users_db';

@Injectable({ providedIn: 'root' })
export class AuthApiService {

  // ------------------------
  // helpers privados
  // ------------------------

  private async getUsers(): Promise<User[]> {
    const { value } = await Preferences.get({ key: USERS_KEY });
    return value ? JSON.parse(value) : [];
  }

  private async saveUsers(users: User[]) {
    await Preferences.set({
      key: USERS_KEY,
      value: JSON.stringify(users)
    });
  }

  // ------------------------
  // API pública
  // ------------------------

  async register(data: {
    name: string;
    email: string;
    password: string;
    phone: string;
  }): Promise<AuthResponse> {

    const users = await this.getUsers();

    if (users.find(u => u.email === data.email)) {
      throw new Error('Email already registered');
    }

    const user: User = {
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password
    };

    users.push(user);
    await this.saveUsers(users);

    return {
      token: this.generateFakeJWT(user),
      user
    };
  }

  async updateUser(user: User): Promise<User> {
    const users = await this.getUsers();
    const index = users.findIndex(u => u.id === user.id);

    if (index === -1) {
      throw new Error('User not found');
    }

    users[index] = {
      ...users[index],
      name: user.name,
      email: user.email,
      phone: user.phone
    };

    await this.saveUsers(users);
    return users[index];
  }

  async updatePassword(userId: string, newPassword: string): Promise<boolean> {
    const users = await this.getUsers();
    const index = users.findIndex(u => u.id === userId);

    if (index === -1) {
      throw new Error('User not found');
    }

    users[index] = {
      ...users[index],
      password: newPassword
    };

    await this.saveUsers(users);
    return true;
  }

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const users = await this.getUsers();

    const user = users.find(
      u => u.email === data.email && u.password === data.password
    );

    if (!user) {
      throw new Error('Invalid credentials');
    }

    return {
      token: this.generateFakeJWT(user),
      user
    };
  }

  // ------------------------
  // fake JWT (solo demo)
  // ------------------------

  private generateFakeJWT(user: User): string {
    return btoa(JSON.stringify({
      sub: user.id,
      email: user.email,
      exp: Date.now() + 1000 * 60 * 60
    }));
  }
}
