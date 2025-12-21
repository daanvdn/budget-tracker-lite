import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CategoryService } from './category.service';
import { Category, CategoryType } from '../../shared/models/models';

describe('CategoryService', () => {
  let service: CategoryService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8000/api/categories';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CategoryService]
    });
    service = TestBed.inject(CategoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all categories', () => {
    const mockCategories: Category[] = [
      { id: 1, name: 'Food', type: CategoryType.EXPENSE },
      { id: 2, name: 'Salary', type: CategoryType.INCOME }
    ];

    service.getCategories().subscribe(categories => {
      expect(categories.length).toBe(2);
      expect(categories).toEqual(mockCategories);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockCategories);
  });

  it('should get a single category', () => {
    const mockCategory: Category = { id: 1, name: 'Food', type: CategoryType.EXPENSE };

    service.getCategory(1).subscribe(category => {
      expect(category).toEqual(mockCategory);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCategory);
  });

  it('should create a category', () => {
    const newName = 'Transport';
    const newType = CategoryType.EXPENSE;
    const mockResponse: Category = { id: 3, name: newName, type: newType };

    service.createCategory(newName, newType).subscribe(category => {
      expect(category).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: newName, type: newType });
    req.flush(mockResponse);
  });

  it('should update a category', () => {
    const updateName = 'Updated Food';
    const updateType = CategoryType.EXPENSE;
    const mockResponse: Category = { id: 1, name: 'Updated Food', type: CategoryType.EXPENSE };

    service.updateCategory(1, updateName, updateType).subscribe(category => {
      expect(category).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ name: updateName, type: updateType });
    req.flush(mockResponse);
  });

  it('should delete a category', () => {
    service.deleteCategory(1).subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should handle errors', () => {
    service.getCategories().subscribe(
      () => fail('should have failed'),
      (error) => {
        expect(error.status).toBe(404);
      }
    );

    const req = httpMock.expectOne(apiUrl);
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });
  });
});
