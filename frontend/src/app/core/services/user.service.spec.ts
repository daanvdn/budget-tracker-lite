import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { User } from '../models';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8000/users';

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
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
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
    const mockUser: User = { id: 1, name: 'John Doe', email: 'john@example.com' };

    service.getUser(1).subscribe(user => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });

  it('should create a user', () => {
    const newUser: User = { name: 'Bob Wilson', email: 'bob@example.com' };
    const mockResponse: User = { ...newUser, id: 3 };

    service.createUser(newUser).subscribe(user => {
      expect(user).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newUser);
    req.flush(mockResponse);
  });

  it('should update a user', () => {
    const update = { name: 'Updated Name' };
    const mockResponse: User = { id: 1, name: 'Updated Name', email: 'john@example.com' };

    service.updateUser(1, update).subscribe(user => {
      expect(user).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(update);
    req.flush(mockResponse);
  });

  it('should delete a user', () => {
    service.deleteUser(1).subscribe(response => {
      expect(response).toBeUndefined();
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
