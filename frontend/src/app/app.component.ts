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
  styleUrls: ['./app.component.css']
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
