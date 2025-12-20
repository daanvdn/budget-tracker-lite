import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TransactionService, Transaction, TransactionCreate } from '../../../core/services/transaction.service';
import { AuthService, User } from '../../../core/services/auth.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="transactions-container">
      <header class="header">
        <h1>Budget Tracker</h1>
        <div class="user-info" *ngIf="currentUser">
          <span>Welcome, {{ currentUser.name }}</span>
          <button class="btn btn-secondary" (click)="logout()">Logout</button>
        </div>
      </header>

      <div class="content">
        <div class="transaction-form-section">
          <h2>Add Transaction</h2>
          <form [formGroup]="transactionForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <div class="form-group">
                <label for="description">Description</label>
                <input
                  type="text"
                  id="description"
                  formControlName="description"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label for="amount">Amount</label>
                <input
                  type="number"
                  id="amount"
                  formControlName="amount"
                  class="form-control"
                  step="0.01"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="category">Category</label>
                <input
                  type="text"
                  id="category"
                  formControlName="category"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label for="type">Type</label>
                <select id="type" formControlName="type" class="form-control">
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
            </div>

            <div class="error-message" *ngIf="errorMessage">
              {{ errorMessage }}
            </div>

            <button type="submit" class="btn btn-primary" [disabled]="transactionForm.invalid || loading">
              {{ loading ? 'Adding...' : 'Add Transaction' }}
            </button>
          </form>
        </div>

        <div class="transactions-list-section">
          <h2>Transactions</h2>
          
          <div class="summary" *ngIf="transactions.length > 0">
            <div class="summary-item income">
              <span class="label">Total Income:</span>
              <span class="value">\${{ totalIncome.toFixed(2) }}</span>
            </div>
            <div class="summary-item expense">
              <span class="label">Total Expenses:</span>
              <span class="value">\${{ totalExpenses.toFixed(2) }}</span>
            </div>
            <div class="summary-item balance">
              <span class="label">Balance:</span>
              <span class="value" [class.negative]="balance < 0">\${{ balance.toFixed(2) }}</span>
            </div>
          </div>

          <div class="transactions-list" *ngIf="transactions.length > 0; else noTransactions">
            <div class="transaction-item" *ngFor="let transaction of transactions" [class]="transaction.type">
              <div class="transaction-info">
                <div class="transaction-description">{{ transaction.description }}</div>
                <div class="transaction-category">{{ transaction.category }}</div>
                <div class="transaction-date">{{ formatDate(transaction.date) }}</div>
              </div>
              <div class="transaction-amount" [class]="transaction.type">
                {{ transaction.type === 'income' ? '+' : '-' }}\${{ transaction.amount.toFixed(2) }}
              </div>
              <button class="btn-delete" (click)="deleteTransaction(transaction.id)">Delete</button>
            </div>
          </div>

          <ng-template #noTransactions>
            <div class="no-transactions">
              <p>No transactions yet. Add your first transaction above!</p>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .transactions-container {
      min-height: 100vh;
      background: #f5f5f5;
    }

    .header {
      background: white;
      padding: 20px 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header h1 {
      margin: 0;
      color: #333;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .user-info span {
      color: #555;
    }

    .content {
      max-width: 1200px;
      margin: 40px auto;
      padding: 0 20px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
    }

    @media (max-width: 768px) {
      .content {
        grid-template-columns: 1fr;
      }
    }

    .transaction-form-section,
    .transactions-list-section {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    h2 {
      margin: 0 0 20px 0;
      color: #333;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 15px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    label {
      margin-bottom: 5px;
      color: #555;
      font-weight: 500;
      font-size: 14px;
    }

    .form-control {
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .error-message {
      color: #dc3545;
      font-size: 12px;
      margin-bottom: 10px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .btn-primary {
      background: #007bff;
      color: white;
      width: 100%;
    }

    .btn-primary:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #5a6268;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }

    .summary-item {
      padding: 15px;
      border-radius: 4px;
      text-align: center;
    }

    .summary-item.income {
      background: #d4edda;
      border: 1px solid #c3e6cb;
    }

    .summary-item.expense {
      background: #f8d7da;
      border: 1px solid #f5c6cb;
    }

    .summary-item.balance {
      background: #d1ecf1;
      border: 1px solid #bee5eb;
    }

    .summary-item .label {
      display: block;
      font-size: 12px;
      color: #666;
      margin-bottom: 5px;
    }

    .summary-item .value {
      display: block;
      font-size: 20px;
      font-weight: bold;
      color: #333;
    }

    .summary-item .value.negative {
      color: #dc3545;
    }

    .transactions-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .transaction-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .transaction-item:hover {
      background: #f9f9f9;
    }

    .transaction-item.income {
      border-left: 4px solid #28a745;
    }

    .transaction-item.expense {
      border-left: 4px solid #dc3545;
    }

    .transaction-info {
      flex: 1;
    }

    .transaction-description {
      font-weight: 500;
      color: #333;
      margin-bottom: 5px;
    }

    .transaction-category {
      font-size: 12px;
      color: #666;
    }

    .transaction-date {
      font-size: 11px;
      color: #999;
      margin-top: 5px;
    }

    .transaction-amount {
      font-size: 18px;
      font-weight: bold;
      margin: 0 15px;
      min-width: 100px;
      text-align: right;
    }

    .transaction-amount.income {
      color: #28a745;
    }

    .transaction-amount.expense {
      color: #dc3545;
    }

    .btn-delete {
      padding: 5px 15px;
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
    }

    .btn-delete:hover {
      background: #c82333;
    }

    .no-transactions {
      text-align: center;
      padding: 40px;
      color: #666;
    }
  `]
})
export class TransactionsComponent implements OnInit {
  transactionForm: FormGroup;
  transactions: Transaction[] = [];
  currentUser: User | null = null;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private authService: AuthService,
    private router: Router
  ) {
    this.transactionForm = this.fb.group({
      description: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      category: ['', Validators.required],
      type: ['expense', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadTransactions();
  }

  loadCurrentUser(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  loadTransactions(): void {
    this.transactionService.getTransactions().subscribe({
      next: (transactions) => {
        this.transactions = transactions;
      },
      error: (error) => {
        console.error('Failed to load transactions', error);
      }
    });
  }

  onSubmit(): void {
    if (this.transactionForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const transactionData: TransactionCreate = this.transactionForm.value;

      this.transactionService.createTransaction(transactionData).subscribe({
        next: (transaction) => {
          this.transactions.unshift(transaction);
          this.transactionForm.reset({ type: 'expense' });
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.detail || 'Failed to add transaction. Please try again.';
        }
      });
    }
  }

  deleteTransaction(id: number): void {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.transactionService.deleteTransaction(id).subscribe({
        next: () => {
          this.transactions = this.transactions.filter(t => t.id !== id);
        },
        error: (error) => {
          console.error('Failed to delete transaction', error);
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  get totalIncome(): number {
    return this.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  get totalExpenses(): number {
    return this.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  get balance(): number {
    return this.totalIncome - this.totalExpenses;
  }
}
