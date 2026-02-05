import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  // ⚡ Guard ahora async
  async canActivate(): Promise<boolean> {
    try {
      const loggedIn = await this.auth.isLoggedIn();
      if (loggedIn) {
        return true;
      } else {
        this.router.navigate(['/login']);
        return false;
      }
    } catch (e) {
      console.error('Error checking login status', e);
      this.router.navigate(['/login']);
      return false;
    }
  }
}
