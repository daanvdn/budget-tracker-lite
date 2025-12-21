import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { UserListComponent } from './user-list.component';
import { UserService } from '../../core/services/user.service';
import { User } from '../../shared/models/models';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;

  const mockUsers: User[] = [
    { id: 1, name: 'John Doe', created_at: '2024-01-01T00:00:00Z' },
    { id: 2, name: 'Jane Smith', created_at: '2024-01-02T00:00:00Z' }
  ];

  beforeEach(async () => {
    mockUserService = jasmine.createSpyObj('UserService', ['getUsers']);
    mockUserService.getUsers.and.returnValue(of(mockUsers));

    await TestBed.configureTestingModule({
      imports: [ UserListComponent, CommonModule ],
      providers: [
        { provide: UserService, useValue: mockUserService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    fixture.detectChanges();
    expect(mockUserService.getUsers).toHaveBeenCalled();
    expect(component.users.length).toBe(2);
  });

  it('should display users', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const items = compiled.querySelectorAll('li');
    expect(items.length).toBe(2);
  });

  it('should show message when no users', () => {
    mockUserService.getUsers.and.returnValue(of([]));
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No users found');
  });
});
