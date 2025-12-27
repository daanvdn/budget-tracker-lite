import {Injectable, Injector} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {Router} from '@angular/router';
import {AuthService} from '../services/auth.service';
import {environment} from '../../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(
        private injector: Injector,
        private router: Router
    ) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Resolve AuthService lazily to avoid circular DI (AuthService -> HttpClient -> interceptors)
        const authService = this.injector.get(AuthService);

        // Build headers map to pass to clone() as a plain object
        const headersToSet: Record<string, string> = {};

        // Get the auth token from the service and include it if present
        const authToken = authService.getToken();
        if (authToken) {
            headersToSet['Authorization'] = `Bearer ${authToken}`;
        }

        // DEV: add dev bypass header when running in dev
        if (!environment.production && environment.devBypassHeader) {
            // Debug: log when we add the dev bypass header and which request it's added to
            try {
                // Small, non-blocking debug that won't throw in prod
                // eslint-disable-next-line no-console
                console.debug(
                    `[AuthInterceptor] Adding dev bypass header '${environment.devBypassHeader}' to request: ${req.url}`);
            } catch {}
            headersToSet[environment.devBypassHeader] = '1';
        }

        // Clone the request once with the computed headers (if any)
        if (Object.keys(headersToSet).length > 0) {
            req = req.clone({setHeaders: headersToSet});
        }

        // Handle the request and catch errors
        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    console.debug('Error 401 Unauthorized - redirecting to login.', error);
                    // Unauthorized - redirect to login
                    authService.logout();
                    this.router.navigate(['/login']);
                    console.debug("Redirected to login due to 401 Unauthorized.");
                }
                return throwError(() => error);
            })
        );
    }
}
