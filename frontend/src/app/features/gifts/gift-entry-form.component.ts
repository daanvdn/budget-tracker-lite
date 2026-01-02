import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {GiftOccasionService} from '../../core/services/gift-occasion.service';
import {Transaction} from '../../core/services/transaction.service';
import {Beneficiary, GiftDirection, GiftEntry, GiftEntryCreate, GiftEntryUpdate} from '../../shared/models/models';

@Component({
    selector: 'app-gift-entry-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './gift-entry-form.component.html',
    styleUrls: ['./gift-entry-form.component.css']
})
export class GiftEntryFormComponent implements OnInit, OnChanges {
    @Input() occasionId!: number;
    @Input() beneficiaries: Beneficiary[] = [];
    @Input() transactions: Transaction[] = [];
    @Input() currentUserId: number | null = null;
    @Input() editingEntry: GiftEntry | null = null;
    @Input() defaultDirection: GiftDirection = GiftDirection.RECEIVED;

    @Output() entryCreated = new EventEmitter<GiftEntry>();
    @Output() entryUpdated = new EventEmitter<GiftEntry>();
    @Output() cancelled = new EventEmitter<void>();

    form!: FormGroup;
    loading = false;
    errorMessage = '';
    directions = Object.values(GiftDirection);
    showTransactionPicker = false;

    constructor(
        private fb: FormBuilder,
        private giftOccasionService: GiftOccasionService
    ) {
    }

    get isEditMode(): boolean {
        return !!this.editingEntry;
    }

    get filteredTransactions(): Transaction[] {
        // Filter transactions based on direction
        const direction = this.form.get('direction')?.value;
        if (direction === GiftDirection.RECEIVED) {
            return this.transactions.filter(t => t.type === 'income');
        }
        else {
            return this.transactions.filter(t => t.type === 'expense');
        }
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
        if (this.editingEntry) {
            this.populateForm();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['editingEntry'] && this.form) {
            if (this.editingEntry) {
                this.populateForm();
            }
            else {
                this.resetForm();
            }
        }
        if (changes['defaultDirection'] && this.form && !this.editingEntry) {
            this.form.patchValue({direction: this.defaultDirection});
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

        if (this.isEditMode && this.editingEntry) {
            const update: GiftEntryUpdate = {
                direction: formValue.direction,
                person_id: formValue.person_id,
                amount: formValue.amount,
                gift_date: formValue.gift_date,
                description: formValue.description || undefined,
                notes: formValue.notes || undefined,
                transaction_id: formValue.transaction_id || undefined
            };

            this.giftOccasionService.updateEntry(this.editingEntry.id, update).subscribe({
                next: (updated) => {
                    this.entryUpdated.emit(updated);
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Failed to update entry', error);
                    this.errorMessage = 'Failed to update entry';
                    this.loading = false;
                }
            });
        }
        else {
            const create: GiftEntryCreate = {
                direction: formValue.direction,
                person_id: formValue.person_id,
                amount: formValue.amount,
                gift_date: formValue.gift_date,
                description: formValue.description || undefined,
                notes: formValue.notes || undefined,
                transaction_id: formValue.transaction_id || undefined,
                created_by_user_id: this.currentUserId
            };

            this.giftOccasionService.createEntry(this.occasionId, create).subscribe({
                next: (created) => {
                    this.entryCreated.emit(created);
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Failed to create entry', error);
                    this.errorMessage = 'Failed to create entry';
                    this.loading = false;
                }
            });
        }
    }

    onCancel(): void {
        this.cancelled.emit();
    }

    formatDirection(direction: GiftDirection): string {
        return direction === GiftDirection.RECEIVED ? 'Received' : 'Given';
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
            direction: [this.defaultDirection, Validators.required],
            person_id: [null, Validators.required],
            amount: [null, [Validators.required, Validators.min(0.01)]],
            gift_date: [today, Validators.required],
            description: [''],
            notes: [''],
            transaction_id: [null]
        });
    }

    private populateForm(): void {
        if (!this.editingEntry) {
            return;
        }

        this.form.patchValue({
            direction: this.editingEntry.direction,
            person_id: this.editingEntry.person_id,
            amount: this.editingEntry.amount,
            gift_date: this.editingEntry.gift_date,
            description: this.editingEntry.description || '',
            notes: this.editingEntry.notes || '',
            transaction_id: this.editingEntry.transaction_id || null
        });
    }

    private resetForm(): void {
        const today = new Date().toISOString().split('T')[0];
        this.form.reset({
            direction: this.defaultDirection,
            person_id: null,
            amount: null,
            gift_date: today,
            description: '',
            notes: '',
            transaction_id: null
        });
        this.errorMessage = '';
    }
}

