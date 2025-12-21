import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Transaction {
  id: number;
  user_id: number;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string;
  created_at: string;
}

export interface TransactionCreate {
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date?: string;
}

export interface TransactionUpdate {
  description?: string;
  amount?: number;
  category?: string;
  type?: 'income' | 'expense';
  date?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = `${environment.apiUrl}/transactions`;

  constructor(private http: HttpClient) {}

  getTransactions(
    skip: number = 0,
    limit: number = 100,
    type?: 'income' | 'expense',
    category?: string
  ): Observable<Transaction[]> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());
    
    if (type) {
      params = params.set('type', type);
    }
    if (category) {
      params = params.set('category', category);
    }

    return this.http.get<Transaction[]>(this.apiUrl, { params });
  }

  getTransaction(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
  }

  createTransaction(data: TransactionCreate): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, data);
  }

  updateTransaction(id: number, data: TransactionUpdate): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/${id}`, data);
  }

  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadImage(transactionId: number, file: File): Observable<{ message: string; path: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ message: string; path: string }>(`${this.apiUrl}/${transactionId}/upload-image`, formData);
  }
}
