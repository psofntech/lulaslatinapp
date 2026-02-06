import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonCard, IonList, IonItem, IonInput, IonIcon, IonSegment, IonLabel, IonSegmentButton, IonButton, IonCardContent, AlertController, AlertInput } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth';
import { AuthStorageService } from 'src/app/services/auth-storage'; 
import { HeaderComponent } from "src/app/components/header/header.component";
import { NavController } from '@ionic/angular';

import { addIcons } from 'ionicons';
import { arrowBackOutline, createOutline, trashOutline } from 'ionicons/icons'
import { CartItem } from 'src/interfaces/cart.service';
import { CartService } from 'src/app/services/cart';
import { Address, AddressService } from 'src/app/services/address';
import { User } from 'src/interfaces/auth.interfaces';
import { CheckoutStateService } from 'src/app/services/checkout-state';

const CHECKOUT_STATE_KEY = 'checkout_state';

interface CheckoutState {
  selectType: 'pickup' | 'delivery';
  tipType: string | null;
  customTipAmount: number | null;
  isSkipped: boolean;
}


@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    CommonModule, 
    FormsModule, 
    HeaderComponent, 
    IonCard, 
    IonIcon, 
    IonSegment, 
    IonLabel, 
    IonSegmentButton, 
    IonButton, 
    IonCardContent, 
    IonInput
  ],
  providers: [NavController] // AlertController se inyecta automáticamente desde IonicModule en standalone si se importa el módulo principal, pero aquí se inyecta manualmente
})
export class CartPage implements OnInit {

  isLoggedIn: boolean = false;

  selectType: 'pickup' | 'delivery' = 'pickup';

  cartItems: CartItem[] = [];

  selectedAddress: Address | null = null;
  currentUser: User | null = null;

  // --- DATOS ---
  get subtotal(): number {
    return this.cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }

  deliveryFee: number = 0.00;
  taxRate: number = 0.06625; 

  selectedTipType: string | null = null; 
  customTipAmount: number | null = null;
  isSkipped: boolean = false;

  // Referencia al input custom para el foco automático
  @ViewChild('customInputRef') customInputRef: any;

  get taxAmount(): number {
    return this.subtotal * this.taxRate;
  }

  get calculatedTip(): number {
    if (this.selectedTipType === 'custom') {
      return this.customTipAmount || 0;
    } else if (this.selectedTipType === '15') {
      return this.subtotal * 0.15;
    } else if (this.selectedTipType === '18') {
      return this.subtotal * 0.18;
    } else if (this.selectedTipType === '20') {
      return this.subtotal * 0.20;
    }
    return 0;
  }

  get totalPrice(): number {
    return this.subtotal + this.deliveryFee + this.taxAmount + this.calculatedTip;
  }

  get isSkipDisabled(): boolean {
    return this.selectedTipType !== null;
  }

  get canProceed(): boolean {
    if (this.isSkipped) return true;
    
    if (this.selectedTipType) {
      if (this.selectedTipType === 'custom') {
        return (this.customTipAmount !== null && this.customTipAmount > 0);
      }
      return true; // 15%, 18%, 20% habilitan directamente
    }
    
    return false;
  }

  constructor(
    private auth: AuthService,
    private navCtrl: NavController,
    private cartSrv: CartService,
    private alertController: AlertController,
    private addressSrv: AddressService,
    private authStorage: AuthStorageService,
    private checkoutState: CheckoutStateService
  ) { 
    addIcons({
      arrowBackOutline,
      createOutline,
      trashOutline
    })
  }

  async ngOnInit() {
    this.isLoggedIn = await this.auth.isLoggedIn();
    this.cartItems = await this.cartSrv.getCart();
    this.currentUser = await this.authStorage.getUser();

    const storedAddress = await this.addressSrv.getSelectedAddress();
    if (storedAddress) {
      this.selectedAddress = storedAddress;
      this.selectType = 'delivery';
      // IMPORTANTE: Actualizar el fee manualmente al cambiar por código
      this.deliveryFee = 5.00;
    }

    const state = await this.checkoutState.getState();

    this.selectType = state.selectType;
    this.selectedTipType = state.tipType;
    this.customTipAmount = state.customTipAmount;
    this.isSkipped = state.isSkipped;

    this.deliveryFee = this.selectType === 'delivery' ? 5.00 : 0;
  }

  goBack() { this.navCtrl.back(); }

  onSegmentChange(ev: any) {
    this.selectType = ev.detail.value;
    this.deliveryFee = (this.selectType === 'pickup') ? 0 : 5.00;

    this.checkoutState.setSelectType(this.selectType);

    if (this.selectType === 'delivery') {
      this.handleDeliveryLogic();
    } else {
      this.selectedAddress = null;
      this.addressSrv.clearSelectedAddress();
    }
  }

