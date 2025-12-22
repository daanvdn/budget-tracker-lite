import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService, Transaction } from '../../core/services/transaction.service';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="transaction-list">
      <h2>Transactions</h2>
      <div class="filters">
        <input type="date" [(ngModel)]="filters.start_date" placeholder="Start Date">
        <input type="date" [(ngModel)]="filters.end_date" placeholder="End Date">
        <button (click)="applyFilters()">Filter</button>
      </div>
      <table *ngIf="transactions.length > 0">
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Type</th>
            <th>Description</th>
            <th>Category</th>
            <th>Beneficiary</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let transaction of transactions">
            <td>{{ transaction.transaction_date }}</td>
            <td>{{ transaction.amount }}</td>
            <td>{{ transaction.type }}</td>
            <td>{{ transaction.description }}</td>
            <td>{{ transaction.category?.name }}</td>
            <td>{{ transaction.beneficiary?.name }}</td>
          </tr>
        </tbody>
      </table>
      <p *ngIf="transactions.length === 0">No transactions found.</p>
    </div>
  `
})
export class TransactionListComponent implements OnInit {
  transactions: Transaction[] = [];
  filters: any = {};

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.transactionService.getTransactions().subscribe(
      data => this.transactions = data
    );
  }

  applyFilters(): void {
    this.transactionService.getTransactions().subscribe(
      data => this.transactions = data
    );
  }
}
