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
  templateUrl: './reports.component.html',
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
