import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { TransactionFormComponent } from './transaction-form.component';
import { TransactionService } from '../../core/services/transaction.service';
import { Transaction } from '../../core/models';

describe('TransactionFormComponent', () => {
  let component: TransactionFormComponent;
  let fixture: ComponentFixture<TransactionFormComponent>;
  let mockTransactionService: jasmine.SpyObj<TransactionService>;

  beforeEach(async () => {
    mockTransactionService = jasmine.createSpyObj('TransactionService', ['createTransaction', 'updateTransaction']);
    mockTransactionService.createTransaction.and.returnValue(of({} as Transaction));
    mockTransactionService.updateTransaction.and.returnValue(of({} as Transaction));

    await TestBed.configureTestingModule({
      declarations: [ TransactionFormComponent ],
      imports: [ ReactiveFormsModule ],
      providers: [
        { provide: TransactionService, useValue: mockTransactionService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form in create mode', () => {
    fixture.detectChanges();
    expect(component.editMode).toBeFalse();
    expect(component.transactionForm).toBeDefined();
    expect(component.transactionForm.get('amount')?.value).toBe(0);
  });

  it('should initialize form in edit mode', () => {
    const mockTransaction: Transaction = {
      id: 1,
      amount: 100,
      date: '2024-01-15',
      type: 'expense',
      description: 'Test',
      category_id: 1,
      beneficiary_id: 1,
      user_id: 1
    };
    component.transaction = mockTransaction;
    fixture.detectChanges();
    
    expect(component.editMode).toBeTrue();
    expect(component.transactionForm.get('amount')?.value).toBe(100);
    expect(component.transactionForm.get('description')?.value).toBe('Test');
  });

  it('should validate required fields', () => {
    fixture.detectChanges();
    expect(component.transactionForm.valid).toBeFalse();
    
    component.transactionForm.patchValue({
      amount: 100,
      date: '2024-01-15',
      type: 'expense',
      category_id: 1,
      beneficiary_id: 1,
      user_id: 1
    });
    
    expect(component.transactionForm.valid).toBeTrue();
  });

  it('should validate amount is positive', () => {
    fixture.detectChanges();
    const amountControl = component.transactionForm.get('amount');
    amountControl?.setValue(-10);
    expect(amountControl?.hasError('min')).toBeTrue();
    
    amountControl?.setValue(10);
    expect(amountControl?.hasError('min')).toBeFalse();
  });

  it('should create transaction on submit', () => {
    fixture.detectChanges();
    component.transactionForm.patchValue({
      amount: 100,
      date: '2024-01-15',
      type: 'expense',
      category_id: 1,
      beneficiary_id: 1,
      user_id: 1
    });
    
    component.onSubmit();
    expect(mockTransactionService.createTransaction).toHaveBeenCalled();
  });

  it('should update transaction on submit in edit mode', () => {
    component.transaction = { id: 1 } as Transaction;
    fixture.detectChanges();
    
    component.transactionForm.patchValue({
      amount: 150,
      date: '2024-01-16',
      type: 'expense',
      category_id: 1,
      beneficiary_id: 1,
      user_id: 1
    });
    
    component.onSubmit();
    expect(mockTransactionService.updateTransaction).toHaveBeenCalledWith(1, jasmine.any(Object));
  });

  it('should not submit invalid form', () => {
    fixture.detectChanges();
    component.transactionForm.patchValue({ amount: -10 });
    component.onSubmit();
    expect(mockTransactionService.createTransaction).not.toHaveBeenCalled();
  });
});
