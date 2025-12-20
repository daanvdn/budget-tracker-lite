import { Component, OnInit } from '@angular/core';
import { BeneficiaryService } from '../../core/services/beneficiary.service';
import { Beneficiary } from '../../core/models';

@Component({
  selector: 'app-beneficiary-list',
  template: `
    <div class="beneficiary-list">
      <h2>Beneficiaries</h2>
      <ul *ngIf="beneficiaries.length > 0">
        <li *ngFor="let beneficiary of beneficiaries">
          {{ beneficiary.name }}
        </li>
      </ul>
      <p *ngIf="beneficiaries.length === 0">No beneficiaries found.</p>
    </div>
  `
})
export class BeneficiaryListComponent implements OnInit {
  beneficiaries: Beneficiary[] = [];

  constructor(private beneficiaryService: BeneficiaryService) {}

  ngOnInit(): void {
    this.beneficiaryService.getBeneficiaries().subscribe(
      data => this.beneficiaries = data
    );
  }
}
