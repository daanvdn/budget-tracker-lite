import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {GiftOccasionService} from '../../core/services/gift-occasion.service';
import {BeneficiaryService} from '../../core/services/beneficiary.service';
import {Transaction, TransactionService} from '../../core/services/transaction.service';
import {AuthService} from '../../core/services/auth.service';
import {
  Beneficiary,
  GiftDirection,
  GiftEntry,
  GiftOccasionWithEntries,
  GiftPurchase,
  OccasionType
} from '../../shared/models/models';
import {GiftEntryFormComponent} from './gift-entry-form.component';
import {GiftPurchaseFormComponent} from './gift-purchase-form.component';
import {TranslateModule} from '@ngx-translate/core';

@Component({
    selector: 'app-gift-occasion-detail',
    standalone: true,
    imports: [CommonModule, GiftEntryFormComponent, GiftPurchaseFormComponent, TranslateModule],
    templateUrl: './gift-occasion-detail.component.html',
    styleUrls: ['./gift-occasion-detail.component.css']
})
export class GiftOccasionDetailComponent implements OnInit {
    occasion: GiftOccasionWithEntries | null = null;
    beneficiaries: Beneficiary[] = [];
    transactions: Transaction[] = [];
    currentUserId: number | null = null;
    loading = true;
    errorMessage = '';

    // Expose enum to template
    GiftDirection = GiftDirection;

