import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TransactionService } from '../../core/services/transaction.service';
import { Transaction } from '../../core/models';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.css']
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
      transaction_date: [this.transaction?.transaction_date || '', Validators.required],
      description: [this.transaction?.description || ''],
      type: [this.transaction?.type || 'expense', Validators.required],
      category_id: [this.transaction?.category_id || 0, Validators.required],
      beneficiary_id: [this.transaction?.beneficiary_id || 0, Validators.required],
      created_by_user_id: [this.transaction?.created_by_user_id || 0, Validators.required]
    });
  }

  onSubmit(): void {
    if (this.transactionForm.valid) {
      const formValue = this.transactionForm.value;
      // Convert datetime-local to ISO format
      const transactionData = {
        ...formValue,
        transaction_date: new Date(formValue.transaction_date).toISOString()
      };
      if (this.editMode && this.transaction?.id) {
        this.transactionService.updateTransaction(this.transaction.id, transactionData).subscribe();
      } else {
        this.transactionService.createTransaction(transactionData).subscribe();
      }
    }
  }
}
