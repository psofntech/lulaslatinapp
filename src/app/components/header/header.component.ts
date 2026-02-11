import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';

import { IonHeader, IonToolbar, IonPopover , IonButtons, IonMenuButton, IonButton, IonIcon, IonBadge, ModalController } from "@ionic/angular/standalone";
import { UserPopoverComponent } from '../user-popover/user-popover.component';

import { addIcons } from 'ionicons';
import { cartOutline, personOutline, notificationsOutline } from 'ionicons/icons';
import { map, Subscription } from 'rxjs';
import { CartService } from 'src/app/services/cart';
import { AuthService } from 'src/app/services/auth';
import { NotificationStore } from 'src/app/stores/notification.store';
import { NotificationCenterComponent } from '../notification-center/notification-center.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [CommonModule, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonButton, IonIcon, IonBadge, IonPopover, UserPopoverComponent],
  providers: [AlertController, NavController],
})
export class HeaderComponent implements OnInit, OnDestroy {

  @ViewChild(IonPopover) popover!: IonPopover;

  isLoggedIn: boolean = false; 
  @Input() showMenuButton: boolean = false;

  showPopover = false;
  popoverEvent: any;

  authSub!: Subscription;

  cartCount: number = 0;  // reactivo
  private cartSub!: Subscription;
  
  unreadCount$ = this.notificationStore.notifications$.pipe(
    map(n => n.filter(x => !x.read).length)
  );

  constructor(
    private alertController: AlertController,
    private router: Router,
    private cartService: CartService,
    private navCtrl: NavController,
    private authService: AuthService,
    private notificationStore: NotificationStore,
    private modalCtrl: ModalController,
  ) { 
    addIcons({ cartOutline, personOutline, notificationsOutline });
  }

  ngOnInit() {
    // 🔹 Suscribirse a cambios del carrito
    this.cartSub = this.cartService.cart$.subscribe(cart => {
      this.cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    });

    this.authSub = this.authService.getUser().subscribe(user => {
      this.isLoggedIn = !!user; // true si hay usuario, false si es null
    });
  }

  ngOnDestroy() {
    this.cartSub.unsubscribe();
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
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
      const alert = await this.alertController.create({
        header: 'Carrito vacío',
        message: 'Debes agregar productos al carrito para acceder a esta opción.',
        buttons: ['Aceptar'],
        backdropDismiss: false
      });

      await alert.present();
      await alert.onDidDismiss();

      this.router.navigate(['/menu']);
      return;
    }

    // Si hay productos en el carrito
    this.router.navigate(['/cart']);
  }

  openPopover(ev: Event) {
    this.popoverEvent = ev;
    this.showPopover = true;
  }

  async onPopoverDismiss() {
    await this.popover.dismiss();
    this.showPopover = false;
    this.popoverEvent = undefined;  
  }

  goHome(){
    this.navCtrl.navigateRoot(['/home'])
  }

  openNotifications() {
      // Abrir modal con NotificationCenterComponent
    this.modalCtrl.create({
      component: NotificationCenterComponent
    }).then(modal => modal.present());
  }

}
