import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {GiftOccasionService} from '../../core/services/gift-occasion.service';
import {BeneficiaryService} from '../../core/services/beneficiary.service';
import {AuthService} from '../../core/services/auth.service';
import {Beneficiary, GiftOccasionWithSummary, OccasionType} from '../../shared/models/models';
import {GiftOccasionFormComponent} from './gift-occasion-form.component';
import {TranslateModule} from '@ngx-translate/core';

interface MonthGroup {
    monthKey: string;
    monthLabel: string;
    occasions: GiftOccasionWithSummary[];
}

@Component({
    selector: 'app-gift-occasions-list',
    standalone: true,
    imports: [CommonModule, GiftOccasionFormComponent, TranslateModule],
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

    // Pagination
    currentPage = 0;
    pageSize = 20;
    hasMorePages = true;

    // Collapsible months
    collapsedMonths: Set<string> = new Set();

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
        const skip = this.currentPage * this.pageSize;
        this.giftOccasionService.getOccasions(skip, this.pageSize + 1).subscribe({
            next: (occasions) => {
                // Check if there are more pages by fetching one extra
                this.hasMorePages = occasions.length > this.pageSize;
                this.occasions = occasions.slice(0, this.pageSize);
                this.loading = false;
            },
            error: (error) => {
                console.error('Failed to load occasions', error);
                this.errorMessage = 'Failed to load gift occasions';
                this.loading = false;
            }
        });
    }

    // Pagination methods
    goToFirstPage(): void {
        this.currentPage = 0;
        this.loadOccasions();
    }

    goToPreviousPage(): void {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.loadOccasions();
        }
    }

    goToNextPage(): void {
        if (this.hasMorePages) {
            this.currentPage++;
            this.loadOccasions();
        }
    }

    // Collapsible months methods
    toggleMonthCollapse(monthKey: string): void {
        if (this.collapsedMonths.has(monthKey)) {
            this.collapsedMonths.delete(monthKey);
        } else {
            this.collapsedMonths.add(monthKey);
        }
    }

    isMonthCollapsed(monthKey: string): boolean {
        return this.collapsedMonths.has(monthKey);
    }

    // Group occasions by month
    get occasionsGroupedByMonth(): MonthGroup[] {
        const grouped = new Map<string, GiftOccasionWithSummary[]>();

        for (const occasion of this.occasions) {
            // Use occasion_date if available, otherwise use created_at or current date
            const dateStr = occasion.occasion_date || occasion.created_at;
            const date = dateStr ? new Date(dateStr) : new Date();
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!grouped.has(monthKey)) {
                grouped.set(monthKey, []);
            }
            grouped.get(monthKey)!.push(occasion);
        }

        // Sort by month key descending (newest first)
        const sortedKeys = Array.from(grouped.keys()).sort((a, b) => b.localeCompare(a));

        return sortedKeys.map(monthKey => {
            const [year, month] = monthKey.split('-');
            const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            const monthLabel = monthDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

            return {
                monthKey,
                monthLabel,
                occasions: grouped.get(monthKey)!
            };
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

    onBeneficiaryCreated(beneficiary: Beneficiary): void {
        // Add the new beneficiary to our list if it's not already there
        if (!this.beneficiaries.find(b => b.id === beneficiary.id)) {
            this.beneficiaries = [...this.beneficiaries, beneficiary];
        }
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

