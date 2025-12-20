import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models';

@Component({
  selector: 'app-category-list',
  template: `
    <div class="category-list">
      <h2>Categories</h2>
      <ul *ngIf="categories.length > 0">
        <li *ngFor="let category of categories">
          {{ category.name }} ({{ category.type }})
        </li>
      </ul>
      <p *ngIf="categories.length === 0">No categories found.</p>
    </div>
  `
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe(
      data => this.categories = data
    );
  }
}
