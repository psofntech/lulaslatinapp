import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonCard, IonCardContent, IonIcon, IonButton, IonList, IonItem, IonLabel,  IonInput } from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/components/header/header.component";
import { AuthService } from 'src/app/services/auth';
import { CartService } from 'src/app/services/cart';
import { CartItem } from 'src/interfaces/cart.service';
import { AuthStorageService } from 'src/app/services/auth-storage';
import { User } from 'src/interfaces/auth.interfaces';
import { Address, AddressService } from 'src/app/services/address';
import { NavController, AlertController } from '@ionic/angular';

import { addIcons } from 'ionicons';
import { personCircleOutline, receiptOutline, homeOutline, carOutline, cardOutline, arrowBackOutline } from 'ionicons/icons'
import { CheckoutState, CheckoutStateService } from 'src/app/services/checkout-state';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
  standalone: true,
  imports: [ IonContent, IonCard, IonCardContent, IonIcon, IonButton, IonList, IonItem, IonLabel, CommonModule, FormsModule, IonInput, HeaderComponent],
  providers: [NavController]
})
export class CheckoutPage implements OnInit {

  isLoggedIn: boolean = false;
  cartItems: CartItem[] = [];
  currentUser: User | null = null;

  selectType: 'pickup' | 'delivery' = 'delivery';

  selectedAddress: Address | null = null;

  tipAmount: number = 0;
  subtotal: number = 31;
  tax: number = 0;

  card = {
    number: '',
    exp: '',
    cvv: ''
  };

  get total(): number {
    return this.subtotal + this.tax + this.tipAmount;
  }


  constructor(
    private auth: AuthService,
    private cartSrv: CartService,
    private authStorage: AuthStorageService,
    private navCtrl: NavController,
    private addressSrv: AddressService,
    private checkoutState: CheckoutStateService,
    private alertController: AlertController
  ) { 
    addIcons({
      personCircleOutline,
      receiptOutline,
      homeOutline,
      carOutline,
      cardOutline,
      arrowBackOutline
    })
  }

  async ngOnInit() {
    this.isLoggedIn = await this.auth.isLoggedIn();
    this.cartItems = await this.cartSrv.getCart();
    this.currentUser = await this.authStorage.getUser();

    this.subtotal = this.calculateSubtotal();
    this.tax = this.calculateTax(this.subtotal);

    this.loadCheckoutState();
    this.loadSelectedAddress();
  }

  goBack() { this.navCtrl.back(); }

  private async loadCheckoutState() {
    const state = await this.checkoutState.getState();

    this.selectType = state.selectType;

    this.tipAmount = this.resolveTipFromState(
      state,
      this.subtotal
    );
  }

  private resolveTipFromState(
    state: CheckoutState,
    subtotal: number
  ): number {
    if (state.isSkipped) return 0;

    if (!state.tipType) return 0;

    if (state.tipType === 'custom') {
      return state.customTipAmount || 0;
    }

    const percentage = Number(state.tipType);
    return +(subtotal * (percentage / 100)).toFixed(2);
  }

  private async loadSelectedAddress() {
    if (this.selectType === 'delivery') {
      this.selectedAddress = await this.addressSrv.getSelectedAddress();
    }
  }

  calculateSubtotal(): number {
    return this.cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }

  calculateTax(subtotal: number): number {
    return +(subtotal * 0.08).toFixed(2);
  }

  calculateTip(subtotal: number): number {
    return +(subtotal * 0.15).toFixed(2);
  }


  async processPaid() {
    const errorMessage = this.canPay();

    if (errorMessage) {
      await this.presentValidationAlert(errorMessage);
      return;
    }

    // 🔥 Simulación de pago exitoso
    this.onPaymentSuccess();
  }

  private canPay(): string | null {
    if (!this.card.number || this.card.number.replace(/\s/g, '').length < 16) {
      return 'Please enter a valid card number.';
    }

    if (!this.card.exp || this.card.exp.length < 5) {
      return 'Please enter a valid expiration date.';
    }

    if (!this.card.cvv || this.card.cvv.length < 3) {
      return 'Please enter a valid CVV.';
    }

    if (this.selectType === 'delivery' && !this.selectedAddress) {
      return 'Please select a delivery address.';
    }

    return null; // ✅ todo OK
  }

  private async presentValidationAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Payment Error',
      message: message,
      buttons: ['OK'],
      mode: 'ios'
    });

    await alert.present();
  }

  private onPaymentSuccess() {
    this.cartSrv.clear();
    this.checkoutState.clear();
    this.addressSrv.clearSelectedAddress();
    this.navCtrl.navigateRoot('/success');
  }

  formatCardNumber(event: any) {
    let value = event.target.value || '';
    value = value.replace(/\D/g, '');
    value = value.substring(0, 16);
    const sections = value.match(/.{1,4}/g);
    this.card.number = sections ? sections.join(' ') : value;
  }

}
