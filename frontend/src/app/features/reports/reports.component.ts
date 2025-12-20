import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AggregationSummary } from '../../core/models';

@Component({
  selector: 'app-reports',
  template: `
    <div class="reports">
      <h2>Reports</h2>
      <div class="filters">
        <input type="date" [(ngModel)]="filters.start_date" placeholder="Start Date">
        <input type="date" [(ngModel)]="filters.end_date" placeholder="End Date">
        <button (click)="loadSummary()">Apply Filters</button>
      </div>
      <div *ngIf="summary" class="summary">
        <div class="totals">
          <p>Total Income: {{ summary.total_income }}</p>
          <p>Total Expenses: {{ summary.total_expenses }}</p>
          <p>Net Total: {{ summary.net_total }}</p>
        </div>
        <div class="categories">
          <h3>By Category</h3>
          <ul>
            <li *ngFor="let cat of summary.by_category">
              {{ cat.category_name }}: {{ cat.total }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  `
})
export class ReportsComponent implements OnInit {
  summary?: AggregationSummary;
  filters: any = {};

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadSummary();
  }

  loadSummary(): void {
    let url = 'http://localhost:8000/aggregations/summary';
    const params = new URLSearchParams();
    if (this.filters.start_date) params.append('start_date', this.filters.start_date);
    if (this.filters.end_date) params.append('end_date', this.filters.end_date);
    if (params.toString()) url += '?' + params.toString();

    this.http.get<AggregationSummary>(url).subscribe(
      data => this.summary = data
    );
  }
}
