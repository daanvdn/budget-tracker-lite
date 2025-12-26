import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transaction } from '../../core/services/transaction.service';
import { AuthService, User } from '../../core/services/auth.service';
import { CategoryService } from '../../core/services/category.service';
import { BeneficiaryService } from '../../core/services/beneficiary.service';
import { Category, Beneficiary } from '../../shared/models/models';
import { TransactionFormComponent } from './transaction-form.component';
import { TransactionListComponent } from './transaction-list.component';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, TransactionFormComponent, TransactionListComponent],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
  @ViewChild(TransactionListComponent) transactionList!: TransactionListComponent;

  categories: Category[] = [];
  beneficiaries: Beneficiary[] = [];
  currentUser: User | null = null;
  editingTransaction: Transaction | null = null;
  showFormDialog = false;

  constructor(
    private authService: AuthService,
    private categoryService: CategoryService,
    private beneficiaryService: BeneficiaryService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadCategories();
    this.loadBeneficiaries();
  }

  loadCurrentUser(): void {
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories: Category[]) => {
        this.categories = categories;
      },
      error: (error: any) => {
        console.error('Failed to load categories', error);
      }
    });
  }

  loadBeneficiaries(): void {
    this.beneficiaryService.getBeneficiaries().subscribe({
      next: (beneficiaries: Beneficiary[]) => {
        this.beneficiaries = beneficiaries;
      },
      error: (error: any) => {
        console.error('Failed to load beneficiaries', error);
      }
    });
  }

  onTransactionCreated(transaction: Transaction): void {
    this.transactionList.addTransaction(transaction);
    this.closeFormDialog();
  }

  onTransactionUpdated(transaction: Transaction): void {
    this.transactionList.updateTransaction(transaction);
    this.closeFormDialog();
  }

  onEditTransaction(transaction: Transaction): void {
    this.editingTransaction = transaction;
    this.showFormDialog = true;
  }

  onCreateTransaction(): void {
    this.editingTransaction = null;
    this.showFormDialog = true;
  }

  closeFormDialog(): void {
    this.showFormDialog = false;
    this.editingTransaction = null;
  }

  onEditCancelled(): void {
    this.closeFormDialog();
  }
}
