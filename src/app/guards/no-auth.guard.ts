import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { NavController } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth';
import { RoleUser } from 'src/interfaces/auth.interfaces';

@Injectable({ providedIn: 'root' })
export class NoAuthGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private navCtrl: NavController
  ) {}

  async canActivate(): Promise<boolean> {
    const isLogged = await this.auth.isLoggedIn();
  
    if (!isLogged) return true;
  
    const user = this.auth.userValue;
    if (!user) return true;
  
    switch (user.role) {
      case RoleUser.customer:
        this.navCtrl.navigateRoot('/home');
        break;
      case RoleUser.admin:
        this.navCtrl.navigateRoot('/dashboard/admin');
        break;
      case RoleUser.order_manager:
        this.navCtrl.navigateRoot('/dashboard/manager');
        break;
    }
  
    return false;
  }
}
