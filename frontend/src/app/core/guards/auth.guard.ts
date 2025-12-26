import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take, timeoutWith, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> {
    // If token exists and is valid, allow immediately
    if (this.authService.isAuthenticated()) {
      return true;
    }

    // In dev, trigger a /me probe and then wait briefly for currentUser$ to emit
    if (!environment.production && environment.devBypassHeader) {
      return this.authService.probeCurrentUser().pipe(
        switchMap(() => this.authService.currentUser$.pipe(
          take(1),
          map(user => {
            if (user) return true;
            this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
            return false;
          }),
          timeoutWith(2000, of(false))
        ))
      );
    }

    // Default behavior: redirect to login
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
}
