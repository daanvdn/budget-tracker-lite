import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = 'http://localhost:8000/transactions';

  constructor(private http: HttpClient) {}

  getTransactions(filters?: {
    start_date?: string;
    end_date?: string;
    beneficiary_id?: number;
    category_id?: number;
    type?: string;
  }): Observable<Transaction[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.start_date) params = params.set('start_date', filters.start_date);
      if (filters.end_date) params = params.set('end_date', filters.end_date);
      if (filters.beneficiary_id) params = params.set('beneficiary_id', filters.beneficiary_id.toString());
      if (filters.category_id) params = params.set('category_id', filters.category_id.toString());
      if (filters.type) params = params.set('type', filters.type);
    }
    return this.http.get<Transaction[]>(this.apiUrl, { params });
  }

  getTransaction(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
  }

  createTransaction(transaction: Transaction): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, transaction);
  }

  updateTransaction(id: number, transaction: Partial<Transaction>): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/${id}`, transaction);
  }

  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadImage(id: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/${id}/upload-image`, formData);
  }
}
