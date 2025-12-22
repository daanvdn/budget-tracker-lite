import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../shared/models/models';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css']
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
