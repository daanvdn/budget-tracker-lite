import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Beneficiary } from '../models';

@Injectable({
  providedIn: 'root'
})
export class BeneficiaryService {
  private apiUrl = 'http://localhost:8000/beneficiaries';

  constructor(private http: HttpClient) {}

  getBeneficiaries(): Observable<Beneficiary[]> {
    return this.http.get<Beneficiary[]>(this.apiUrl);
  }

  getBeneficiary(id: number): Observable<Beneficiary> {
    return this.http.get<Beneficiary>(`${this.apiUrl}/${id}`);
  }

  createBeneficiary(beneficiary: Beneficiary): Observable<Beneficiary> {
    return this.http.post<Beneficiary>(this.apiUrl, beneficiary);
  }

  updateBeneficiary(id: number, beneficiary: Partial<Beneficiary>): Observable<Beneficiary> {
    return this.http.put<Beneficiary>(`${this.apiUrl}/${id}`, beneficiary);
  }

  deleteBeneficiary(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