    // Dialog states
    showEntryForm = false;
    showPurchaseForm = false;
    editingEntry: GiftEntry | null = null;
    editingPurchase: GiftPurchase | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private giftOccasionService: GiftOccasionService,
        private beneficiaryService: BeneficiaryService,
        private transactionService: TransactionService,
        private authService: AuthService
    ) {
    }

    get totalReceived(): number {
        if (!this.occasion) {
            return 0;
        }
        return this.occasion.gift_entries
            .filter(e => e.direction === GiftDirection.RECEIVED)
            .reduce((sum, e) => sum + e.amount, 0);
    }

    get totalGiven(): number {
        if (!this.occasion) {
            return 0;
        }
        return this.occasion.gift_entries
            .filter(e => e.direction === GiftDirection.GIVEN)
            .reduce((sum, e) => sum + e.amount, 0);
    }

    get totalPurchases(): number {
        if (!this.occasion) {
            return 0;
        }
        return this.occasion.gift_purchases.reduce((sum, p) => sum + p.amount, 0);
    }

    get balance(): number {
        return this.totalReceived - this.totalPurchases;
    }

    get receivedEntries(): GiftEntry[] {
        if (!this.occasion) {
            return [];
        }
        return this.occasion.gift_entries
            .filter(e => e.direction === GiftDirection.RECEIVED)
            .sort((a, b) => new Date(b.gift_date).getTime() - new Date(a.gift_date).getTime());
    }

    get givenEntries(): GiftEntry[] {
        if (!this.occasion) {
            return [];
        }
        return this.occasion.gift_entries
            .filter(e => e.direction === GiftDirection.GIVEN)
            .sort((a, b) => new Date(b.gift_date).getTime() - new Date(a.gift_date).getTime());
    }

    // ============== Summary Calculations ==============

    get sortedPurchases(): GiftPurchase[] {
        if (!this.occasion) {
            return [];
        }
        return [...this.occasion.gift_purchases]
            .sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime());
    }

    get defaultEntryDirection(): GiftDirection {
        return (this as any).defaultDirection || GiftDirection.RECEIVED;
    }

    ngOnInit(): void {
        this.loadCurrentUser();
        this.loadBeneficiaries();
        this.loadTransactions();

        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadOccasion(parseInt(id, 10));
        }
    }

    loadCurrentUser(): void {
        this.authService.currentUser$.subscribe(user => {
            this.currentUserId = user?.id || null;
        });
    }

    loadOccasion(id: number): void {
        this.loading = true;
        this.giftOccasionService.getOccasion(id).subscribe({
            next: (occasion) => {
                this.occasion = occasion;
                this.loading = false;
            },
            error: (error) => {
                console.error('Failed to load occasion', error);
                this.errorMessage = 'Failed to load gift occasion';
                this.loading = false;
            }
        });
    }

    loadBeneficiaries(): void {
        this.beneficiaryService.getBeneficiaries().subscribe({
            next: (beneficiaries) => {
                this.beneficiaries = beneficiaries;
            }
        });
    }

    loadTransactions(): void {
        this.transactionService.getTransactions(0, 500).subscribe({
            next: (transactions) => {
                this.transactions = transactions;
            }
        });
    }

    // ============== Entry Management ==============

    goBack(): void {
        this.router.navigate(['/gifts']);
    }

    openAddEntry(direction: GiftDirection): void {
        this.editingEntry = null;
        this.showEntryForm = true;
        // Pass direction via a temporary property
        (this as any).defaultDirection = direction;
    }

    openEditEntry(entry: GiftEntry): void {
        this.editingEntry = entry;
        this.showEntryForm = true;
    }

    closeEntryForm(): void {
        this.showEntryForm = false;
        this.editingEntry = null;
    }

    onEntryCreated(entry: GiftEntry): void {
        if (this.occasion) {
            this.occasion.gift_entries.push(entry);
        }
        this.closeEntryForm();
    }

    onEntryUpdated(entry: GiftEntry): void {
        if (this.occasion) {
            const index = this.occasion.gift_entries.findIndex(e => e.id === entry.id);
            if (index !== -1) {
                this.occasion.gift_entries[index] = entry;
            }
        }
        this.closeEntryForm();
    }

    onBeneficiaryCreated(beneficiary: Beneficiary): void {
        // Add the new beneficiary to our list if it's not already there
        if (!this.beneficiaries.find(b => b.id === beneficiary.id)) {
            this.beneficiaries = [...this.beneficiaries, beneficiary];
        }
    }

    // ============== Purchase Management ==============

    deleteEntry(entry: GiftEntry, event: Event): void {
        event.stopPropagation();
        if (confirm('Are you sure you want to delete this entry?')) {
            this.giftOccasionService.deleteEntry(entry.id).subscribe({
                next: () => {
                    if (this.occasion) {
                        this.occasion.gift_entries = this.occasion.gift_entries.filter(e => e.id !== entry.id);
                    }
                },
                error: (error) => {
                    console.error('Failed to delete entry', error);
                    this.errorMessage = 'Failed to delete entry';
                }
            });
        }
    }

    openAddPurchase(): void {
        this.editingPurchase = null;
        this.showPurchaseForm = true;
    }

    openEditPurchase(purchase: GiftPurchase): void {
        this.editingPurchase = purchase;
        this.showPurchaseForm = true;
    }

    closePurchaseForm(): void {
        this.showPurchaseForm = false;
        this.editingPurchase = null;
    }

    onPurchaseCreated(purchase: GiftPurchase): void {
        if (this.occasion) {
            this.occasion.gift_purchases.push(purchase);
        }
        this.closePurchaseForm();
    }

    onPurchaseUpdated(purchase: GiftPurchase): void {
        if (this.occasion) {
            const index = this.occasion.gift_purchases.findIndex(p => p.id === purchase.id);
            if (index !== -1) {
                this.occasion.gift_purchases[index] = purchase;
            }
        }
        this.closePurchaseForm();
    }

    // ============== Helpers ==============

    deletePurchase(purchase: GiftPurchase, event: Event): void {
        event.stopPropagation();
        if (confirm('Are you sure you want to delete this purchase?')) {
            this.giftOccasionService.deletePurchase(purchase.id).subscribe({
                next: () => {
                    if (this.occasion) {
                        this.occasion.gift_purchases = this.occasion.gift_purchases.filter(p => p.id !== purchase.id);
                    }
                },
                error: (error) => {
                    console.error('Failed to delete purchase', error);
                    this.errorMessage = 'Failed to delete purchase';
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

