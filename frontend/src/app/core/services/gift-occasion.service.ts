import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {
  GiftEntry,
  GiftEntryCreate,
  GiftEntryUpdate,
  GiftOccasion,
  GiftOccasionCreate,
  GiftOccasionSummary,
  GiftOccasionUpdate,
  GiftOccasionWithEntries,
  GiftOccasionWithSummary,
  GiftPurchase,
  GiftPurchaseCreate,
  GiftPurchaseUpdate
} from '../../shared/models/models';

@Injectable({
    providedIn: 'root'
})
export class GiftOccasionService {
    private apiUrl = `${environment.apiUrl}/gift-occasions`;

    constructor(private http: HttpClient) {
    }

    // ============== Gift Occasion Methods ==============

    getOccasions(skip = 0, limit = 100): Observable<GiftOccasionWithSummary[]> {
        const params = new HttpParams()
            .set('skip', skip.toString())
            .set('limit', limit.toString());
        return this.http.get<GiftOccasionWithSummary[]>(this.apiUrl, {params});
    }

    getOccasion(id: number): Observable<GiftOccasionWithEntries> {
        return this.http.get<GiftOccasionWithEntries>(`${this.apiUrl}/${id}`);
    }

    getOccasionSummary(id: number): Observable<GiftOccasionSummary> {
        return this.http.get<GiftOccasionSummary>(`${this.apiUrl}/${id}/summary`);
    }

    createOccasion(occasion: GiftOccasionCreate): Observable<GiftOccasion> {
        return this.http.post<GiftOccasion>(this.apiUrl, occasion);
    }

    updateOccasion(id: number, occasion: GiftOccasionUpdate): Observable<GiftOccasion> {
        return this.http.put<GiftOccasion>(`${this.apiUrl}/${id}`, occasion);
    }

    deleteOccasion(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    // ============== Gift Entry Methods ==============

    getEntries(occasionId: number): Observable<GiftEntry[]> {
        return this.http.get<GiftEntry[]>(`${this.apiUrl}/${occasionId}/entries`);
    }

    createEntry(occasionId: number, entry: GiftEntryCreate): Observable<GiftEntry> {
        return this.http.post<GiftEntry>(`${this.apiUrl}/${occasionId}/entries`, entry);
    }

    updateEntry(entryId: number, entry: GiftEntryUpdate): Observable<GiftEntry> {
        return this.http.put<GiftEntry>(`${this.apiUrl}/entries/${entryId}`, entry);
    }

    deleteEntry(entryId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/entries/${entryId}`);
    }

    // ============== Gift Purchase Methods ==============

    getPurchases(occasionId: number): Observable<GiftPurchase[]> {
        return this.http.get<GiftPurchase[]>(`${this.apiUrl}/${occasionId}/purchases`);
    }

    createPurchase(occasionId: number, purchase: GiftPurchaseCreate): Observable<GiftPurchase> {
        return this.http.post<GiftPurchase>(`${this.apiUrl}/${occasionId}/purchases`, purchase);
    }

    updatePurchase(purchaseId: number, purchase: GiftPurchaseUpdate): Observable<GiftPurchase> {
        return this.http.put<GiftPurchase>(`${this.apiUrl}/purchases/${purchaseId}`, purchase);
    }

    deletePurchase(purchaseId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/purchases/${purchaseId}`);
    }
}

