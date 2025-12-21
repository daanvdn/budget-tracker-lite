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

  const mockTransactions: Transaction[] = [
    { id: 1, user_id: 1, description: 'Food', amount: 100, category: 'Food', type: 'expense', date: '2024-01-15', created_at: '2024-01-15T00:00:00Z' },
    { id: 2, user_id: 1, description: 'Salary', amount: 3000, category: 'Salary', type: 'income', date: '2024-01-31', created_at: '2024-01-31T00:00:00Z' }
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

  it('should display transactions in table', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const rows = compiled.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });

  it('should show message when no transactions', () => {
    mockTransactionService.getTransactions.and.returnValue(of([]));
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No transactions found');
  });

  it('should apply filters', () => {
    fixture.detectChanges();
    component.applyFilters();
    expect(mockTransactionService.getTransactions).toHaveBeenCalled();
  });
});
