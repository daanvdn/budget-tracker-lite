import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReportsComponent } from './reports.component';
import { AggregationSummary } from '../../shared/models/models';

describe('ReportsComponent', () => {
  let component: ReportsComponent;
  let fixture: ComponentFixture<ReportsComponent>;
  let httpMock: HttpTestingController;

  const mockSummary: AggregationSummary = {
    total_income: 3000,
    total_expenses: 150,
    net_balance: 2850,
    transaction_count: 5
  };

  const mockCategories = [{ id: 1, name: 'Food', type: 'expense' }];
  const mockBeneficiaries = [{ id: 1, name: 'Store' }];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ReportsComponent, HttpClientTestingModule, ReactiveFormsModule, CommonModule, NoopAnimationsModule ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function flushInitialRequests() {
    const catReq = httpMock.expectOne('http://localhost:8000/api/categories');
    catReq.flush(mockCategories);
    const benReq = httpMock.expectOne('http://localhost:8000/api/beneficiaries');
    benReq.flush(mockBeneficiaries);
    const summaryReq = httpMock.expectOne('http://localhost:8000/api/aggregations/summary');
    summaryReq.flush(mockSummary);
  }

  it('should create', () => {
    fixture.detectChanges();
    flushInitialRequests();
    expect(component).toBeTruthy();
  });

  it('should load summary on init', () => {
    fixture.detectChanges();
    flushInitialRequests();
    expect(component.summary).toEqual(mockSummary);
  });

  it('should display aggregation data', () => {
    fixture.detectChanges();
    flushInitialRequests();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('3,000');
    expect(compiled.textContent).toContain('150');
    expect(compiled.textContent).toContain('2,850');
  });

  it('should apply filters', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.filterForm.patchValue({ start_date: new Date('2024-01-01'), end_date: new Date('2024-01-31') });
    component.loadSummary();

    const req = httpMock.expectOne(req => req.url.includes('api/aggregations/summary'));
    expect(req.request.method).toBe('GET');
    req.flush(mockSummary);
  });
});
