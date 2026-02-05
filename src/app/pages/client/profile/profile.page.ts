import { Component, OnInit } from '@angular/core';
import { IonCard, IonCardHeader, IonCardContent, IonLabel, IonInput, IonButton, IonIcon, IonGrid, IonRow, IonCol, IonContent, IonItem, IonCardTitle, AlertController } from '@ionic/angular/standalone';
import { CommonModule,} from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { addIcons } from 'ionicons';
import { personOutline, mapOutline, addOutline, starOutline } from 'ionicons/icons';
import { ToastController } from '@ionic/angular';
import { User } from 'src/interfaces/auth.interfaces';
import { AuthService } from 'src/app/services/auth';
import { AuthStorageService } from 'src/app/services/auth-storage';
import { Address, AddressService } from 'src/app/services/address';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol, IonContent, IonItem, IonCardTitle
  ]
})
export class ProfilePage implements OnInit {

  profileForm: FormGroup;
  addresses: Address[] = [];
  currentUser: any;

  newPassword: string = '';
  confirmPassword: string = '';

  constructor(
    private fb: FormBuilder,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private authService: AuthService,
    private authStorage: AuthStorageService,
    private addressService: AddressService
  ) {
    addIcons({ personOutline, mapOutline, addOutline, starOutline });

      this.profileForm = this.fb.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required],
        newPassword: [''],
        confirmPassword: ['']
      }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.loadUser();
    this.loadAddresses();
  }

  private async loadUser() {
    const user = await this.authStorage.getUser();
    if (user) {
      this.currentUser = user;
      this.profileForm.patchValue({
        name: user.name,
        email: user.email,
        phone: user.phone
      });
    }
  }

  private async loadAddresses() {
    this.addresses = await this.addressService.getAddresses();
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

  saveChanges() {
    if (this.profileForm.invalid) {
      this.showToast('Please fill all required fields.', 'danger');
      return;
    }

    const { name, email, phone, newPassword, confirmPassword } =
      this.profileForm.value;

    // Password
    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        this.showToast('Passwords do not match!', 'danger');
        return;
      }

      try {
        this.authService.updatePassword(newPassword);
      } catch {
        this.showToast('Error updating password', 'danger');
        return;
      }
    }

    try {
      const updatedUser = {
        ...this.currentUser,
        name,
        email,
        phone
      };

      this.authService.updateUser(updatedUser);
      this.currentUser = updatedUser;

      this.profileForm.patchValue({
        newPassword: '',
        confirmPassword: ''
      });

      this.showToast('Profile updated successfully!', 'success');
    } catch {
      this.showToast('Error updating profile', 'danger');
    }
  }


  passwordMatchValidator(form: AbstractControl) {
    const password = form.get('newPassword')?.value;
    const confirm = form.get('confirmPassword')?.value;
    if (!password && !confirm) return null;
    return password === confirm ? null : { mismatch: true };
  }

  /** Añadir nueva dirección */
  async addAddress() {
    const alert = await this.alertCtrl.create({
      header: 'Add Address',
      mode: "ios",
      inputs: [
        { name: 'street', type: 'text', placeholder: 'Street' },
        { name: 'city', type: 'text', placeholder: 'City' },
        { name: 'state', type: 'text', placeholder: 'State' },
        { name: 'zip', type: 'text', placeholder: 'ZIP' },
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          handler: (data) => {
            if (!data.street || !data.city || !data.state || !data.zip) {
              this.showToast('All fields are required', 'danger');
              return false; // alert stays open
            }

            const newAddress: Address = {
              id: (Date.now()).toString(),
              street: data.street,
              city: data.city,
              state: data.state,
              zip: data.zip,
              isFavorite: false
            };
            this.addressService.add(newAddress);
            this.loadAddresses();
            this.showToast('Address added successfully', 'success');
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  /** Editar dirección existente */
  async editAddress(address: Address) {
    const alert = await this.alertCtrl.create({
      header: 'Edit Address',
      mode: "ios",
      inputs: [
        { name: 'street', type: 'text', placeholder: 'Street', value: address.street },
        { name: 'street2', type: 'text', placeholder: 'Street', value: address.street2 },
        { name: 'city', type: 'text', placeholder: 'City', value: address.city },
        { name: 'state', type: 'text', placeholder: 'State', value: address.state },
        { name: 'zip', type: 'text', placeholder: 'ZIP', value: address.zip },
      ],
      buttons: [
        { text: 'Delete', role: 'destructive', handler: () => this.deleteAddress(address.id) },
        {
          text: 'Save',
          handler: (data) => {
            if (!data.street || !data.city || !data.state || !data.zip) {
              this.showToast('All fields are required', 'danger');
              return false;
            }
            address.street = data.street;
            address.street2 = data.street2;
            address.city = data.city;
            address.state = data.state;
            address.zip = data.zip;
            this.addressService.add(address);
            this.loadAddresses();
            this.showToast('Address updated', 'success');
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  deleteAddress(id:string) {
    this.addressService.remove(id);
    this.showToast('Address deleted', 'warning');
  }

  /** Marcar una dirección como favorita */
  toggleFavorite(address: Address) {
    this.addressService.toggleFavorite(address.id);
    this.loadAddresses();
    this.showToast('Address add to favorite', 'warning');
  }



}
