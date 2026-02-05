import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import {
  IonApp,
  IonContent,
  IonHeader,
  IonMenu,
  IonMenuButton,
  IonMenuToggle,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonList,
  IonItem,
  IonIcon,
} from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';

import { addIcons } from 'ionicons';
import { listOutline, personOutline, logOutOutline, homeOutline } from 'ionicons/icons';
import { User } from 'src/interfaces/auth.interfaces';
import { AuthStorageService } from 'src/app/services/auth-storage';
import { AuthService } from 'src/app/services/auth';

@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss'],
  standalone: true,
  imports: [
    IonApp,
    IonContent,
    IonHeader,
    IonMenu,
    IonMenuButton,
    IonMenuToggle,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonList,
    IonItem,
    IonIcon,
    RouterOutlet
  ],
  providers: [NavController]
})
export class DashboardLayoutComponent implements OnInit, OnDestroy {

  pageTitle: string = 'Dashboard';
  activeRoute: 'my-orders' | 'profile' | 'dashboard' = 'dashboard';
  currentUser: User | null = null;

  private routerSub!: Subscription;

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private authService: AuthService,
    private authStorage: AuthStorageService
  ) {
    // Registrar iconos
    addIcons({ listOutline, personOutline, logOutOutline, homeOutline });
  }

  async ngOnInit() {
    // Obtener usuario actual desde AuthService
    this.currentUser = await this.authStorage.getUser();

    // Suscribirse a cambios de ruta
    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;

        // Actualizar título
        if (url.includes('my-orders')) this.pageTitle = 'My Orders';
        else if (url.includes('profile')) this.pageTitle = 'Profile';
        else this.pageTitle = 'Dashboard';

        // Actualizar ruta activa
        if (url.includes('/dashboard/my-orders')) this.activeRoute = 'my-orders';
        else if (url.includes('/dashboard/profile')) this.activeRoute = 'profile';
        else this.activeRoute = 'dashboard';
      });
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
  }

  // Navegar a una sección del dashboard
  navigateTo(path: string) {
    this.navCtrl.navigateForward(`/dashboard/${path}`);
  }

  // Logout usando AuthService
  async logout() {
    await this.authService.logout();
    this.navCtrl.navigateRoot(['/login']);
  }

  goToDash() {
    this.navCtrl.navigateForward('/dashboard');
  }

  goHome() {
    this.navCtrl.navigateRoot(['/home']);
  }
}
