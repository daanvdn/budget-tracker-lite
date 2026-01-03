import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TransactionService, Transaction } from '../../core/services/transaction.service';
import { Category, Beneficiary } from '../../shared/models/models';
import { environment } from '../../../environments/environment';
import { ImageService } from '../../core/services/image.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.css']
})
export class TransactionListComponent implements OnInit {
  @Input() categories: Category[] = [];
  @Input() beneficiaries: Beneficiary[] = [];

  @Output() editTransaction = new EventEmitter<Transaction>();
  @Output() createTransaction = new EventEmitter<void>();

  transactions: Transaction[] = [];
  filterForm: FormGroup;
  viewingImage: string | null = null;
  viewingImageBlobUrl: string | null = null;
  filtersExpanded = false;

  // Pagination
  currentPage = 0;
  pageSize = 25;
  hasMorePages = true;

  // Collapsible months
  collapsedMonths: Set<string> = new Set();

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private imageService: ImageService,
    private authService: AuthService
  ) {
    this.filterForm = this.fb.group({
      start_date: [null],
      end_date: [null],
      transaction_type: [null],
      category_id: [null],
      beneficiary_id: [null]
    });
  }

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    const filters = this.filterForm.value;

    const type = filters.transaction_type || undefined;
    const category_id = filters.category_id ? parseInt(filters.category_id, 10) : undefined;
    const beneficiary_id = filters.beneficiary_id ? parseInt(filters.beneficiary_id, 10) : undefined;
    const start_date = filters.start_date ? new Date(filters.start_date).toISOString() : undefined;
    const end_date = filters.end_date ? new Date(filters.end_date + 'T23:59:59').toISOString() : undefined;

    const skip = this.currentPage * this.pageSize;
    this.transactionService.getTransactions(skip, this.pageSize + 1, type, category_id, beneficiary_id, start_date, end_date).subscribe({
      next: (transactions: Transaction[]) => {
        // Check if there are more pages by fetching one extra
        this.hasMorePages = transactions.length > this.pageSize;
        this.transactions = transactions.slice(0, this.pageSize);
      },
      error: (error: any) => {
        console.error('Failed to load transactions', error);
      }
    });
  }

  // Pagination methods
  goToFirstPage(): void {
    this.currentPage = 0;
    this.loadTransactions();
  }

  goToPreviousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadTransactions();
    }
  }

  goToNextPage(): void {
    if (this.hasMorePages) {
      this.currentPage++;
      this.loadTransactions();
    }
  }

  // Collapsible months methods
  toggleMonthCollapse(monthKey: string): void {
    if (this.collapsedMonths.has(monthKey)) {
      this.collapsedMonths.delete(monthKey);
    } else {
      this.collapsedMonths.add(monthKey);
    }
  }

  isMonthCollapsed(monthKey: string): boolean {
    return this.collapsedMonths.has(monthKey);
  }

  addTransaction(transaction: Transaction): void {
    this.transactions.unshift(transaction);
  }

  updateTransaction(updatedTransaction: Transaction): void {
    const index = this.transactions.findIndex(t => t.id === updatedTransaction.id);
    if (index !== -1) {
      this.transactions[index] = updatedTransaction;
    }
  }

  onEditTransaction(transaction: Transaction): void {
    this.editTransaction.emit(transaction);
  }

  onCreateTransaction(): void {
    this.createTransaction.emit();
  }

  toggleFilters(): void {
    this.filtersExpanded = !this.filtersExpanded;
  }

  deleteTransaction(id: number): void {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.transactionService.deleteTransaction(id).subscribe({
        next: () => {
          this.transactions = this.transactions.filter(t => t.id !== id);
        },
        error: (error: any) => {
          console.error('Failed to delete transaction', error);
        }
      });
    }
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadTransactions();
  }

  setLastMonth(): void {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    this.filterForm.patchValue({
      start_date: this.formatDateForInput(lastMonth),
      end_date: this.formatDateForInput(now)
    });
    this.currentPage = 0;
    this.loadTransactions();
  }

  setLast2Months(): void {
    const now = new Date();
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
    this.filterForm.patchValue({
      start_date: this.formatDateForInput(twoMonthsAgo),
      end_date: this.formatDateForInput(now)
    });
    this.currentPage = 0;
    this.loadTransactions();
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.currentPage = 0;
    this.loadTransactions();
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  viewImage(imagePath: string): void {
    const filename = imagePath.split('/').pop();
    const token = this.authService.getToken();
    if (!filename || !token) {
      this.viewingImageBlobUrl = null;
      return;
    }
    this.imageService.getImageBlob(filename, token).subscribe({
      next: (blob: Blob) => {
        this.viewingImageBlobUrl = URL.createObjectURL(blob);
      },
      error: () => {
        this.viewingImageBlobUrl = null;
      }
    });
  }

  closeImageModal(): void {
    if (this.viewingImageBlobUrl) {
      URL.revokeObjectURL(this.viewingImageBlobUrl);
    }
    this.viewingImageBlobUrl = null;
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

  get transactionsGroupedByMonth(): { monthKey: string; monthLabel: string; income: number; expenses: number; balance: number; transactions: Transaction[] }[] {
    const grouped = new Map<string, { income: number; expenses: number; transactions: Transaction[] }>();

    for (const transaction of this.transactions) {
      const date = new Date(transaction.transaction_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!grouped.has(monthKey)) {
        grouped.set(monthKey, { income: 0, expenses: 0, transactions: [] });
      }

      const group = grouped.get(monthKey)!;
      group.transactions.push(transaction);

      if (transaction.type === 'income') {
        group.income += transaction.amount;
      } else {
        group.expenses += transaction.amount;
      }
    }

    // Sort by month key descending (newest first)
    const sortedKeys = Array.from(grouped.keys()).sort((a, b) => b.localeCompare(a));

    return sortedKeys.map(monthKey => {
      const group = grouped.get(monthKey)!;
      const [year, month] = monthKey.split('-');
      const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const monthLabel = monthDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

      return {
        monthKey,
        monthLabel,
        income: group.income,
        expenses: group.expenses,
        balance: group.income - group.expenses,
        transactions: group.transactions
      };
    });
  }
}
