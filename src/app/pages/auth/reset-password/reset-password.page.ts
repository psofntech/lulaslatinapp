import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonToolbar, IonText, IonItem, IonIcon, IonLabel, IonInput, IonButton } from '@ionic/angular/standalone';
import { Router, RouterModule } from '@angular/router';

import { addIcons } from 'ionicons';
import { mailOutline } from 'ionicons/icons'

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: true,
  imports: [RouterModule, IonContent, IonIcon, IonHeader, IonToolbar, CommonModule, FormsModule, IonItem, IonLabel, IonInput, IonText, IonButton]
})
export class ResetPasswordPage implements OnInit {

  isSendMail: boolean = false;

  constructor(
    private router: Router
  ) { 
    addIcons({
      mailOutline
    })

  }

  goToHome(){
    return this.router.navigate(['/home']);
  }

  ngOnInit() {
  }

}
