import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';
import { DashboardLayoutComponent } from './components/dashboard-layout/dashboard-layout.component';
import { RoleGuard } from './guards/role.guards';
import { RoleUser } from 'src/interfaces/auth.interfaces';
import { NoAuthGuard } from './guards/no-auth.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'menu',
    loadComponent: () => import('./pages/menu/menu.page').then( m => m.MenuPage)
  },
  {
    path: 'products',
    loadComponent: () => import('./pages/products/products.page').then( m => m.ProductsPage)
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart.page').then( m => m.CartPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout.page').then( m => m.CheckoutPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    canActivate: [NoAuthGuard],
    loadComponent: () => import('./pages/auth/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'register',
    canActivate: [NoAuthGuard],
    loadComponent: () => import('./pages/auth/register/register.page').then( m => m.RegisterPage)
  },
  {
    path: 'reset-password',
    canActivate: [NoAuthGuard],
    loadComponent: () => import('./pages/auth/reset-password/reset-password.page').then( m => m.ResetPasswordPage)
  },
  {
    path: 'success',
    loadComponent: () => import('./pages/success/success.page').then( m => m.SuccessPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        canActivateChild: [RoleGuard],
        data: { roles: [RoleUser.customer] },
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/client/panel/panel.page').then(m => m.PanelPage)
          },
          {
            path: 'my-orders',
            loadComponent: () => import('./pages/client/my-orders/my-orders.page').then(m => m.MyOrdersPage)
          },
          {
            path: 'profile',
            loadComponent: () => import('./pages/client/profile/profile.page').then(m => m.ProfilePage)
          },
          {
            path: 'my-orders/:id',
            loadComponent: () => import('./pages/client/my-order-detail/my-order-detail.page').then( m => m.MyOrderDetailPage)
          }
        ]
      },
      {
        path: 'manager',
        canActivateChild: [RoleGuard],
        data: { roles: [RoleUser.order_manager] },
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/manager/panel/panel.page').then(m => m.PanelPage)
          },
          {
            path: 'orders',
            loadComponent: () => import('./pages/manager/order/order.page').then(m => m.OrderPage)
          },
          {
            path: 'profile',
            loadComponent: () => import('./pages/manager/profile/profile.page').then(m => m.ProfilePage)
          }
        ]
      },
      {
        path: 'admin',
        canActivateChild: [RoleGuard],
        data: { roles: [RoleUser.admin]},
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/admin/panel/panel.page').then( m => m.PanelPage),
          }
        ]
      }
    ],
  },

];
