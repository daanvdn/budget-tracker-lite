import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, of, tap} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {environment} from '../../../environments/environment';

export interface User {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    created_at: string;
}

export interface TokenResponse {
    access_token: string;
    token_type: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface ForgotPasswordResponse {
    message: string;
    reset_token?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) {
        // If a token is present, load the current user
        if (this.getToken()) {
            this.loadCurrentUser();
        }

        // If running in dev and the dev bypass header is configured, probe /me so dev header can authenticate the
        // session
        if (!environment.production && environment.devBypassHeader) {
            this.loadCurrentUser({suppressLogoutOnErrorIfNoToken: true});
        }
    }

    register(data: RegisterData): Observable<User> {
        return this.http.post<User>(`${this.apiUrl}/register`, data);
    }

    login(data: LoginData): Observable<TokenResponse> {
        return this.http.post<TokenResponse>(`${this.apiUrl}/login`, data).pipe(
            tap(response => {
                this.setToken(response.access_token);
                this.loadCurrentUser();
            })
        );
    }

    logout(): void {
        localStorage.removeItem('access_token');
        this.currentUserSubject.next(null);
    }

    forgotPassword(email: string): Observable<ForgotPasswordResponse> {
        return this.http.post<ForgotPasswordResponse>(`${this.apiUrl}/forgot-password`, {email});
    }

    resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, {
            token,
            new_password: newPassword
        });
    }

    getCurrentUser(): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/me`).pipe(
            tap(user => this.currentUserSubject.next(user))
        );
    }

    // Public helper to trigger /me probe and return null on error instead of throwing
    public probeCurrentUser(): Observable<User | null> {
        return this.getCurrentUser().pipe(
            catchError(() => of(null))
        );
    }

    isAuthenticated(): boolean {
        const token = this.getToken();
        if (!token) {
            return false;
        }

        // Check if token is expired (basic check)
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const exp = payload.exp * 1000; // Convert to milliseconds
            return Date.now() < exp;
        } catch {
            return false;
        }
    }

    getToken(): string | null {
        return localStorage.getItem('access_token');
    }

    private setToken(token: string): void {
        localStorage.setItem('access_token', token);
    }

    private loadCurrentUser(options?: { suppressLogoutOnErrorIfNoToken?: boolean }): void {
        this.probeCurrentUser().subscribe({
            next: (user) => {
                // Log probe outcome for easier debugging in dev
                try {
                    // eslint-disable-next-line no-console
                    console.debug('[AuthService] probeCurrentUser result:', user);
                } catch {}
                // If a user object was returned, the BehaviorSubject has already been updated by getCurrentUser's tap
            },
            error: () => {
                // On errors during app bootstrap, only force logout if a token exists.
                // This avoids immediately logging out dev sessions that rely on the header-only bypass.
                if (this.getToken() && !options?.suppressLogoutOnErrorIfNoToken) {
                    this.logout();
                }
            }
        });
    }
}
