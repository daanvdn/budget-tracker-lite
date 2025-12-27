import {Component, HostListener} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {AuthService} from './core/services/auth.service';
import {map, shareReplay} from 'rxjs';
import {environment} from '../environments/environment';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'Budget Tracker Lite';
    mobileNavOpen = false;
    showScrollTop = false;
    readonly isAuthenticated$ = this.authService.currentUser$.pipe(
        map(user => !!user),
        shareReplay(1)
    );
    // Expose the current user observable for template welcome message
    readonly currentUser$ = this.authService.currentUser$.pipe(shareReplay(1));
    readonly isDevBypass$ = !environment.production && !!environment.devBypassHeader;

    constructor(
        private authService: AuthService,
        private router: Router
    ) {
    }

    toggleMobileNav(): void {
        this.mobileNavOpen = !this.mobileNavOpen;
    }

    closeMobileNav(): void {
        this.mobileNavOpen = false;
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }

    @HostListener('window:scroll', [])
    onWindowScroll(): void {
        const y = window.scrollY || window.pageYOffset;
        this.showScrollTop = y > 200;
    }

    scrollToTop(): void {
        window.scrollTo({top: 0, behavior: 'smooth'});
    }
}
