import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { CategoryListComponent } from './category-list.component';
import { CategoryService } from '../../core/services/category.service';
import { Category, CategoryType } from '../../shared/models/models';

describe('CategoryListComponent', () => {
  let component: CategoryListComponent;
  let fixture: ComponentFixture<CategoryListComponent>;
  let mockCategoryService: jasmine.SpyObj<CategoryService>;

  const mockCategories: Category[] = [
    { id: 1, name: 'Food', type: CategoryType.EXPENSE },
    { id: 2, name: 'Salary', type: CategoryType.INCOME }
  ];

  beforeEach(async () => {
    mockCategoryService = jasmine.createSpyObj('CategoryService', ['getCategories']);
    mockCategoryService.getCategories.and.returnValue(of(mockCategories));

    await TestBed.configureTestingModule({
      imports: [ CategoryListComponent, CommonModule ],
      providers: [
        { provide: CategoryService, useValue: mockCategoryService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load categories on init', () => {
    fixture.detectChanges();
    expect(mockCategoryService.getCategories).toHaveBeenCalled();
    expect(component.categories.length).toBe(2);
  });

  it('should display categories', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const items = compiled.querySelectorAll('li');
    expect(items.length).toBe(2);
  });

  it('should show message when no categories', () => {
    mockCategoryService.getCategories.and.returnValue(of([]));
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No categories found');
  });
});
