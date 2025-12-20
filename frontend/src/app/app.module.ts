import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';
import { TransactionListComponent } from './features/transactions/transaction-list.component';
import { TransactionFormComponent } from './features/transactions/transaction-form.component';
import { ReportsComponent } from './features/reports/reports.component';
import { CategoryListComponent } from './features/categories/category-list.component';
import { BeneficiaryListComponent } from './features/beneficiaries/beneficiary-list.component';
import { UserListComponent } from './features/users/user-list.component';

@NgModule({
  declarations: [
    AppComponent,
    TransactionListComponent,
    TransactionFormComponent,
    ReportsComponent,
    CategoryListComponent,
    BeneficiaryListComponent,
    UserListComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
