import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AggregationService } from '../../core/services/aggregation.service';
import { CategoryService } from '../../core/services/category.service';
import { BeneficiaryService } from '../../core/services/beneficiary.service';
import { AggregationSummary, Category, Beneficiary } from '../../shared/models/models';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Reports & Aggregations</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="filterForm" class="filter-form">
          <h3>Filters</h3>
          
          <mat-form-field class="form-field-full-width">
            <mat-label>Start Date</mat-label>
            <input matInput [matDatepicker]="startPicker" formControlName="start_date">
            <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field class="form-field-full-width">
            <mat-label>End Date</mat-label>
            <input matInput [matDatepicker]="endPicker" formControlName="end_date">
            <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field class="form-field-full-width">
            <mat-label>Transaction Type</mat-label>
            <mat-select formControlName="transaction_type">
              <mat-option [value]="null">All</mat-option>
              <mat-option value="expense">Expense</mat-option>
              <mat-option value="income">Income</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field class="form-field-full-width">
            <mat-label>Category</mat-label>
            <mat-select formControlName="category_id">
              <mat-option [value]="null">All</mat-option>
              <mat-option *ngFor="let category of categories" [value]="category.id">
                {{ category.name }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field class="form-field-full-width">
            <mat-label>Beneficiary</mat-label>
            <mat-select formControlName="beneficiary_id">
              <mat-option [value]="null">All</mat-option>
              <mat-option *ngFor="let beneficiary of beneficiaries" [value]="beneficiary.id">
                {{ beneficiary.name }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <div class="quick-filters">
            <button mat-raised-button type="button" (click)="setLastMonth()">Last Month</button>
            <button mat-raised-button type="button" (click)="setLast2Months()">Last 2 Months</button>
            <button mat-raised-button type="button" (click)="clearFilters()">Clear Filters</button>
          </div>

          <button mat-raised-button color="primary" type="button" (click)="loadSummary()">
            Apply Filters
          </button>
        </form>

        <div class="summary-cards" *ngIf="summary">
          <mat-card class="summary-card income-card">
            <mat-card-header>
              <mat-card-title>Total Income</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="summary-amount">{{ summary.total_income | currency }}</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card expense-card">
            <mat-card-header>
              <mat-card-title>Total Expenses</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="summary-amount">{{ summary.total_expenses | currency }}</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card balance-card">
            <mat-card-header>
              <mat-card-title>Net Balance</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="summary-amount" [class.positive]="summary.net_balance > 0" [class.negative]="summary.net_balance < 0">
                {{ summary.net_balance | currency }}
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-header>
              <mat-card-title>Transaction Count</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="summary-amount">{{ summary.transaction_count }}</div>
            </mat-card-content>
          </mat-card>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .filter-form {
      margin-bottom: 20px;
      padding: 20px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .quick-filters {
      display: flex;
      gap: 10px;
      margin: 20px 0;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .summary-card {
      text-align: center;
    }

    .summary-amount {
      font-size: 2em;
      font-weight: bold;
      margin: 20px 0;
    }

    .income-card .summary-amount {
      color: green;
    }

    .expense-card .summary-amount {
      color: red;
    }

    .positive {
      color: green;
    }

    .negative {
      color: red;
    }
  `]
})
export class ReportsComponent implements OnInit {
  filterForm: FormGroup;
  summary: AggregationSummary | null = null;
  categories: Category[] = [];
  beneficiaries: Beneficiary[] = [];

  constructor(
    private fb: FormBuilder,
    private aggregationService: AggregationService,
    private categoryService: CategoryService,
    private beneficiaryService: BeneficiaryService
  ) {
    this.filterForm = this.fb.group({
      start_date: [null],
      end_date: [null],
      transaction_type: [null],
      category_id: [null],
      beneficiary_id: [null]
    });
  }

  ngOnInit() {
    this.loadCategories();
    this.loadBeneficiaries();
    this.loadSummary();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (data) => this.categories = data
    });
  }

  loadBeneficiaries() {
    this.beneficiaryService.getBeneficiaries().subscribe({
      next: (data) => this.beneficiaries = data
    });
  }

  loadSummary() {
    const filters: any = {};
    const formValue = this.filterForm.value;

    if (formValue.start_date) {
      filters.start_date = formValue.start_date.toISOString();
    }
    if (formValue.end_date) {
      filters.end_date = formValue.end_date.toISOString();
    }
    if (formValue.transaction_type) {
      filters.transaction_type = formValue.transaction_type;
    }
    if (formValue.category_id) {
      filters.category_id = formValue.category_id;
    }
    if (formValue.beneficiary_id) {
      filters.beneficiary_id = formValue.beneficiary_id;
    }

    this.aggregationService.getSummary(filters).subscribe({
      next: (data) => this.summary = data
    });
  }

  setLastMonth() {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    this.filterForm.patchValue({
      start_date: lastMonth,
      end_date: now
    });
    this.loadSummary();
  }

  setLast2Months() {
    const now = new Date();
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
    this.filterForm.patchValue({
      start_date: twoMonthsAgo,
      end_date: now
    });
    this.loadSummary();
  }

  clearFilters() {
    this.filterForm.reset();
    this.loadSummary();
  }
}
