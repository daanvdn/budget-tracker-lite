import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BeneficiaryService } from '../../core/services/beneficiary.service';
import { Beneficiary } from '../../shared/models/models';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-beneficiary-list',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './beneficiary-list.component.html',
  styleUrls: ['./beneficiary-list.component.css']
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
