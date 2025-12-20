import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { TransactionListComponent } from './transaction-list.component';
import { TransactionService } from '../../core/services/transaction.service';
import { Transaction } from '../../core/models';
import { CommonModule } from '@angular/common';

describe('TransactionListComponent', () => {
  let component: TransactionListComponent;
  let fixture: ComponentFixture<TransactionListComponent>;
  let mockTransactionService: jasmine.SpyObj<TransactionService>;

  const mockTransactions: Transaction[] = [
    { id: 1, amount: 100, date: '2024-01-15', type: 'expense', description: 'Food', category_id: 1, beneficiary_id: 1, user_id: 1 },
    { id: 2, amount: 3000, date: '2024-01-31', type: 'income', description: 'Salary', category_id: 2, beneficiary_id: 2, user_id: 1 }
  ];

  beforeEach(async () => {
    mockTransactionService = jasmine.createSpyObj('TransactionService', ['getTransactions']);
    mockTransactionService.getTransactions.and.returnValue(of(mockTransactions));

    await TestBed.configureTestingModule({
      declarations: [ TransactionListComponent ],
      imports: [ CommonModule, FormsModule ],
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
    expect(component.transactions).toEqual(mockTransactions);
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
    component.filters = { start_date: '2024-01-01', end_date: '2024-01-31' };
    component.applyFilters();
    expect(mockTransactionService.getTransactions).toHaveBeenCalledWith(component.filters);
  });
});
