import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TransactionService, Transaction, TransactionCreate, TransactionUpdate } from './transaction.service';

describe('TransactionService', () => {
  let service: TransactionService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8000/api/transactions';

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
      { id: 1, user_id: 1, description: 'Test', amount: 100, category: 'Food', type: 'expense', date: '2024-01-15', created_at: '2024-01-15T00:00:00Z' }
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

    service.getTransactions(0, 100, 'expense', 'Food').subscribe(transactions => {
      expect(transactions).toEqual(mockTransactions);
    });

    const req = httpMock.expectOne(req => req.url.includes(apiUrl));
    expect(req.request.params.get('type')).toBe('expense');
    expect(req.request.params.get('category')).toBe('Food');
    req.flush(mockTransactions);
  });

  it('should get a single transaction', () => {
    const mockTransaction: Transaction = {
      id: 1, user_id: 1, description: 'Test', amount: 100, category: 'Food', type: 'expense', date: '2024-01-15', created_at: '2024-01-15T00:00:00Z'
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
      description: 'Test', amount: 100, category: 'Food', type: 'expense', date: '2024-01-15'
    };
    const mockResponse: Transaction = {
      id: 1,
      user_id: 1,
      description: 'Test',
      amount: 100,
      category: 'Food',
      type: 'expense',
      date: '2024-01-15',
      created_at: '2024-01-15T00:00:00Z'
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
      id: 1, user_id: 1, description: 'Test', amount: 150, category: 'Food', type: 'expense', date: '2024-01-15', created_at: '2024-01-15T00:00:00Z'
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
    service.getTransactions().subscribe(
      () => fail('should have failed'),
      (error) => {
        expect(error.status).toBe(500);
      }
    );

    const req = httpMock.expectOne(req => req.url.includes(apiUrl));
    req.flush('Error', { status: 500, statusText: 'Server Error' });
  });

  it('should upload image', () => {
    const file = new File([''], 'test.jpg');
    const mockResponse = { message: 'Image uploaded', path: '/uploads/test.jpg' };

    service.uploadImage(1, file).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/1/upload-image`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    req.flush(mockResponse);
  });
});
