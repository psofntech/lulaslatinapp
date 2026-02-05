import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';

import { IonHeader, IonToolbar, IonPopover , IonButtons, IonMenuButton, IonButton, IonIcon, IonBadge } from "@ionic/angular/standalone";
import { UserPopoverComponent } from '../user-popover/user-popover.component';

import { addIcons } from 'ionicons';
import { cartOutline, personOutline } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { CartService } from 'src/app/services/cart';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [CommonModule, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonButton, IonIcon, IonBadge, IonPopover, UserPopoverComponent],
  providers: [AlertController, NavController],
})
export class HeaderComponent implements OnInit, OnDestroy {

  @Input() isLoggedIn: boolean = false; 
  @Input() showMenuButton: boolean = false;

  showPopover = false;
  popoverEvent: any;

  cartCount: number = 0;  // reactivo
  private cartSub!: Subscription;

  constructor(
    private alertController: AlertController,
    private router: Router,
    private cartService: CartService,
    private navCtrl: NavController
  ) { 
    addIcons({ cartOutline, personOutline });
  }

  ngOnInit() {
    // 🔹 Suscribirse a cambios del carrito
    this.cartSub = this.cartService.cart$.subscribe(cart => {
      this.cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    });
  }

  ngOnDestroy() {
    this.cartSub.unsubscribe();
  }

  async onCartClick() {
    if (!this.isLoggedIn) {
      const alert = await this.alertController.create({
        header: 'Atención',
        subHeader: 'Carrito de compras',
        message: 'Debes estar registrado para ver tu carrito.',
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          { text: 'Registrarse', handler: () => this.router.navigate(['/register']) }
        ]
      });
      await alert.present();
      return;
    }

    if (this.cartCount === 0) {
      // 🚨 Alert cuando el carrito está vacío
      const alert = await this.alertController.create({
        header: 'Carrito vacío',
        message: 'Debes agregar productos al carrito para acceder a esta opción.',
        buttons: [
          {
            text: 'Aceptar',
            handler: () => this.router.navigate(['/menu'])
          }
        ],
        mode: 'ios'
      });
      await alert.present();
      return;
    }

    // Si hay productos en el carrito
    this.router.navigate(['/cart']);
  }

  openPopover(ev: Event) {
    this.popoverEvent = ev;
    this.showPopover = true;
  }

  onPopoverDismiss() {
    this.showPopover = false;
  }

  goHome(){
    this.navCtrl.navigateRoot(['/home'])
  }

}
