import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule} from '@angular/forms';
import {GiftOccasionService} from '../../core/services/gift-occasion.service';
import {BeneficiaryService} from '../../core/services/beneficiary.service';
import {
  Beneficiary,
  GiftOccasionCreate,
  GiftOccasionUpdate,
  GiftOccasionWithSummary,
  OccasionType
} from '../../shared/models/models';
import {TranslateModule, TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-gift-occasion-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule],
    templateUrl: './gift-occasion-form.component.html',
    styleUrls: ['./gift-occasion-form.component.css']
})
export class GiftOccasionFormComponent implements OnInit, OnChanges {
    @Input() beneficiaries: Beneficiary[] = [];
    @Input() currentUserId: number | null = null;
    @Input() editingOccasion: GiftOccasionWithSummary | null = null;

    @Output() occasionCreated = new EventEmitter<GiftOccasionWithSummary>();
    @Output() occasionUpdated = new EventEmitter<GiftOccasionWithSummary>();
    @Output() cancelled = new EventEmitter<void>();
    @Output() beneficiaryCreated = new EventEmitter<Beneficiary>();

    form!: FormGroup;
    loading = false;
    errorMessage = '';
    occasionTypes = Object.values(OccasionType);

    // New beneficiary creation
    showNewBeneficiaryInput = false;
    newBeneficiaryName = '';
    creatingBeneficiary = false;

    constructor(
        private fb: FormBuilder,
        private giftOccasionService: GiftOccasionService,
        private beneficiaryService: BeneficiaryService,
        private translate: TranslateService
    ) {
    }

    get isEditMode(): boolean {
        return !!this.editingOccasion;
    }

    ngOnInit(): void {
        this.initForm();
        if (this.editingOccasion) {
            this.populateForm();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['editingOccasion'] && this.form) {
            if (this.editingOccasion) {
                this.populateForm();
            }
            else {
                this.resetForm();
            }
        }
    }

    onSubmit(): void {
        if (!this.form.valid || !this.currentUserId) {
            return;
        }

        this.loading = true;
        this.errorMessage = '';

        const formValue = this.form.value;

        if (this.isEditMode && this.editingOccasion) {
            const update: GiftOccasionUpdate = {
                name: formValue.name,
                occasion_type: formValue.occasion_type,
                occasion_date: formValue.occasion_date || undefined,
                person_id: formValue.person_id || undefined,
                notes: formValue.notes || undefined,
                is_pool_account: formValue.is_pool_account
            };

            this.giftOccasionService.updateOccasion(this.editingOccasion.id, update).subscribe({
                next: (updated) => {
                    // Merge with existing summary
                    const withSummary: GiftOccasionWithSummary = {
                        ...updated,
                        summary: this.editingOccasion!.summary
                    };
                    this.occasionUpdated.emit(withSummary);
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Failed to update occasion', error);
                    this.errorMessage = 'Failed to update occasion';
                    this.loading = false;
                }
            });
        }
        else {
            const create: GiftOccasionCreate = {
                name: formValue.name,
                occasion_type: formValue.occasion_type,
                occasion_date: formValue.occasion_date || undefined,
                person_id: formValue.person_id || undefined,
                notes: formValue.notes || undefined,
                is_pool_account: formValue.is_pool_account,
                created_by_user_id: this.currentUserId
            };

            this.giftOccasionService.createOccasion(create).subscribe({
                next: (created) => {
                    const withSummary: GiftOccasionWithSummary = {
                        ...created,
                        summary: {
                            occasion_id: created.id,
                            total_received: 0,
                            total_given: 0,
                            total_purchases: 0,
                            balance: 0,
                            entry_count: 0,
                            purchase_count: 0
                        }
                    };
                    this.occasionCreated.emit(withSummary);
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Failed to create occasion', error);
                    this.errorMessage = 'Failed to create occasion';
                    this.loading = false;
                }
            });
        }
    }

    onCancel(): void {
        this.cancelled.emit();
    }

    // New beneficiary creation methods
    toggleNewBeneficiaryInput(): void {
        this.showNewBeneficiaryInput = !this.showNewBeneficiaryInput;
        if (!this.showNewBeneficiaryInput) {
            this.newBeneficiaryName = '';
        }
    }

    createNewBeneficiary(): void {
        if (!this.newBeneficiaryName.trim()) {
            return;
        }

        this.creatingBeneficiary = true;
        this.beneficiaryService.createBeneficiary(this.newBeneficiaryName.trim()).subscribe({
            next: (newBeneficiary: Beneficiary) => {
                // Add to local list and select it
                this.beneficiaries = [...this.beneficiaries, newBeneficiary];
                this.form.patchValue({ person_id: newBeneficiary.id });

                // Emit event so parent can update its list
                this.beneficiaryCreated.emit(newBeneficiary);

                // Reset the new beneficiary input
                this.newBeneficiaryName = '';
                this.showNewBeneficiaryInput = false;
                this.creatingBeneficiary = false;
            },
            error: (error: any) => {
                console.error('Failed to create beneficiary', error);
                this.errorMessage = 'Failed to create person. Please try again.';
                this.creatingBeneficiary = false;
            }
        });
    }

    formatOccasionType(type: OccasionType): string {
        return this.translate.instant(`enums.occasionType.${type}`);
    }

    private initForm(): void {
        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.maxLength(200)]],
            occasion_type: [OccasionType.OTHER, Validators.required],
            occasion_date: [null],
            person_id: [null],
            notes: [''],
            is_pool_account: [false]
        });
    }

    private populateForm(): void {
        if (!this.editingOccasion) {
            return;
        }

        this.form.patchValue({
            name: this.editingOccasion.name,
            occasion_type: this.editingOccasion.occasion_type,
            occasion_date: this.editingOccasion.occasion_date || null,
            person_id: this.editingOccasion.person_id || null,
            notes: this.editingOccasion.notes || '',
            is_pool_account: this.editingOccasion.is_pool_account
        });
    }

    private resetForm(): void {
        this.form.reset({
            name: '',
            occasion_type: OccasionType.OTHER,
            occasion_date: null,
            person_id: null,
            notes: '',
            is_pool_account: false
        });
        this.errorMessage = '';
    }
}

