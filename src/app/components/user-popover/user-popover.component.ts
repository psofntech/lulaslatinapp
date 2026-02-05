import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonList, IonItem, IonIcon, IonLabel } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';

import { addIcons } from 'ionicons';
import { personCircleOutline, logOutOutline, logInOutline, personAddOutline } from 'ionicons/icons'
import { AuthService } from 'src/app/services/auth';

@Component({
  selector: 'app-user-popover',
  templateUrl: './user-popover.component.html',
  styleUrls: ['./user-popover.component.scss'],
  imports: [CommonModule, IonContent, IonList, IonItem, IonIcon, IonLabel],
})
export class UserPopoverComponent {
  // Recibimos el estado de login desde el padre
  @Input() isLoggedIn: boolean = false;

  constructor(
    private router: Router,
    private auth: AuthService
  ) {
    addIcons({
      logInOutline,
      logOutOutline,
      personCircleOutline,
      personAddOutline
    });
  }

  async go(path: string) {
    this.router.navigate([path]);
  }

  async logout() {
    this.auth.logout();
    this.router.navigate(['/home']);
  }
}