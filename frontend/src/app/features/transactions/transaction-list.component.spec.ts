import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { TransactionListComponent } from './transaction-list.component';
import { TransactionService, Transaction } from '../../core/services/transaction.service';
import { CommonModule } from '@angular/common';

describe('TransactionListComponent', () => {
  let component: TransactionListComponent;
  let fixture: ComponentFixture<TransactionListComponent>;
  let mockTransactionService: jasmine.SpyObj<TransactionService>;

  const mockCategory = { id: 1, name: 'Food', type: 'expense' as const };
  const mockBeneficiary = { id: 1, name: 'Grocery Store' };
  const mockUser = { id: 1, name: 'Test User', created_at: '2024-01-01T00:00:00Z' };

  const mockTransactions: Transaction[] = [
    { 
      id: 1, 
      created_by_user_id: 1, 
      description: 'Food', 
      amount: 100, 
      category_id: 1,
      beneficiary_id: 1,
      type: 'expense', 
      transaction_date: '2024-01-15T00:00:00Z', 
      created_at: '2024-01-15T00:00:00Z',
      category: mockCategory,
      beneficiary: mockBeneficiary,
      created_by_user: mockUser
    },
    { 
      id: 2, 
      created_by_user_id: 1, 
      description: 'Salary', 
      amount: 3000, 
      category_id: 2,
      beneficiary_id: 2,
      type: 'income', 
      transaction_date: '2024-01-31T00:00:00Z', 
      created_at: '2024-01-31T00:00:00Z',
      category: { id: 2, name: 'Salary', type: 'income' as const },
      beneficiary: { id: 2, name: 'Employer' },
      created_by_user: mockUser
    }
  ];

  beforeEach(async () => {
    mockTransactionService = jasmine.createSpyObj('TransactionService', ['getTransactions']);
    mockTransactionService.getTransactions.and.returnValue(of(mockTransactions));

    await TestBed.configureTestingModule({
      imports: [ TransactionListComponent, CommonModule, FormsModule ],
      providers: [
        { provide: TransactionService, useValue: mockTransactionService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load transactions on init', () => {
    fixture.detectChanges();
    expect(mockTransactionService.getTransactions).toHaveBeenCalled();
    expect(component.transactions.length).toBe(2);
  });

  it('should display transactions in the list', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const items = compiled.querySelectorAll('.transaction-item');
    expect(items.length).toBe(2);
  });

  it('should show message when no transactions', () => {
    mockTransactionService.getTransactions.and.returnValue(of([]));
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No transactions');
  });

  it('should apply filters', () => {
    fixture.detectChanges();
    component.applyFilters();
    expect(mockTransactionService.getTransactions).toHaveBeenCalled();
  });
});
