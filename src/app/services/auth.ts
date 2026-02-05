import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { User } from "src/interfaces/auth.interfaces";
import { AuthApiService } from "./auth-api";
import { AuthStorageService } from "./auth-storage";

@Injectable({ providedIn: 'root' })
export class AuthService {

  private user$ = new BehaviorSubject<User | null>(null);

  constructor(
    private api: AuthApiService,
    private storage: AuthStorageService
  ) {
    this.restoreSession();
  }

  private async restoreSession() {
    const user = await this.storage.getUser();
    if (user) {
      this.user$.next(user);
    }
  }

  getUser() {
    return this.user$.asObservable();
  }

  async isLoggedIn(): Promise<boolean> {
    return await this.storage.isLoggedIn();
  }

  async login(data: { email: string; password: string }) {
    const response = await this.api.login(data);
    await this.storage.saveSession(response.token, response.user);
    this.user$.next(response.user);
  }

  async register(data: { name: string; email: string; password: string; phone: string }) {
    const response = await this.api.register(data);
    await this.storage.saveSession(response.token, response.user);
    this.user$.next(response.user);
  }

  async updateUser(user: User) {
    const updatedUser = await this.api.updateUser(user);
    const token = await this.storage.getToken() || '';
    await this.storage.saveSession(token, updatedUser);
    this.user$.next(updatedUser);
  }

  async updatePassword(newPassword: string) {
    const user = await this.storage.getUser();
    if (!user) throw new Error('User not logged');

    this.api.updatePassword(user.id, newPassword);

    const updatedUser = { ...user, password: newPassword };
    const token = await this.storage.getToken() || '';
    await this.storage.saveSession(token, updatedUser);
    this.user$.next(updatedUser);
  }

  async logout() {
    await this.storage.clearSession();
    this.user$.next(null);
  }
}
