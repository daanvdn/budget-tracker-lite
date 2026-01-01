import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ImageUploadResponse {
  filename: string;
  path: string;
}

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;  // 0-1, where 1 is highest quality
}

const DEFAULT_COMPRESSION: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8
};

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private apiUrl = `${environment.apiUrl}/images`;

  constructor(private http: HttpClient) {}

  /**
   * Compress an image file using Canvas API
   * Resizes to max dimensions and applies JPEG compression
   */
  private compressImage(file: File, options: CompressionOptions = {}): Promise<File> {
    const { maxWidth, maxHeight, quality } = { ...DEFAULT_COMPRESSION, ...options };

    return new Promise((resolve) => {
      // Skip compression for non-image files or small files (< 500KB)
      if (!file.type.startsWith('image/') || file.size < 500 * 1024) {
        resolve(file);
        return;
      }

      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        let { width, height } = img;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxWidth! || height > maxHeight!) {
          const ratio = Math.min(maxWidth! / width, maxHeight! / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Preserve original filename but change extension if needed
              const newFilename = file.name.replace(/\.[^/.]+$/, '.jpg');
              const compressedFile = new File([blob], newFilename, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });

              console.debug(`Image compressed: ${(file.size / 1024).toFixed(1)}KB → ${(compressedFile.size / 1024).toFixed(1)}KB`);
              resolve(compressedFile);
            } else {
              // Fall back to original if compression fails
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        // Fall back to original if image loading fails
        resolve(file);
      };

      // Load image from file
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Upload an image with automatic compression
   */
  uploadImage(file: File, compressionOptions?: CompressionOptions): Observable<ImageUploadResponse> {
    return from(this.compressImage(file, compressionOptions)).pipe(
      switchMap(compressedFile => {
        const formData = new FormData();
        formData.append('file', compressedFile);
        return this.http.post<ImageUploadResponse>(`${this.apiUrl}/upload`, formData);
      })
    );
  }

  /**
   * Upload an image without compression (if needed for specific use cases)
   */
  uploadImageRaw(file: File): Observable<ImageUploadResponse> {
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
