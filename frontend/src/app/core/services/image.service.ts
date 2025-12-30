import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ImageUploadResponse {
  filename: string;
  path: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private apiUrl = `${environment.apiUrl}/images`;

  constructor(private http: HttpClient) {}

  uploadImage(file: File): Observable<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ImageUploadResponse>(`${this.apiUrl}/upload`, formData);
  }

  getImageUrl(filename: string): string {
    return `${this.apiUrl}/${filename}`;
  }

  getImageBlob(filename: string, token: string): Observable<Blob> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.get(`${this.apiUrl}/${filename}`, { headers, responseType: 'blob' });
  }
}
