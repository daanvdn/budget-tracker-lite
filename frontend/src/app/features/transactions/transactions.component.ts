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
  templateUrl: './transactions.component.html',
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

    /* Filter Section Styles */
    .filter-section {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .filter-section h3 {
      margin: 0 0 15px 0;
      color: #333;
      font-size: 16px;
    }

    .filter-form {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .filter-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
    }

    .filter-group label {
      margin-bottom: 5px;
      color: #555;
      font-weight: 500;
      font-size: 13px;
    }

    .filter-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 10px;
    }

    .filter-buttons .btn {
      flex: 0 0 auto;
    }

    .filter-buttons .btn-primary {
      width: auto;
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
  filterForm: FormGroup;
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

    this.filterForm = this.fb.group({
      start_date: [null],
      end_date: [null],
      transaction_type: [null],
      category_id: [null],
      beneficiary_id: [null]
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
    const filters = this.filterForm.value;

    // Build filter parameters
    const type = filters.transaction_type || undefined;
    const category_id = filters.category_id ? parseInt(filters.category_id, 10) : undefined;
    const beneficiary_id = filters.beneficiary_id ? parseInt(filters.beneficiary_id, 10) : undefined;
    const start_date = filters.start_date ? new Date(filters.start_date).toISOString() : undefined;
    const end_date = filters.end_date ? new Date(filters.end_date + 'T23:59:59').toISOString() : undefined;

    this.transactionService.getTransactions(0, 100, type, category_id, beneficiary_id, start_date, end_date).subscribe({
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

  // Filter methods
  applyFilters(): void {
    this.loadTransactions();
  }

  setLastMonth(): void {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    this.filterForm.patchValue({
      start_date: this.formatDateForInput(lastMonth),
      end_date: this.formatDateForInput(now)
    });
    this.loadTransactions();
  }

  setLast2Months(): void {
    const now = new Date();
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
    this.filterForm.patchValue({
      start_date: this.formatDateForInput(twoMonthsAgo),
      end_date: this.formatDateForInput(now)
    });
    this.loadTransactions();
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.loadTransactions();
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
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
