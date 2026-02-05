import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, IonContent, IonHeader, IonInputPasswordToggle, IonToolbar, IonText, IonItem, IonIcon, IonLabel, IonInput, IonButton, IonRouterLink } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { logInOutline } from 'ionicons/icons'
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [RouterModule, IonContent, IonHeader, IonToolbar, CommonModule, FormsModule, IonItem, IonText, IonIcon, IonLabel, IonInput, IonInputPasswordToggle, IonButton, IonRouterLink ]
})
export class LoginPage implements OnInit {

  email: string = '';
  password: string = '';



  constructor(
    private router: Router,
    private auth: AuthService,
    private route: ActivatedRoute,
    private alertController: AlertController
  ) { 
    addIcons({
      logInOutline
    })
  }

  login() {
  try {
    this.auth.login({
      email: this.email,
      password: this.password
    });

    const redirectTo =
      this.route.snapshot.queryParamMap.get('redirectTo');

    const action =
      this.route.snapshot.queryParamMap.get('action');

    const productId =
      this.route.snapshot.queryParamMap.get('productId');

    if (action === 'add-to-cart' && productId) {
      //this.cartService.addById(productId);
    }

    this.router.navigateByUrl(redirectTo || '/');

  } catch (error: any) {
    console.error(error.message)
    this.presentAlert(error.message);
    //this.errorMessage = error.message;
  }
}

  async presentAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      subHeader: 'Log In Filled',
      mode: 'ios',
      message,
      buttons: ['Accept'],
    });

    await alert.present();
  }

  goToHome(){
    return this.router.navigate(['/home']);
  }

  ngOnInit() {
  }

}
