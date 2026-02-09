import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from 'src/app/services/auth';
import { RoleUser } from 'src/interfaces/auth.interfaces';
import { map, take } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot) {
    return this.checkRole(route);
  }

  canActivateChild(route: ActivatedRouteSnapshot) {
    return this.checkRole(route);
  }

  private checkRole(route: ActivatedRouteSnapshot) {
    const roles = route.data['roles'] as RoleUser[];

    return this.auth.getUser().pipe(
      take(1),
      map(user => {
        if (!user || !roles.includes(user.role)) {
          this.router.navigate(['/unauthorized']);
          return false;
        }
        return true;
      })
    );
  }
}
