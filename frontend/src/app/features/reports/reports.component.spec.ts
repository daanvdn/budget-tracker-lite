import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReportsComponent } from './reports.component';
import { AggregationSummary } from '../../core/models';

describe('ReportsComponent', () => {
  let component: ReportsComponent;
  let fixture: ComponentFixture<ReportsComponent>;
  let httpMock: HttpTestingController;

  const mockSummary: AggregationSummary = {
    total_income: 3000,
    total_expenses: 150,
    net_total: 2850,
    by_category: [
      { category_id: 1, category_name: 'Food', total: 100 },
      { category_id: 2, category_name: 'Salary', total: 3000 }
    ],
    by_beneficiary: []
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportsComponent ],
      imports: [ HttpClientTestingModule, FormsModule, CommonModule ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load summary on init', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:8000/aggregations/summary');
    expect(req.request.method).toBe('GET');
    req.flush(mockSummary);
    expect(component.summary).toEqual(mockSummary);
  });

  it('should display aggregation data', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:8000/aggregations/summary');
    req.flush(mockSummary);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('3000');
    expect(compiled.textContent).toContain('150');
    expect(compiled.textContent).toContain('2850');
  });

  it('should apply filters', () => {
    component.filters = { start_date: '2024-01-01', end_date: '2024-01-31' };
    component.loadSummary();

    const req = httpMock.expectOne(req => req.url.includes('aggregations/summary'));
    expect(req.request.url).toContain('start_date=2024-01-01');
    expect(req.request.url).toContain('end_date=2024-01-31');
    req.flush(mockSummary);
  });
});
