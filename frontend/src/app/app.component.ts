import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">
      <header class="app-header">
        <div class="brand">Budget Tracker Lite</div>
        <nav class="nav-links">
          <a routerLink="/transactions" routerLinkActive="active">Transactions</a>
          <a routerLink="/categories" routerLinkActive="active">Categories</a>
          <a routerLink="/beneficiaries" routerLinkActive="active">Beneficiaries</a>
          <a routerLink="/reports" routerLinkActive="active">Reports</a>
          <a routerLink="/users" routerLinkActive="active">Users</a>
        </nav>
      </header>
      <router-outlet></router-outlet>
    </div>
  `,
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
  `]
})
export class AppComponent {
  title = 'Budget Tracker Lite';
}
