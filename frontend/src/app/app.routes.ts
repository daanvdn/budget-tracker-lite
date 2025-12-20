import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/transactions', pathMatch: 'full' },
  {
    path: 'transactions',
    loadComponent: () => import('./features/transactions/transactions.component').then(m => m.TransactionsComponent)
  },
  {
    path: 'reports',
    loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent)
  },
  {
    path: 'categories',
    loadComponent: () => import('./features/categories/categories.component').then(m => m.CategoriesComponent)
  },
  {
    path: 'beneficiaries',
    loadComponent: () => import('./features/beneficiaries/beneficiaries.component').then(m => m.BeneficiariesComponent)
  },
  {
    path: 'users',
    loadComponent: () => import('./features/users/users.component').then(m => m.UsersComponent)
  }
];
