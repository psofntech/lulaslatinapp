import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { IonContent, IonHeader, IonInputPasswordToggle, IonToolbar, IonText, IonItem, IonIcon, IonLabel, IonInput, IonButton } from '@ionic/angular/standalone';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    RouterModule,
    IonContent,
    IonHeader,
    IonToolbar,
    CommonModule,
    ReactiveFormsModule,
    IonItem,
    IonLabel,
    IonInput,
    IonText,
    IonInputPasswordToggle,
    IonButton
  ]
})
export class RegisterPage implements OnInit {

  registerForm!: FormGroup;
  submitted = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService
  ) { }

  ngOnInit() {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  // Validador personalizado para confirmar contraseña
  passwordMatchValidator(form: AbstractControl) {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  get f() {
    return this.registerForm.controls;
  }

  goToHome() {
    return this.router.navigate(['/home']);
  }

  async onSubmit() {
    this.submitted = true;
    this.errorMessage = '';

    if (this.registerForm.invalid) {
      return;
    }

    try {
      await this.auth.register({
        name: this.f['name'].value,
        email: this.f['email'].value,
        password: this.f['password'].value,
        phone: this.f['phone'].value
      });

      this.router.navigateByUrl('/');

    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }
}
