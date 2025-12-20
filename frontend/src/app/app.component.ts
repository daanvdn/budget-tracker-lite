import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule
  ],
  template: `
    <mat-toolbar color="primary">
      <button mat-icon-button (click)="drawer.toggle()">
        <mat-icon>menu</mat-icon>
      </button>
      <span>Budget Tracker Lite</span>
      <span class="spacer"></span>
    </mat-toolbar>

    <mat-drawer-container class="drawer-container" autosize>
      <mat-drawer #drawer mode="side" opened>
        <mat-nav-list>
          <a mat-list-item routerLink="/transactions" routerLinkActive="active">
            <mat-icon matListItemIcon>receipt</mat-icon>
            <span matListItemTitle>Transactions</span>
          </a>
          <a mat-list-item routerLink="/reports" routerLinkActive="active">
            <mat-icon matListItemIcon>bar_chart</mat-icon>
            <span matListItemTitle>Reports</span>
          </a>
          <mat-divider></mat-divider>
          <a mat-list-item routerLink="/categories" routerLinkActive="active">
            <mat-icon matListItemIcon>category</mat-icon>
            <span matListItemTitle>Categories</span>
          </a>
          <a mat-list-item routerLink="/beneficiaries" routerLinkActive="active">
            <mat-icon matListItemIcon>people</mat-icon>
            <span matListItemTitle>Beneficiaries</span>
          </a>
          <a mat-list-item routerLink="/users" routerLinkActive="active">
            <mat-icon matListItemIcon>person</mat-icon>
            <span matListItemTitle>Users</span>
          </a>
        </mat-nav-list>
      </mat-drawer>

      <mat-drawer-content>
        <div class="container">
          <router-outlet></router-outlet>
        </div>
      </mat-drawer-content>
    </mat-drawer-container>
  `,
  styles: [`
    .drawer-container {
      height: calc(100vh - 64px);
    }

    mat-drawer {
      width: 250px;
    }

    .active {
      background-color: rgba(0, 0, 0, 0.04);
    }
  `]
})
export class AppComponent {
  title = 'Budget Tracker Lite';
}
