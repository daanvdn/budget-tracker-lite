import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AggregationSummary, TransactionType } from '../../shared/models/models';

@Injectable({
  providedIn: 'root'
})
export class AggregationService {
  private apiUrl = `${environment.apiUrl}/aggregations`;

  constructor(private http: HttpClient) {}

  getSummary(filters?: {
    start_date?: string;
    end_date?: string;
    transaction_type?: TransactionType;
    category_id?: number;
    beneficiary_id?: number;
  }): Observable<AggregationSummary> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<AggregationSummary>(`${this.apiUrl}/summary`, { params });
  }
}
