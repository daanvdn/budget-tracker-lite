import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TransactionService, Transaction, TransactionCreate, TransactionUpdate } from '../../core/services/transaction.service';
import { ImageService } from '../../core/services/image.service';
import { Category, Beneficiary } from '../../shared/models/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.css']
})
export class TransactionFormComponent implements OnInit, OnChanges {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('cameraInput') cameraInput!: ElementRef<HTMLInputElement>;

  @Input() categories: Category[] = [];
  @Input() beneficiaries: Beneficiary[] = [];
  @Input() currentUserId: number | null = null;
  @Input() editingTransaction: Transaction | null = null;

  @Output() transactionCreated = new EventEmitter<Transaction>();
  @Output() transactionUpdated = new EventEmitter<Transaction>();
  @Output() editCancelled = new EventEmitter<void>();

  transactionForm!: FormGroup;
  editMode = false;
  loading = false;
  errorMessage = '';

  // Image handling
  selectedFile: File | null = null;
  selectedImagePreview: string | null = null;
  uploadedImagePath: string | null = null;
  uploadingImage = false;

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private imageService: ImageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    // Check if we're in edit mode on init (component may be recreated with editingTransaction already set)
    if (this.editingTransaction) {
      this.setEditMode();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editingTransaction'] && this.transactionForm) {
      if (this.editingTransaction) {
        this.setEditMode();
      } else {
        this.resetForm();
      }
    }
  }

  private initForm(): void {
    this.transactionForm = this.fb.group({
      description: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      transaction_date: [this.getCurrentDateTime(), Validators.required],
      type: ['expense', Validators.required],
      category_id: ['', Validators.required],
      beneficiary_id: ['', Validators.required]
    });
  }

  private setEditMode(): void {
    if (!this.editingTransaction) return;

    this.editMode = true;

    // Format the date for datetime-local input
    const transactionDate = new Date(this.editingTransaction.transaction_date);
    const formattedDate = transactionDate.toISOString().slice(0, 16);

    // Populate the form with existing values
    this.transactionForm.patchValue({
      description: this.editingTransaction.description,
      amount: this.editingTransaction.amount,
      transaction_date: formattedDate,
      type: this.editingTransaction.type,
      category_id: this.editingTransaction.category_id,
      beneficiary_id: this.editingTransaction.beneficiary_id
    });

    // Handle existing image
    if (this.editingTransaction.image_path) {
      this.uploadedImagePath = this.editingTransaction.image_path;
      this.selectedImagePreview = `${environment.apiUrl}${this.editingTransaction.image_path.replace('/api', '')}`;
    }
  }

  getCurrentDateTime(): string {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  }

  get filteredCategories(): Category[] {
    const selectedType = this.transactionForm.get('type')?.value;
    return this.categories.filter(cat =>
      cat.type === selectedType || cat.type === 'both'
    );
  }

  onTypeChange(): void {
    this.transactionForm.patchValue({ category_id: '' });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.selectedImagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);

      this.uploadImage();
    }
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

  onSubmit(): void {
    if (this.transactionForm.valid && this.currentUserId) {
      this.loading = true;
      this.errorMessage = '';

      const formValue = this.transactionForm.value;
      const transactionDate = new Date(formValue.transaction_date).toISOString();

      if (this.editMode && this.editingTransaction) {
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
            this.transactionUpdated.emit(updatedTransaction);
            this.resetForm();
            this.loading = false;
          },
          error: (error: any) => {
            this.loading = false;
            this.errorMessage = error.error?.detail || 'Failed to update transaction. Please try again.';
          }
        });
      } else {
        const transactionData: TransactionCreate = {
          type: formValue.type,
          amount: parseFloat(formValue.amount),
          description: formValue.description,
          transaction_date: transactionDate,
          category_id: parseInt(formValue.category_id, 10),
          beneficiary_id: parseInt(formValue.beneficiary_id, 10),
          created_by_user_id: this.currentUserId,
          image_path: this.uploadedImagePath || undefined
        };

        this.transactionService.createTransaction(transactionData).subscribe({
          next: (transaction: Transaction) => {
            this.transactionCreated.emit(transaction);
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

  cancelEdit(): void {
    this.resetForm();
    this.editCancelled.emit();
  }

  private resetForm(): void {
    this.editMode = false;
    this.transactionForm.reset({
      type: 'expense',
      transaction_date: this.getCurrentDateTime()
    });
    this.removeSelectedImage();
  }
}
