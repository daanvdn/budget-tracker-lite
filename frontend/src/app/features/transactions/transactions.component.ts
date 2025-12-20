import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TransactionService } from '../../core/services/transaction.service';
import { CategoryService } from '../../core/services/category.service';
import { BeneficiaryService } from '../../core/services/beneficiary.service';
import { UserService } from '../../core/services/user.service';
import { Transaction, TransactionType, Category, Beneficiary, User } from '../../shared/models/models';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Transactions</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <button mat-raised-button color="primary" (click)="toggleForm()">
          <mat-icon>add</mat-icon>
          {{ showForm ? 'Cancel' : 'Add Transaction' }}
        </button>

        <form *ngIf="showForm" [formGroup]="transactionForm" (ngSubmit)="onSubmit()" class="transaction-form">
          <mat-form-field class="form-field-full-width">
            <mat-label>Type</mat-label>
            <mat-select formControlName="type" required>
              <mat-option value="expense">Expense</mat-option>
              <mat-option value="income">Income</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field class="form-field-full-width">
            <mat-label>Amount</mat-label>
            <input matInput type="number" formControlName="amount" required>
          </mat-form-field>

          <mat-form-field class="form-field-full-width">
            <mat-label>Description</mat-label>
            <input matInput formControlName="description" required>
          </mat-form-field>

          <mat-form-field class="form-field-full-width">
            <mat-label>Date</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="transaction_date" required>
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>

          <mat-form-field class="form-field-full-width">
            <mat-label>Category</mat-label>
            <mat-select formControlName="category_id" required>
              <mat-option *ngFor="let category of categories" [value]="category.id">
                {{ category.name }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field class="form-field-full-width">
            <mat-label>Beneficiary</mat-label>
            <mat-select formControlName="beneficiary_id" required>
              <mat-option *ngFor="let beneficiary of beneficiaries" [value]="beneficiary.id">
                {{ beneficiary.name }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field class="form-field-full-width">
            <mat-label>Created By</mat-label>
            <mat-select formControlName="created_by_user_id" required>
              <mat-option *ngFor="let user of users" [value]="user.id">
                {{ user.name }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <div class="form-actions">
            <button mat-raised-button color="primary" type="submit" [disabled]="!transactionForm.valid">
              {{ editingId ? 'Update' : 'Create' }}
            </button>
            <button mat-button type="button" (click)="cancelEdit()">Cancel</button>
          </div>
        </form>

        <table mat-table [dataSource]="transactions" class="transactions-table">
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let transaction">{{ transaction.transaction_date | date:'short' }}</td>
          </ng-container>

          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef>Type</th>
            <td mat-cell *matCellDef="let transaction">
              <span [class.income]="transaction.type === 'income'" [class.expense]="transaction.type === 'expense'">
                {{ transaction.type }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef>Amount</th>
            <td mat-cell *matCellDef="let transaction">{{ transaction.amount | currency }}</td>
          </ng-container>

          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef>Description</th>
            <td mat-cell *matCellDef="let transaction">{{ transaction.description }}</td>
          </ng-container>

          <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef>Category</th>
            <td mat-cell *matCellDef="let transaction">{{ transaction.category.name }}</td>
          </ng-container>

          <ng-container matColumnDef="beneficiary">
            <th mat-header-cell *matHeaderCellDef>Beneficiary</th>
            <td mat-cell *matCellDef="let transaction">{{ transaction.beneficiary.name }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let transaction">
              <button mat-icon-button (click)="editTransaction(transaction)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteTransaction(transaction.id)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .transaction-form {
      margin: 20px 0;
      padding: 20px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }

    .transactions-table {
      width: 100%;
      margin-top: 20px;
    }

    .income {
      color: green;
      font-weight: bold;
    }

    .expense {
      color: red;
      font-weight: bold;
    }
  `]
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  categories: Category[] = [];
  beneficiaries: Beneficiary[] = [];
  users: User[] = [];
  showForm = false;
  editingId: number | null = null;
  transactionForm: FormGroup;
  displayedColumns = ['date', 'type', 'amount', 'description', 'category', 'beneficiary', 'actions'];

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private categoryService: CategoryService,
    private beneficiaryService: BeneficiaryService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {
    this.transactionForm = this.fb.group({
      type: ['expense', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      description: ['', Validators.required],
      transaction_date: [new Date(), Validators.required],
      category_id: [null, Validators.required],
      beneficiary_id: [null, Validators.required],
      created_by_user_id: [null, Validators.required]
    });
  }

  ngOnInit() {
    this.loadTransactions();
    this.loadCategories();
    this.loadBeneficiaries();
    this.loadUsers();
  }

  loadTransactions() {
    this.transactionService.getTransactions().subscribe({
      next: (data) => this.transactions = data,
      error: (err) => this.showError('Failed to load transactions')
    });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (data) => this.categories = data,
      error: (err) => this.showError('Failed to load categories')
    });
  }

  loadBeneficiaries() {
    this.beneficiaryService.getBeneficiaries().subscribe({
      next: (data) => this.beneficiaries = data,
      error: (err) => this.showError('Failed to load beneficiaries')
    });
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (data) => this.users = data,
      error: (err) => this.showError('Failed to load users')
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.cancelEdit();
    }
  }

  onSubmit() {
    if (this.transactionForm.valid) {
      const formValue = this.transactionForm.value;
      const transaction = {
        ...formValue,
        transaction_date: formValue.transaction_date.toISOString()
      };

      if (this.editingId) {
        this.transactionService.updateTransaction(this.editingId, transaction).subscribe({
          next: () => {
            this.showSuccess('Transaction updated successfully');
            this.loadTransactions();
            this.cancelEdit();
          },
          error: (err) => this.showError('Failed to update transaction')
        });
      } else {
        this.transactionService.createTransaction(transaction).subscribe({
          next: () => {
            this.showSuccess('Transaction created successfully');
            this.loadTransactions();
            this.cancelEdit();
          },
          error: (err) => this.showError('Failed to create transaction')
        });
      }
    }
  }

  editTransaction(transaction: Transaction) {
    this.editingId = transaction.id;
    this.showForm = true;
    this.transactionForm.patchValue({
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      transaction_date: new Date(transaction.transaction_date),
      category_id: transaction.category_id,
      beneficiary_id: transaction.beneficiary_id,
      created_by_user_id: transaction.created_by_user_id
    });
  }

  deleteTransaction(id: number) {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.transactionService.deleteTransaction(id).subscribe({
        next: () => {
          this.showSuccess('Transaction deleted successfully');
          this.loadTransactions();
        },
        error: (err) => this.showError('Failed to delete transaction')
      });
    }
  }

  cancelEdit() {
    this.showForm = false;
    this.editingId = null;
    this.transactionForm.reset({
      type: 'expense',
      amount: 0,
      transaction_date: new Date()
    });
  }

  showSuccess(message: string) {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  showError(message: string) {
    this.snackBar.open(message, 'Close', { duration: 5000 });
  }
}
