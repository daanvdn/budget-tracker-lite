import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {GiftOccasionService} from '../../core/services/gift-occasion.service';
import {BeneficiaryService} from '../../core/services/beneficiary.service';
import {AuthService} from '../../core/services/auth.service';
import {Beneficiary, GiftOccasionWithSummary, OccasionType} from '../../shared/models/models';
import {GiftOccasionFormComponent} from './gift-occasion-form.component';

@Component({
    selector: 'app-gift-occasions-list',
    standalone: true,
    imports: [CommonModule, GiftOccasionFormComponent],
    templateUrl: './gift-occasions-list.component.html',
    styleUrls: ['./gift-occasions-list.component.css']
})
export class GiftOccasionsListComponent implements OnInit {
    occasions: GiftOccasionWithSummary[] = [];
    beneficiaries: Beneficiary[] = [];
    currentUserId: number | null = null;
    showFormDialog = false;
    editingOccasion: GiftOccasionWithSummary | null = null;
    loading = false;
    errorMessage = '';

    constructor(
        private giftOccasionService: GiftOccasionService,
        private beneficiaryService: BeneficiaryService,
        private authService: AuthService,
        private router: Router
    ) {
    }

    ngOnInit(): void {
        this.loadCurrentUser();
        this.loadOccasions();
        this.loadBeneficiaries();
    }

    loadCurrentUser(): void {
        this.authService.currentUser$.subscribe(user => {
            this.currentUserId = user?.id || null;
        });
    }

    loadOccasions(): void {
        this.loading = true;
        this.giftOccasionService.getOccasions().subscribe({
            next: (occasions) => {
                this.occasions = occasions;
                this.loading = false;
            },
            error: (error) => {
                console.error('Failed to load occasions', error);
                this.errorMessage = 'Failed to load gift occasions';
                this.loading = false;
            }
        });
    }

    loadBeneficiaries(): void {
        this.beneficiaryService.getBeneficiaries().subscribe({
            next: (beneficiaries) => {
                this.beneficiaries = beneficiaries;
            },
            error: (error) => {
                console.error('Failed to load beneficiaries', error);
            }
        });
    }

    openCreateDialog(): void {
        this.editingOccasion = null;
        this.showFormDialog = true;
    }

    openEditDialog(occasion: GiftOccasionWithSummary): void {
        this.editingOccasion = occasion;
        this.showFormDialog = true;
    }

    closeFormDialog(): void {
        this.showFormDialog = false;
        this.editingOccasion = null;
    }

    onOccasionCreated(occasion: GiftOccasionWithSummary): void {
        this.occasions.unshift(occasion);
        this.closeFormDialog();
    }

    onOccasionUpdated(occasion: GiftOccasionWithSummary): void {
        const index = this.occasions.findIndex(o => o.id === occasion.id);
        if (index !== -1) {
            this.occasions[index] = occasion;
        }
        this.closeFormDialog();
    }

    viewOccasion(occasion: GiftOccasionWithSummary): void {
        this.router.navigate(['/gifts', occasion.id]);
    }

    deleteOccasion(occasion: GiftOccasionWithSummary, event: Event): void {
        event.stopPropagation();
        if (confirm(
            `Are you sure you want to delete "${occasion.name}"? This will also delete all entries and purchases.`)) {
            this.giftOccasionService.deleteOccasion(occasion.id).subscribe({
                next: () => {
                    this.occasions = this.occasions.filter(o => o.id !== occasion.id);
                },
                error: (error) => {
                    console.error('Failed to delete occasion', error);
                    this.errorMessage = 'Failed to delete occasion';
                }
            });
        }
    }

    getOccasionIcon(type: OccasionType): string {
        switch (type) {
            case OccasionType.BIRTHDAY:
                return '🎂';
            case OccasionType.HOLIDAY:
                return '🎄';
            case OccasionType.CELEBRATION:
                return '🎉';
            default:
                return '🎁';
        }
    }

    formatDate(dateString: string | undefined): string {
        if (!dateString) {
            return '';
        }
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    }
}

