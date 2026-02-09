import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonList, IonItem, IonIcon, IonLabel } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';

import { addIcons } from 'ionicons';
import { personCircleOutline, logOutOutline, logInOutline, personAddOutline } from 'ionicons/icons'
import { AuthService } from 'src/app/services/auth';
import { RoleUser, User } from 'src/interfaces/auth.interfaces';
import { AuthStorageService } from 'src/app/services/auth-storage';
import { NavController } from "@ionic/angular";

@Component({
  selector: 'app-user-popover',
  templateUrl: './user-popover.component.html',
  styleUrls: ['./user-popover.component.scss'],
  imports: [CommonModule, IonContent, IonList, IonItem, IonIcon, IonLabel],
})
export class UserPopoverComponent implements OnInit {
  // Recibimos el estado de login desde el padre
  @Input() isLoggedIn: boolean = false;
  @Output() close = new EventEmitter<void>();

  currentUser: User | null = null;


  constructor(
    private router: Router,
    private auth: AuthService,
    private authStorage: AuthStorageService,
    private navCtrl: NavController,
  ) {
    addIcons({
      logInOutline,
      logOutOutline,
      personCircleOutline,
      personAddOutline
    });
  }

  async ngOnInit() {
    this.currentUser = await this.authStorage.getUser();
  }

  go() {
    this.close.emit();
    setTimeout(() => {
      switch(this.currentUser?.role){
        case RoleUser.customer: 
          this.router.navigate(['/dashboard']);
          break;
        case RoleUser.order_manager:
          this.navCtrl.navigateRoot(['/dashboard/manager']);
          break;
        default:
          this.navCtrl.navigateRoot(['/home']);
          break;
      }
    }, 0);
  }
  
  goLogin() {
    this.close.emit();
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 0);
  }
  
  goRegister() {
    this.close.emit();
    setTimeout(() => {
      this.router.navigate(['/register']);
    }, 0);
  }

  logout() {
    this.close.emit();
    setTimeout(() => {
      this.auth.logout();
      this.router.navigate(['/home']);
    }, 0);
  }
}