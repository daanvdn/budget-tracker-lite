import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { User } from '../../shared/models/models';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8000/api/users';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all users', () => {
    const mockUsers: User[] = [
      { id: 1, name: 'John Doe', created_at: '2024-01-01T00:00:00Z' },
      { id: 2, name: 'Jane Smith', created_at: '2024-01-02T00:00:00Z' }
    ];

    service.getUsers().subscribe(users => {
      expect(users.length).toBe(2);
      expect(users).toEqual(mockUsers);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });

  it('should get a single user', () => {
    const mockUser: User = { id: 1, name: 'John Doe', created_at: '2024-01-01T00:00:00Z' };

    service.getUser(1).subscribe(user => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });

  it('should create a user', () => {
    const newName = 'Bob Wilson';
    const mockResponse: User = { id: 3, name: newName, created_at: '2024-01-03T00:00:00Z' };

    service.createUser(newName).subscribe(user => {
      expect(user).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: newName });
    req.flush(mockResponse);
  });

  it('should update a user', () => {
    const updateName = 'Updated Name';
    const mockResponse: User = { id: 1, name: 'Updated Name', created_at: '2024-01-01T00:00:00Z' };

    service.updateUser(1, updateName).subscribe(user => {
      expect(user).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ name: updateName });
    req.flush(mockResponse);
  });

  it('should delete a user', () => {
    service.deleteUser(1).subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should handle errors', () => {
    service.getUsers().subscribe(
      () => fail('should have failed'),
      (error) => {
        expect(error.status).toBe(401);
      }
    );

    const req = httpMock.expectOne(apiUrl);
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });
});
