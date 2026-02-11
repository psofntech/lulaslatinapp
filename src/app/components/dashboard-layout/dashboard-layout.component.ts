import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter, map, Subscription } from 'rxjs';
import {
  NavController, 
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
  IonButton,
  IonBadge,
  ModalController
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { listOutline, personOutline, logOutOutline, homeOutline, analyticsOutline, peopleOutline, gridOutline, notificationsOutline } from 'ionicons/icons';
import { RoleUser, User } from 'src/interfaces/auth.interfaces';
import { AuthStorageService } from 'src/app/services/auth-storage';
import { AuthService } from 'src/app/services/auth';
import { NotificationStore } from 'src/app/stores/notification.store';
import { NotificationCenterComponent } from '../notification-center/notification-center.component';
import { CommonModule } from '@angular/common';



interface MenuItem {
  label: string;
  title: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
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
    IonButton,
    IonBadge,
    RouterOutlet
  ],
})
export class DashboardLayoutComponent implements OnInit, OnDestroy {

  pageTitle: string = 'Dashboard';
  activeRoute = '';
  currentUser: User | null = null;
  menuItems: MenuItem[] = [];

  isNotificationOpen: boolean = false;

  RoleUser = RoleUser;

  private routerSub!: Subscription;

  unreadCount$ = this.notificationStore.notifications$.pipe(
    map(n => n.filter(x => !x.read).length)
  );

  menuByRole: Record<string, MenuItem[]> = {
    customer: [
      { label: 'Dashboard', title: 'Welcome', icon: 'home-outline', route: '/dashboard' },
      { label: 'Orders', title: 'My Orders', icon: 'list-outline', route: '/dashboard/my-orders' },
      { label: 'Profile', title: 'My Profile', icon: 'person-outline', route: '/dashboard/profile' }
    ],
  
    admin: [
      { label: 'Admin Panel', title: 'Administration', icon: 'grid-outline', route: '/dashboard/admin' },
      { label: 'Users', title: 'User Management', icon: 'people-outline', route: '/dashboard/admin/users' },
      { label: 'Profile', title: 'Admin Profile', icon: 'person-outline', route: '/dashboard/admin/profile' }
    ],
  
    order_manager: [
      { label: 'Dashboard', title: 'Manager Overview', icon: 'analytics-outline', route: '/dashboard/manager' },
      { label: 'Orders', title: 'Order Management', icon: 'list-outline', route: '/dashboard/manager/orders' },
      { label: 'Profile', title: 'Manager Profile', icon: 'person-outline', route: '/dashboard/manager/profile' }
    ]
  };

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private authService: AuthService,
    private authStorage: AuthStorageService,
    private notificationStore: NotificationStore,
    private modalCtrl: ModalController,
  ) {
    // Registrar iconos
    addIcons({ listOutline, personOutline, logOutOutline, homeOutline, analyticsOutline, peopleOutline, gridOutline, notificationsOutline });
  }

  async ngOnInit() {
    // Obtener usuario actual desde AuthService
    this.currentUser = await this.authStorage.getUser();

    this.authService.getUser().subscribe(user => {
      this.currentUser = user;
  
      if (user) {
        this.menuItems = this.menuByRole[user.role] || [];
      }
    });

    // Suscribirse a cambios de ruta
    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;

        this.activeRoute = url;

        const activeItem = this.menuItems.find(
          item => item.route === url
        );

        this.pageTitle = activeItem?.title || 'Dashboard';
        
        if (url.includes('/dashboard/my-orders') || url.includes('/dashboard/manager/orders')) {
          const tab = url.endsWith('completed') ? 'completed' : 'pending';
        }
      });
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
  }

  openNotifications() {
    // Abrir modal con NotificationCenterComponent
    this.modalCtrl.create({
      component: NotificationCenterComponent
    }).then(modal => modal.present());
  }

  // Navegar a una sección del dashboard
  navigateTo(path: string) {
    this.navCtrl.navigateForward(path);
  }

  // Logout usando AuthService
  async logout() {
    await this.authService.logout();
    this.navCtrl.navigateRoot('/login');
  }

  async goHome() {
    if (!this.currentUser) return;
  
    switch (this.currentUser.role) {
      case RoleUser.customer:
        this.navCtrl.navigateRoot('/home');
        break;
      case RoleUser.order_manager:
        this.navCtrl.navigateRoot('/dashboard/manager');
        break;
    }
  }
}
