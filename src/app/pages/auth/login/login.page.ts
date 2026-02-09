import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ToastController, IonContent, IonHeader, IonInputPasswordToggle, IonToolbar, IonText, IonItem, IonIcon, IonLabel, IonRouterLink, IonInput, IonButton, IonSpinner } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { logInOutline } from 'ionicons/icons'
import { AuthService } from 'src/app/services/auth';
import { RoleUser } from 'src/interfaces/auth.interfaces';
import { NavController } from "@ionic/angular";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule, 
    IonContent, IonHeader, IonToolbar, IonItem, IonText, IonLabel, IonRouterLink, IonInput, IonInputPasswordToggle, IonIcon, IonButton, IonSpinner ]
})
export class LoginPage implements OnInit {

  form!: FormGroup;
  loading = false;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {

    addIcons({
      logInOutline
    });

    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {}

  async login() {
    this.submitted = true;
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    try {
      // Login y obtenemos el usuario

      console.log('login', this.form.value);
      const user = await this.auth.login(this.form.value);

      await this.showToast('Session started successfully');

      // Redirigir según rol
      this.redirectByRole(user!.role);

    } catch (error: any) {
      this.showError(error.message || 'Invalid credentials');
    } finally {
      this.loading = false;
      this.submitted = false;
      this.form.get('password')?.reset();
    }
  }

  redirectByRole(role: string) {
    switch (role) {
      case RoleUser.customer:
        this.navCtrl.navigateRoot('/home'); // home del cliente
        break;
      case RoleUser.admin:
        this.navCtrl.navigateRoot('/dashboard/admin'); // panel administrador
        break;
      case RoleUser.order_manager:
        this.navCtrl.navigateRoot('/dashboard/manager'); // panel order manager
        break;
      default:
        this.navCtrl.navigateRoot('/');
    }
  }

  async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  private async showError(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Login failed',
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  goToHome(){
    this.navCtrl.navigateRoot(['/home']);
  }
}
