import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BeneficiaryService } from './beneficiary.service';
import { Beneficiary } from '../../shared/models/models';

describe('BeneficiaryService', () => {
  let service: BeneficiaryService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8000/api/beneficiaries';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BeneficiaryService]
    });
    service = TestBed.inject(BeneficiaryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all beneficiaries', () => {
    const mockBeneficiaries: Beneficiary[] = [
      { id: 1, name: 'Grocery Store' },
      { id: 2, name: 'Employer' }
    ];

    service.getBeneficiaries().subscribe(beneficiaries => {
      expect(beneficiaries.length).toBe(2);
      expect(beneficiaries).toEqual(mockBeneficiaries);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockBeneficiaries);
  });

  it('should get a single beneficiary', () => {
    const mockBeneficiary: Beneficiary = { id: 1, name: 'Grocery Store' };

    service.getBeneficiary(1).subscribe(beneficiary => {
      expect(beneficiary).toEqual(mockBeneficiary);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockBeneficiary);
  });

  it('should create a beneficiary', () => {
    const newName = 'Gas Station';
    const mockResponse: Beneficiary = { id: 3, name: 'Gas Station' };

    service.createBeneficiary(newName).subscribe(beneficiary => {
      expect(beneficiary).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: newName });
    req.flush(mockResponse);
  });

  it('should update a beneficiary', () => {
    const updateName = 'Updated Store';
    const mockResponse: Beneficiary = { id: 1, name: 'Updated Store' };

    service.updateBeneficiary(1, updateName).subscribe(beneficiary => {
      expect(beneficiary).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ name: updateName });
    req.flush(mockResponse);
  });

  it('should delete a beneficiary', () => {
    service.deleteBeneficiary(1).subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should handle errors', () => {
    service.getBeneficiaries().subscribe(
      () => fail('should have failed'),
      (error) => {
        expect(error.status).toBe(500);
      }
    );

    const req = httpMock.expectOne(apiUrl);
    req.flush('Server Error', { status: 500, statusText: 'Server Error' });
  });
});
