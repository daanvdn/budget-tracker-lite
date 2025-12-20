import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TransactionService } from '../../core/services/transaction.service';
import { Transaction } from '../../core/models';

@Component({
  selector: 'app-transaction-form',
  template: `
    <div class="transaction-form">
      <h3>{{ editMode ? 'Edit' : 'Create' }} Transaction</h3>
      <form [formGroup]="transactionForm" (ngSubmit)="onSubmit()">
        <input formControlName="amount" type="number" placeholder="Amount" required>
        <input formControlName="date" type="date" required>
        <input formControlName="description" type="text" placeholder="Description">
        <select formControlName="type" required>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <input formControlName="category_id" type="number" placeholder="Category ID" required>
        <input formControlName="beneficiary_id" type="number" placeholder="Beneficiary ID" required>
        <input formControlName="user_id" type="number" placeholder="User ID" required>
        <button type="submit" [disabled]="!transactionForm.valid">Submit</button>
      </form>
    </div>
  `
})
export class TransactionFormComponent implements OnInit {
  @Input() transaction?: Transaction;
  transactionForm!: FormGroup;
  editMode = false;

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService
  ) {}

  ngOnInit(): void {
    this.editMode = !!this.transaction?.id;
    this.transactionForm = this.fb.group({
      amount: [this.transaction?.amount || 0, [Validators.required, Validators.min(0.01)]],
      date: [this.transaction?.date || '', Validators.required],
      description: [this.transaction?.description || ''],
      type: [this.transaction?.type || 'expense', Validators.required],
      category_id: [this.transaction?.category_id || 0, Validators.required],
      beneficiary_id: [this.transaction?.beneficiary_id || 0, Validators.required],
      user_id: [this.transaction?.user_id || 0, Validators.required]
    });
  }

  onSubmit(): void {
    if (this.transactionForm.valid) {
      const formValue = this.transactionForm.value;
      if (this.editMode && this.transaction?.id) {
        this.transactionService.updateTransaction(this.transaction.id, formValue).subscribe();
      } else {
        this.transactionService.createTransaction(formValue).subscribe();
      }
    }
  }
}
