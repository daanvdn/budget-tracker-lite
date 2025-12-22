import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Category {
  id: number;
  name: string;
  type: 'expense' | 'income' | 'both';
}

export interface Beneficiary {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  created_at: string;
}

export interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  transaction_date: string;
  image_path?: string;
  category_id: number;
  beneficiary_id: number;
  created_by_user_id: number;
  created_at: string;
  category?: Category;
  beneficiary: Beneficiary;
  created_by_user: User;
}

export interface TransactionCreate {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  transaction_date: string;
  category_id: number;
  beneficiary_id: number;
  created_by_user_id: number;
  image_path?: string;
}

export interface TransactionUpdate {
  type?: 'income' | 'expense';
  amount?: number;
  description?: string;
  transaction_date?: string;
  category_id?: number;
  beneficiary_id?: number;
  created_by_user_id?: number;
  image_path?: string;
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
    category_id?: number,
    beneficiary_id?: number
  ): Observable<Transaction[]> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());
    
    if (type) {
      params = params.set('transaction_type', type);
    }
    if (category_id) {
      params = params.set('category_id', category_id.toString());
    }
    if (beneficiary_id) {
      params = params.set('beneficiary_id', beneficiary_id.toString());
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
}
