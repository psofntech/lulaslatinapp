import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { User } from 'src/interfaces/auth.interfaces';

@Injectable({ providedIn: 'root' })
export class AuthStorageService {

  private TOKEN_KEY = 'auth_token';
  private USER_KEY = 'auth_user';

  async saveSession(token: string, user: User) {
    await Preferences.set({ key: this.TOKEN_KEY, value: token });
    await Preferences.set({
      key: this.USER_KEY,
      value: JSON.stringify(user)
    });
  }

  async clearSession() {
    await Preferences.remove({ key: this.TOKEN_KEY });
    await Preferences.remove({ key: this.USER_KEY });
  }

  async getToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: this.TOKEN_KEY });
    return value;
  }

  async getUser(): Promise<User | null> {
    const { value } = await Preferences.get({ key: this.USER_KEY });
    return value ? JSON.parse(value) : null;
  }

  async isLoggedIn(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }
}
