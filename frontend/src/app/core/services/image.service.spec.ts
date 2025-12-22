import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ImageService, ImageUploadResponse } from './image.service';

describe('ImageService', () => {
  let service: ImageService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8000/api/images';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ImageService]
    });
    service = TestBed.inject(ImageService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should upload image', () => {
    const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
    const mockResponse: ImageUploadResponse = { 
      filename: 'abc123.jpg', 
      path: '/api/images/abc123.jpg' 
    };

    service.uploadImage(file).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/upload`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    req.flush(mockResponse);
  });

  it('should generate correct image URL', () => {
    const filename = 'test-image.jpg';
    const expectedUrl = `${apiUrl}/${filename}`;
    
    expect(service.getImageUrl(filename)).toBe(expectedUrl);
  });

  it('should handle upload errors', () => {
    const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });

    service.uploadImage(file).subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(400);
      }
    });

    const req = httpMock.expectOne(`${apiUrl}/upload`);
    req.flush('File must be an image', { status: 400, statusText: 'Bad Request' });
  });
});
