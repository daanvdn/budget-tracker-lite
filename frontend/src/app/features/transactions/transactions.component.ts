import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TransactionService, Transaction, TransactionCreate, TransactionUpdate } from '../../core/services/transaction.service';
import { AuthService, User } from '../../core/services/auth.service';
import { CategoryService } from '../../core/services/category.service';
import { BeneficiaryService } from '../../core/services/beneficiary.service';
import { ImageService } from '../../core/services/image.service';
import { Category, Beneficiary } from '../../shared/models/models';
import { environment } from '../../../environments/environment';

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
          <h2>{{ editMode ? 'Edit Transaction' : 'Add Transaction' }}</h2>
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
                <label for="transaction_date">Transaction Date</label>
                <input
                  type="datetime-local"
                  id="transaction_date"
                  formControlName="transaction_date"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label for="type">Type</label>
                <select id="type" formControlName="type" class="form-control" (change)="onTypeChange()">
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="category_id">Category</label>
                <select id="category_id" formControlName="category_id" class="form-control">
                  <option value="">Select Category</option>
                  <option *ngFor="let category of filteredCategories" [value]="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label for="beneficiary_id">Beneficiary</label>
                <select id="beneficiary_id" formControlName="beneficiary_id" class="form-control">
                  <option value="">Select Beneficiary</option>
                  <option *ngFor="let beneficiary of beneficiaries" [value]="beneficiary.id">
                    {{ beneficiary.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group image-upload-group">
                <label>Receipt Image (Optional)</label>
                <div class="image-upload-controls">
                  <input
                    type="file"
                    #fileInput
                    accept="image/*"
                    (change)="onFileSelected($event)"
                    style="display: none"
                  />
                  <input
                    type="file"
                    #cameraInput
                    accept="image/*"
                    capture="environment"
                    (change)="onFileSelected($event)"
                    style="display: none"
                  />
                  <button type="button" class="btn btn-outline" (click)="fileInput.click()">
                    📁 Choose File
                  </button>
                  <button type="button" class="btn btn-outline" (click)="cameraInput.click()">
                    📷 Take Photo
                  </button>
                </div>
                <div class="image-preview" *ngIf="selectedImagePreview">
                  <img [src]="selectedImagePreview" alt="Selected image preview" />
                  <button type="button" class="btn-remove-image" (click)="removeSelectedImage()">×</button>
                </div>
                <div class="upload-status" *ngIf="uploadingImage">Uploading image...</div>
              </div>
            </div>

            <div class="error-message" *ngIf="errorMessage">
              {{ errorMessage }}
            </div>

            <div class="form-buttons">
              <button type="submit" class="btn btn-primary" [disabled]="transactionForm.invalid || loading || uploadingImage">
                {{ loading ? (editMode ? 'Saving...' : 'Adding...') : (editMode ? 'Save Changes' : 'Add Transaction') }}
              </button>
              <button type="button" class="btn btn-secondary" *ngIf="editMode" (click)="cancelEdit()">
                Cancel
              </button>
            </div>
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
                <div class="transaction-meta">
                  <span class="transaction-category">{{ transaction.category?.name }}</span>
                  <span class="transaction-beneficiary" *ngIf="transaction.beneficiary">• {{ transaction.beneficiary.name }}</span>
                </div>
                <div class="transaction-dates">
                  <span class="transaction-date">Date: {{ formatDate(transaction.transaction_date) }}</span>
                  <span class="transaction-created">Created: {{ formatDate(transaction.created_at) }}</span>
                </div>
                <div class="transaction-image" *ngIf="transaction.image_path">
                  <button type="button" class="btn-view-image" (click)="viewImage(transaction.image_path)">
                    🖼️ View Receipt
                  </button>
                </div>
              </div>
              <div class="transaction-amount" [class]="transaction.type">
                {{ transaction.type === 'income' ? '+' : '-' }}\${{ transaction.amount.toFixed(2) }}
              </div>
              <div class="transaction-actions">
                <button class="btn-edit" (click)="editTransaction(transaction)">Edit</button>
                <button class="btn-delete" (click)="deleteTransaction(transaction.id)">Delete</button>
              </div>
            </div>
          </div>

          <ng-template #noTransactions>
            <div class="no-transactions">
              <p>No transactions yet. Add your first transaction above!</p>
            </div>
          </ng-template>
        </div>
      </div>

      <!-- Image Modal -->
      <div class="image-modal" *ngIf="viewingImage" (click)="closeImageModal()">
        <div class="image-modal-content" (click)="$event.stopPropagation()">
          <button class="btn-close-modal" (click)="closeImageModal()">×</button>
          <img [src]="viewingImage" alt="Receipt image" />
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

    .image-upload-group {
      grid-column: 1 / -1;
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

    .image-upload-controls {
      display: flex;
      gap: 10px;
      margin-top: 5px;
    }

    .btn-outline {
      padding: 8px 16px;
      border: 1px solid #007bff;
      background: white;
      color: #007bff;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }

    .btn-outline:hover {
      background: #f0f7ff;
    }

    .image-preview {
      position: relative;
      margin-top: 10px;
      display: inline-block;
    }

    .image-preview img {
      max-width: 200px;
      max-height: 150px;
      border-radius: 4px;
      border: 1px solid #ddd;
    }

    .btn-remove-image {
      position: absolute;
      top: -8px;
      right: -8px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: none;
      background: #dc3545;
      color: white;
      font-size: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .upload-status {
      margin-top: 5px;
      color: #666;
      font-size: 12px;
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
      align-items: flex-start;
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

    .transaction-meta {
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
    }

    .transaction-category {
      background: #e9ecef;
      padding: 2px 8px;
      border-radius: 10px;
    }

    .transaction-beneficiary {
      margin-left: 8px;
      color: #888;
    }

    .transaction-dates {
      font-size: 11px;
      color: #999;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .transaction-image {
      margin-top: 8px;
    }

    .btn-view-image {
      padding: 4px 10px;
      font-size: 12px;
      background: #17a2b8;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .btn-view-image:hover {
      background: #138496;
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

    .btn-edit {
      padding: 5px 15px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
    }

    .btn-edit:hover {
      background: #0056b3;
    }

    .transaction-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .form-buttons {
      display: flex;
      gap: 10px;
    }

    .form-buttons .btn-primary {
      flex: 1;
    }

    .form-buttons .btn-secondary {
      flex: 0 0 auto;
    }

    .no-transactions {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    /* Image Modal */
    .image-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .image-modal-content {
      position: relative;
      max-width: 90%;
      max-height: 90%;
    }

    .image-modal-content img {
      max-width: 100%;
      max-height: 80vh;
      border-radius: 8px;
    }

    .btn-close-modal {
      position: absolute;
      top: -40px;
      right: 0;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      background: white;
      color: #333;
      font-size: 24px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class TransactionsComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('cameraInput') cameraInput!: ElementRef<HTMLInputElement>;

  transactionForm: FormGroup;
  transactions: Transaction[] = [];
  categories: Category[] = [];
  beneficiaries: Beneficiary[] = [];
  currentUser: User | null = null;
  loading = false;
  errorMessage = '';
  
  // Edit mode
  editMode = false;
  editingTransaction: Transaction | null = null;

  // Image handling
  selectedFile: File | null = null;
  selectedImagePreview: string | null = null;
  uploadedImagePath: string | null = null;
  uploadingImage = false;
  viewingImage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private authService: AuthService,
    private categoryService: CategoryService,
    private beneficiaryService: BeneficiaryService,
    private imageService: ImageService,
    private router: Router
  ) {
    this.transactionForm = this.fb.group({
      description: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      transaction_date: [this.getCurrentDateTime(), Validators.required],
      type: ['expense', Validators.required],
      category_id: ['', Validators.required],
      beneficiary_id: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadTransactions();
    this.loadCategories();
    this.loadBeneficiaries();
  }

  getCurrentDateTime(): string {
    const now = new Date();
    // Format for datetime-local input: YYYY-MM-DDTHH:mm
    return now.toISOString().slice(0, 16);
  }

  loadCurrentUser(): void {
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
    });
  }

  loadTransactions(): void {
    this.transactionService.getTransactions().subscribe({
      next: (transactions: Transaction[]) => {
        this.transactions = transactions;
      },
      error: (error: any) => {
        console.error('Failed to load transactions', error);
      }
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

  get filteredCategories(): Category[] {
    const selectedType = this.transactionForm.get('type')?.value;
    return this.categories.filter(cat => 
      cat.type === selectedType || cat.type === 'both'
    );
  }

  onTypeChange(): void {
    // Reset category selection when type changes
    this.transactionForm.patchValue({ category_id: '' });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.selectedImagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
      
      // Upload the image
      this.uploadImage();
    }
    // Reset input so same file can be selected again
    input.value = '';
  }

  uploadImage(): void {
    if (!this.selectedFile) return;
    
    this.uploadingImage = true;
    this.imageService.uploadImage(this.selectedFile).subscribe({
      next: (response) => {
        this.uploadedImagePath = response.path;
        this.uploadingImage = false;
      },
      error: (error: any) => {
        console.error('Failed to upload image', error);
        this.errorMessage = 'Failed to upload image. Please try again.';
        this.uploadingImage = false;
        this.removeSelectedImage();
      }
    });
  }

  removeSelectedImage(): void {
    this.selectedFile = null;
    this.selectedImagePreview = null;
    this.uploadedImagePath = null;
  }

  viewImage(imagePath: string): void {
    // Convert relative path to full URL
    this.viewingImage = `${environment.apiUrl}${imagePath.replace('/api', '')}`;
  }

  closeImageModal(): void {
    this.viewingImage = null;
  }

  onSubmit(): void {
    if (this.transactionForm.valid && this.currentUser) {
      this.loading = true;
      this.errorMessage = '';

      const formValue = this.transactionForm.value;
      
      // Convert datetime-local string to ISO format
      const transactionDate = new Date(formValue.transaction_date).toISOString();
      
      if (this.editMode && this.editingTransaction) {
        // Update existing transaction
        const updateData: TransactionUpdate = {
          type: formValue.type,
          amount: parseFloat(formValue.amount),
          description: formValue.description,
          transaction_date: transactionDate,
          category_id: parseInt(formValue.category_id, 10),
          beneficiary_id: parseInt(formValue.beneficiary_id, 10),
          image_path: this.uploadedImagePath || this.editingTransaction.image_path || undefined
        };

        this.transactionService.updateTransaction(this.editingTransaction.id, updateData).subscribe({
          next: (updatedTransaction: Transaction) => {
            // Update the transaction in the list
            const index = this.transactions.findIndex(t => t.id === updatedTransaction.id);
            if (index !== -1) {
              this.transactions[index] = updatedTransaction;
            }
            this.resetForm();
            this.loading = false;
          },
          error: (error: any) => {
            this.loading = false;
            this.errorMessage = error.error?.detail || 'Failed to update transaction. Please try again.';
          }
        });
      } else {
        // Create new transaction
        const transactionData: TransactionCreate = {
          type: formValue.type,
          amount: parseFloat(formValue.amount),
          description: formValue.description,
          transaction_date: transactionDate,
          category_id: parseInt(formValue.category_id, 10),
          beneficiary_id: parseInt(formValue.beneficiary_id, 10),
          created_by_user_id: this.currentUser.id,
          image_path: this.uploadedImagePath || undefined
        };

        this.transactionService.createTransaction(transactionData).subscribe({
          next: (transaction: Transaction) => {
            this.transactions.unshift(transaction);
            this.resetForm();
            this.loading = false;
          },
          error: (error: any) => {
            this.loading = false;
            this.errorMessage = error.error?.detail || 'Failed to add transaction. Please try again.';
          }
        });
      }
    }
  }

  editTransaction(transaction: Transaction): void {
    this.editMode = true;
    this.editingTransaction = transaction;

    // Format the date for datetime-local input
    const transactionDate = new Date(transaction.transaction_date);
    const formattedDate = transactionDate.toISOString().slice(0, 16);

    // Populate the form with existing values
    this.transactionForm.patchValue({
      description: transaction.description,
      amount: transaction.amount,
      transaction_date: formattedDate,
      type: transaction.type,
      category_id: transaction.category_id,
      beneficiary_id: transaction.beneficiary_id
    });

    // Handle existing image
    if (transaction.image_path) {
      this.uploadedImagePath = transaction.image_path;
      this.selectedImagePreview = `${environment.apiUrl}${transaction.image_path.replace('/api', '')}`;
    }

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.editMode = false;
    this.editingTransaction = null;
    this.transactionForm.reset({
      type: 'expense',
      transaction_date: this.getCurrentDateTime()
    });
    this.removeSelectedImage();
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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
