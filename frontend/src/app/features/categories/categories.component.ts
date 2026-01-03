import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CategoryService } from '../../core/services/category.service';
import { Category, CategoryType } from '../../shared/models/models';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    TranslateModule
  ],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  showForm = false;
  editingId: number | null = null;
  categoryForm: FormGroup;
  displayedColumns = ['name', 'type', 'actions'];

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      type: ['expense', Validators.required]
    });
  }

  ngOnInit() {
    this.loadCategories();
  }

  getTranslatedCategoryType(type: CategoryType): string {
    return this.translate.instant(`enums.categoryType.${type}`);
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (data) => this.categories = data,
      error: (err) => this.showError('Failed to load categories')
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.cancelEdit();
    }
  }

  onSubmit() {
    if (this.categoryForm.valid) {
      const { name, type } = this.categoryForm.value;

      if (this.editingId) {
        this.categoryService.updateCategory(this.editingId, name, type).subscribe({
          next: () => {
            this.showSuccess('Category updated successfully');
            this.loadCategories();
            this.cancelEdit();
          },
          error: (err) => this.showError('Failed to update category')
        });
      } else {
        this.categoryService.createCategory(name, type).subscribe({
          next: () => {
            this.showSuccess('Category created successfully');
            this.loadCategories();
            this.cancelEdit();
          },
          error: (err) => this.showError('Failed to create category')
        });
      }
    }
  }

  editCategory(category: Category) {
    this.editingId = category.id;
    this.showForm = true;
    this.categoryForm.patchValue({
      name: category.name,
      type: category.type
    });
  }

  deleteCategory(id: number) {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          this.showSuccess('Category deleted successfully');
          this.loadCategories();
        },
        error: (err) => {
          if (err.status === 409) {
            this.showError('Cannot delete category: it is still used by one or more transactions');
          } else {
            this.showError('Failed to delete category');
          }
        }
      });
    }
  }

  cancelEdit() {
    this.showForm = false;
    this.editingId = null;
    this.categoryForm.reset({ type: 'expense' });
  }

  showSuccess(message: string) {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  showError(message: string) {
    this.snackBar.open(message, 'Close', { duration: 5000 });
  }
}
