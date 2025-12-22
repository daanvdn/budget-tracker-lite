import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TransactionService, Transaction, TransactionCreate, TransactionUpdate } from './transaction.service';

describe('TransactionService', () => {
  let service: TransactionService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8000/api/transactions';

  const mockCategory = { id: 1, name: 'Food', type: 'expense' as const };
  const mockBeneficiary = { id: 1, name: 'Grocery Store' };
  const mockUser = { id: 1, name: 'Test User', created_at: '2024-01-01T00:00:00Z' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TransactionService]
    });
    service = TestBed.inject(TransactionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all transactions', () => {
    const mockTransactions: Transaction[] = [
      { 
        id: 1, 
        created_by_user_id: 1, 
        description: 'Test', 
        amount: 100, 
        category_id: 1,
        beneficiary_id: 1,
        type: 'expense', 
        transaction_date: '2024-01-15T00:00:00Z', 
        created_at: '2024-01-15T00:00:00Z',
        category: mockCategory,
        beneficiary: mockBeneficiary,
        created_by_user: mockUser
      }
    ];

    service.getTransactions().subscribe(transactions => {
      expect(transactions.length).toBe(1);
      expect(transactions).toEqual(mockTransactions);
    });

    const req = httpMock.expectOne(req => req.url.includes(apiUrl));
    expect(req.request.method).toBe('GET');
    req.flush(mockTransactions);
  });

  it('should get transactions with filters', () => {
    const mockTransactions: Transaction[] = [];

    service.getTransactions(0, 100, 'expense', 1).subscribe(transactions => {
      expect(transactions).toEqual(mockTransactions);
    });

    const req = httpMock.expectOne(req => req.url.includes(apiUrl));
    expect(req.request.params.get('transaction_type')).toBe('expense');
    expect(req.request.params.get('category_id')).toBe('1');
    req.flush(mockTransactions);
  });

  it('should get a single transaction', () => {
    const mockTransaction: Transaction = {
      id: 1, 
      created_by_user_id: 1, 
      description: 'Test', 
      amount: 100, 
      category_id: 1,
      beneficiary_id: 1,
      type: 'expense', 
      transaction_date: '2024-01-15T00:00:00Z', 
      created_at: '2024-01-15T00:00:00Z',
      category: mockCategory,
      beneficiary: mockBeneficiary,
      created_by_user: mockUser
    };

    service.getTransaction(1).subscribe(transaction => {
      expect(transaction).toEqual(mockTransaction);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockTransaction);
  });

  it('should create a transaction', () => {
    const newTransaction: TransactionCreate = {
      description: 'Test', 
      amount: 100, 
      category_id: 1,
      beneficiary_id: 1,
      created_by_user_id: 1,
      type: 'expense', 
      transaction_date: '2024-01-15T00:00:00Z'
    };
    const mockResponse: Transaction = {
      id: 1,
      created_by_user_id: 1,
      description: 'Test',
      amount: 100,
      category_id: 1,
      beneficiary_id: 1,
      type: 'expense',
      transaction_date: '2024-01-15T00:00:00Z',
      created_at: '2024-01-15T00:00:00Z',
      category: mockCategory,
      beneficiary: mockBeneficiary,
      created_by_user: mockUser
    };

    service.createTransaction(newTransaction).subscribe(transaction => {
      expect(transaction).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newTransaction);
    req.flush(mockResponse);
  });

  it('should update a transaction', () => {
    const update: TransactionUpdate = { amount: 150 };
    const mockResponse: Transaction = {
      id: 1, 
      created_by_user_id: 1, 
      description: 'Test', 
      amount: 150, 
      category_id: 1,
      beneficiary_id: 1,
      type: 'expense', 
      transaction_date: '2024-01-15T00:00:00Z', 
      created_at: '2024-01-15T00:00:00Z',
      category: mockCategory,
      beneficiary: mockBeneficiary,
      created_by_user: mockUser
    };

    service.updateTransaction(1, update).subscribe(transaction => {
      expect(transaction).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(update);
    req.flush(mockResponse);
  });

  it('should delete a transaction', () => {
    service.deleteTransaction(1).subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should handle errors', () => {
    service.getTransactions().subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(500);
      }
    });

    const req = httpMock.expectOne(req => req.url.includes(apiUrl));
    req.flush('Error', { status: 500, statusText: 'Server Error' });
  });
});
