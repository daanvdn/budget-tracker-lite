import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BeneficiaryService } from '../../core/services/beneficiary.service';
import { Beneficiary } from '../../shared/models/models';

@Component({
  selector: 'app-beneficiaries',
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
    MatSnackBarModule
  ],
  templateUrl: './beneficiaries.component.html',
  styles: [`
    .beneficiary-form {
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

    .beneficiaries-table {
      width: 100%;
      margin-top: 20px;
    }
  `]
})
export class BeneficiariesComponent implements OnInit {
  beneficiaries: Beneficiary[] = [];
  showForm = false;
  editingId: number | null = null;
  beneficiaryForm: FormGroup;
  displayedColumns = ['name', 'actions'];

  constructor(
    private fb: FormBuilder,
    private beneficiaryService: BeneficiaryService,
    private snackBar: MatSnackBar
  ) {
    this.beneficiaryForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadBeneficiaries();
  }

  loadBeneficiaries() {
    this.beneficiaryService.getBeneficiaries().subscribe({
      next: (data) => this.beneficiaries = data,
      error: (err) => this.showError('Failed to load beneficiaries')
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.cancelEdit();
    }
  }

  onSubmit() {
    if (this.beneficiaryForm.valid) {
      const { name } = this.beneficiaryForm.value;

      if (this.editingId) {
        this.beneficiaryService.updateBeneficiary(this.editingId, name).subscribe({
          next: () => {
            this.showSuccess('Beneficiary updated successfully');
            this.loadBeneficiaries();
            this.cancelEdit();
          },
          error: (err) => this.showError('Failed to update beneficiary')
        });
      } else {
        this.beneficiaryService.createBeneficiary(name).subscribe({
          next: () => {
            this.showSuccess('Beneficiary created successfully');
            this.loadBeneficiaries();
            this.cancelEdit();
          },
          error: (err) => this.showError('Failed to create beneficiary')
        });
      }
    }
  }

  editBeneficiary(beneficiary: Beneficiary) {
    this.editingId = beneficiary.id;
    this.showForm = true;
    this.beneficiaryForm.patchValue({ name: beneficiary.name });
  }

  deleteBeneficiary(id: number) {
    if (confirm('Are you sure you want to delete this beneficiary?')) {
      this.beneficiaryService.deleteBeneficiary(id).subscribe({
        next: () => {
          this.showSuccess('Beneficiary deleted successfully');
          this.loadBeneficiaries();
        },
        error: (err) => this.showError('Failed to delete beneficiary')
      });
    }
  }

  cancelEdit() {
    this.showForm = false;
    this.editingId = null;
    this.beneficiaryForm.reset();
  }

  showSuccess(message: string) {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  showError(message: string) {
    this.snackBar.open(message, 'Close', { duration: 5000 });
  }
}