  private async handleDeliveryLogic() {
    if (this.selectedAddress) return;

    const allAddresses = await this.addressSrv.getAddresses();

    if (allAddresses.length === 0) {
      await this.presentAddAddressAlert();
    } else if (allAddresses.length === 1) {
      this.setAndSaveAddress(allAddresses[0]);
    } else {
      await this.presentSelectAddressAlert(allAddresses);
    }
  }

  async presentAddAddressAlert() {
    const alert = await this.alertController.create({
      header: 'Add Delivery Address',
      inputs: [
        { name: 'street', type: 'text', placeholder: 'Street Address' },
        { name: 'city', type: 'text', placeholder: 'City' },
        { name: 'state', type: 'text', placeholder: 'State' },
        { name: 'zip', type: 'text', placeholder: 'ZIP Code' }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          handler: (data) => {
            if (data.street && data.city && data.state && data.zip) {
              const newAddress: Address = {
                id: Date.now().toString(),
                street: data.street,
                city: data.city,
                state: data.state,
                zip: data.zip
              };
              this.addressSrv.add(newAddress);
              this.setAndSaveAddress(newAddress); 
            } else {
              this.showError('All fields are required');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async presentSelectAddressAlert(addresses: Address[]) {
    const inputs: AlertInput[] = addresses.map(addr => ({
      type: 'radio',
      label: `${addr.street}, ${addr.city}, ${addr.zip}`,
      value: addr.id,
      checked: this.selectedAddress?.id === addr.id
    }));

    const alert = await this.alertController.create({
      header: 'Select Delivery Address',
      inputs: inputs,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Select',
          handler: (data) => {
            const selected = addresses.find(a => a.id === data);
            if (selected) {
              this.setAndSaveAddress(selected);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  setAndSaveAddress(address: Address) {
    this.selectedAddress = address;
    this.addressSrv.setSelectedAddressId(address.id);
  }

  async changeAddress() {
    const addresses = await this.addressSrv.getAddresses();
    if (addresses.length === 0) {
      await this.presentAddAddressAlert();
    } else if (addresses.length === 1) {
      this.setAndSaveAddress(addresses[0]);
    } else {
      await this.presentSelectAddressAlert(addresses);
    }
  }

  async editItem(item: CartItem) {
    const alert = await this.alertController.create({
      header: 'Editar Cantidad',
      inputs: [
        {
          name: 'quantity',
          type: 'number',
          placeholder: 'Cantidad',
          value: item.quantity,
          min: 1,
          cssClass: 'alert-input-centered'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data) => {
            const newQty = parseInt(data.quantity);
            if (newQty && newQty > 0) {
              this.cartSrv.update(item.id, newQty);
              this.refreshCart();
            } else {
              this.showError('La cantidad debe ser mayor a 0');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async removeItem(item: CartItem) {
    const alert = await this.alertController.create({
      header: 'Eliminar Producto',
      subHeader: item.name,
      message: '¿Estás seguro de que deseas eliminar este item del pedido?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.cartSrv.remove(item.id);
            this.refreshCart();
          }
        }
      ]
    });
    await alert.present();
  }

  async refreshCart() {
    this.cartItems = await this.cartSrv.getCart();
  }

  selectTip(type: string) {
    if (this.selectedTipType === type) {
      this.selectedTipType = null;
      this.isSkipped = false;
      this.checkoutState.setTip(null);
      return;
    }

    this.selectedTipType = type;
    this.isSkipped = false;

    if (type !== 'custom') {
      this.customTipAmount = null;
      this.checkoutState.setTip(type);
    } else {
      setTimeout(() => this.customInputRef?.setFocus(), 50);
      this.checkoutState.setTip('custom', this.customTipAmount);
    }
  }

  onSkip() {
    this.selectedTipType = null;
    this.customTipAmount = null;
    this.isSkipped = true;

    this.checkoutState.skipTip();
  }

  onCustomInputChange(event: any) {
    this.customTipAmount = parseFloat(event.detail.value);
    this.checkoutState.setTip('custom', this.customTipAmount);
  }

  async showError(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }


  goToCheckout(){
    this.navCtrl.navigateForward('/checkout')
  }

  private saveCheckoutState() {
    const state: CheckoutState = {
      selectType: this.selectType,
      tipType: this.selectedTipType,
      customTipAmount: this.customTipAmount,
      isSkipped: this.isSkipped
    };

    localStorage.setItem(CHECKOUT_STATE_KEY, JSON.stringify(state));
  }

  private loadCheckoutState() {
    const raw = localStorage.getItem(CHECKOUT_STATE_KEY);
    if (!raw) return;

    const state: CheckoutState = JSON.parse(raw);

    this.selectType = state.selectType ?? 'pickup';
    this.selectedTipType = state.tipType;
    this.customTipAmount = state.customTipAmount;
    this.isSkipped = state.isSkipped ?? false;

    // Recalcular delivery fee si aplica
    this.deliveryFee = this.selectType === 'delivery' ? 5.00 : 0;
  }

  

}