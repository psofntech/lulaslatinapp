import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { IonContent, IonCard, IonButton, IonCardContent, IonCardHeader, IonCardTitle } from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/components/header/header.component";

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'; 
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonContent, HeaderComponent, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] 
})
export class HomePage implements OnInit {

  isLoggedIn: boolean = false;

  constructor(
    private router: Router,
    private auth: AuthService
  ) {
  }

  async ngOnInit() {
    this.isLoggedIn = await this.auth.isLoggedIn();
  }

  goToMenu() {

  }

  goToOrder() {
    return this.router.navigate(['/menu'])
  }

  goPageExt() {}
}
