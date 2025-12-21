import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { BeneficiaryListComponent } from './beneficiary-list.component';
import { BeneficiaryService } from '../../core/services/beneficiary.service';
import { Beneficiary } from '../../shared/models/models';

describe('BeneficiaryListComponent', () => {
  let component: BeneficiaryListComponent;
  let fixture: ComponentFixture<BeneficiaryListComponent>;
  let mockBeneficiaryService: jasmine.SpyObj<BeneficiaryService>;

  const mockBeneficiaries: Beneficiary[] = [
    { id: 1, name: 'Store A' },
    { id: 2, name: 'Store B' }
  ];

  beforeEach(async () => {
    mockBeneficiaryService = jasmine.createSpyObj('BeneficiaryService', ['getBeneficiaries']);
    mockBeneficiaryService.getBeneficiaries.and.returnValue(of(mockBeneficiaries));

    await TestBed.configureTestingModule({
      imports: [ BeneficiaryListComponent, CommonModule ],
      providers: [
        { provide: BeneficiaryService, useValue: mockBeneficiaryService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BeneficiaryListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load beneficiaries on init', () => {
    fixture.detectChanges();
    expect(mockBeneficiaryService.getBeneficiaries).toHaveBeenCalled();
    expect(component.beneficiaries.length).toBe(2);
  });

  it('should display beneficiaries', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const items = compiled.querySelectorAll('li');
    expect(items.length).toBe(2);
  });

  it('should show message when no beneficiaries', () => {
    mockBeneficiaryService.getBeneficiaries.and.returnValue(of([]));
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No beneficiaries found');
  });
});
