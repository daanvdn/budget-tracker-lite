import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../core/services/category.service';
import { Category, CategoryType } from '../../shared/models/models';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];

  constructor(
    private categoryService: CategoryService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe(
      data => this.categories = data
    );
  }

  getTranslatedCategoryType(type: CategoryType): string {
    return this.translate.instant(`enums.categoryType.${type}`);
  }
}
