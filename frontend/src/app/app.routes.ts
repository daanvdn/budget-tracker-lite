import {Routes} from '@angular/router';
import {LoginComponent} from './features/auth/login/login.component';
import {RegisterComponent} from './features/auth/register/register.component';
import {ForgotPasswordComponent} from './features/auth/forgot-password/forgot-password.component';
import {ResetPasswordComponent} from './features/auth/reset-password/reset-password.component';
import {TransactionsComponent} from './features/transactions/transactions.component';
import {CategoriesComponent} from './features/categories/categories.component';
import {BeneficiariesComponent} from './features/beneficiaries/beneficiaries.component';
import {ReportsComponent} from './features/reports/reports.component';
import {UsersComponent} from './features/users/users.component';
import {GiftOccasionsListComponent} from './features/gifts/gift-occasions-list.component';
import {GiftOccasionDetailComponent} from './features/gifts/gift-occasion-detail.component';
import {AuthGuard} from './core/guards/auth.guard';
import {environment} from '../environments/environment';

export const routes: Routes = [
    {path: 'login', component: LoginComponent},
    {path: 'register', component: RegisterComponent},
    {path: 'forgot-password', component: ForgotPasswordComponent},
    {path: 'reset-password', component: ResetPasswordComponent},
    {path: '', redirectTo: 'transactions', pathMatch: 'full'},
    // In dev mode, do not use AuthGuard for protected routes
    ...(!environment.production ? [
        {path: 'transactions', component: TransactionsComponent},
        {path: 'categories', component: CategoriesComponent},
        {path: 'beneficiaries', component: BeneficiariesComponent},
        {path: 'reports', component: ReportsComponent},
        {path: 'users', component: UsersComponent},
        {path: 'gifts', component: GiftOccasionsListComponent},
        {path: 'gifts/:id', component: GiftOccasionDetailComponent}
    ] : [
        {path: 'transactions', component: TransactionsComponent, canActivate: [AuthGuard]},
        {path: 'categories', component: CategoriesComponent, canActivate: [AuthGuard]},
        {path: 'beneficiaries', component: BeneficiariesComponent, canActivate: [AuthGuard]},
        {path: 'reports', component: ReportsComponent, canActivate: [AuthGuard]},
        {path: 'users', component: UsersComponent, canActivate: [AuthGuard]},
        {path: 'gifts', component: GiftOccasionsListComponent, canActivate: [AuthGuard]},
        {path: 'gifts/:id', component: GiftOccasionDetailComponent, canActivate: [AuthGuard]}
    ]),
    {path: '**', redirectTo: 'transactions'}
];
