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
  styleUrls: ['./transactions.component.css']
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
