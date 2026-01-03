import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {GiftOccasionService} from '../../core/services/gift-occasion.service';
import {Transaction} from '../../core/services/transaction.service';
import {GiftPurchase, GiftPurchaseCreate, GiftPurchaseUpdate} from '../../shared/models/models';
import {TranslateModule} from '@ngx-translate/core';

@Component({
    selector: 'app-gift-purchase-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TranslateModule],
    templateUrl: './gift-purchase-form.component.html',
    styleUrls: ['./gift-purchase-form.component.css']
})
export class GiftPurchaseFormComponent implements OnInit, OnChanges {
    @Input() occasionId!: number;
    @Input() transactions: Transaction[] = [];
    @Input() currentUserId: number | null = null;
    @Input() editingPurchase: GiftPurchase | null = null;

    @Output() purchaseCreated = new EventEmitter<GiftPurchase>();
    @Output() purchaseUpdated = new EventEmitter<GiftPurchase>();
    @Output() cancelled = new EventEmitter<void>();

    form!: FormGroup;
    loading = false;
    errorMessage = '';
    showTransactionPicker = false;

    constructor(
        private fb: FormBuilder,
        private giftOccasionService: GiftOccasionService
    ) {
    }

    get isEditMode(): boolean {
        return !!this.editingPurchase;
    }

    get expenseTransactions(): Transaction[] {
        return this.transactions.filter(t => t.type === 'expense');
    }

    get selectedTransaction(): Transaction | null {
        const id = this.form.get('transaction_id')?.value;
        if (!id) {
            return null;
        }
        return this.transactions.find(t => t.id === id) || null;
    }

    ngOnInit(): void {
        this.initForm();
        if (this.editingPurchase) {
            this.populateForm();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['editingPurchase'] && this.form) {
            if (this.editingPurchase) {
                this.populateForm();
            }
            else {
                this.resetForm();
            }
        }
    }

    toggleTransactionPicker(): void {
        this.showTransactionPicker = !this.showTransactionPicker;
    }

    selectTransaction(transaction: Transaction | null): void {
        this.form.patchValue({transaction_id: transaction?.id || null});
        this.showTransactionPicker = false;
    }

    onSubmit(): void {
        if (!this.form.valid || !this.currentUserId) {
            return;
        }

        this.loading = true;
        this.errorMessage = '';

        const formValue = this.form.value;

        if (this.isEditMode && this.editingPurchase) {
            const update: GiftPurchaseUpdate = {
                amount: formValue.amount,
                purchase_date: formValue.purchase_date,
                description: formValue.description,
                notes: formValue.notes || undefined,
                transaction_id: formValue.transaction_id || undefined
            };

            this.giftOccasionService.updatePurchase(this.editingPurchase.id, update).subscribe({
                next: (updated) => {
                    this.purchaseUpdated.emit(updated);
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Failed to update purchase', error);
                    this.errorMessage = 'Failed to update purchase';
                    this.loading = false;
                }
            });
        }
        else {
            const create: GiftPurchaseCreate = {
                amount: formValue.amount,
                purchase_date: formValue.purchase_date,
                description: formValue.description,
                notes: formValue.notes || undefined,
                transaction_id: formValue.transaction_id || undefined,
                created_by_user_id: this.currentUserId
            };

            this.giftOccasionService.createPurchase(this.occasionId, create).subscribe({
                next: (created) => {
                    this.purchaseCreated.emit(created);
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Failed to create purchase', error);
                    this.errorMessage = 'Failed to create purchase';
                    this.loading = false;
                }
            });
        }
    }

    onCancel(): void {
        this.cancelled.emit();
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    }

    private initForm(): void {
        const today = new Date().toISOString().split('T')[0];
        this.form = this.fb.group({
            amount: [null, [Validators.required, Validators.min(0.01)]],
            purchase_date: [today, Validators.required],
            description: ['', [Validators.required, Validators.maxLength(200)]],
            notes: [''],
            transaction_id: [null]
        });
    }

    private populateForm(): void {
        if (!this.editingPurchase) {
            return;
        }

        this.form.patchValue({
            amount: this.editingPurchase.amount,
            purchase_date: this.editingPurchase.purchase_date,
            description: this.editingPurchase.description,
            notes: this.editingPurchase.notes || '',
            transaction_id: this.editingPurchase.transaction_id || null
        });
    }

    private resetForm(): void {
        const today = new Date().toISOString().split('T')[0];
        this.form.reset({
            amount: null,
            purchase_date: today,
            description: '',
            notes: '',
            transaction_id: null
        });
        this.errorMessage = '';
    }
}

