import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { map, shareReplay } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styles: [`
    .app-shell {
      min-height: 100vh;
      background: #f5f5f5;
    }

    .app-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      background: #0d6efd;
      color: #fff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .brand {
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .nav-links {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .nav-links a {
      color: #fff;
      text-decoration: none;
      font-weight: 500;
      padding: 6px 10px;
      border-radius: 4px;
      transition: background-color 0.2s ease;
    }

    .nav-links a:hover,
    .nav-links a.active {
      background: rgba(255, 255, 255, 0.2);
    }

    .logout-btn {
      border: 1px solid rgba(255, 255, 255, 0.7);
      background: transparent;
      color: #fff;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s ease, color 0.2s ease;
    }

    .logout-btn:hover {
      background: rgba(255, 255, 255, 0.15);
    }
  `]
})
export class AppComponent {
  title = 'Budget Tracker Lite';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  readonly isAuthenticated$ = this.authService.currentUser$.pipe(
    map(user => !!user),
    shareReplay(1)
  );

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
