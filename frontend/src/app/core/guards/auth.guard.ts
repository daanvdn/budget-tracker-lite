import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable, of} from 'rxjs';
import {map, timeoutWith} from 'rxjs/operators';
import {AuthService} from '../services/auth.service';
import {environment} from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private router: Router
    ) {
    }

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
            // Dev: attempt to probe server to populate currentUser$, but allow navigation even if probe returns null
            return this.authService.probeCurrentUser().pipe(
                // If probe emits a user or null, allow navigation (true). We still keep the existing behavior of
                // populating currentUser$ when the backend returns a user via AuthService.getCurrentUser().
                map(() => true),
                // Safety: if the probe somehow errors or takes too long, allow navigation after a short timeout
                timeoutWith(2000, of(true))
            );
        }

        // Default behavior: redirect to login
        this.router.navigate(['/login'], {
            queryParams: {returnUrl: state.url}
        });
        return false;
    }
}
