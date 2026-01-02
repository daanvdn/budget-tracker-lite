export enum TransactionType {
    EXPENSE = 'expense',
    INCOME = 'income'
}

export enum CategoryType {
    EXPENSE = 'expense',
    INCOME = 'income',
    BOTH = 'both'
}

export interface User {
    id: number;
    name: string;
    created_at: string;
}

export interface Category {
    id: number;
    name: string;
    type: CategoryType;
}

export interface Beneficiary {
    id: number;
    name: string;
}

export interface Transaction {
    id: number;
    type: TransactionType;
    amount: number;
    description: string;
    transaction_date: string;
    image_path?: string;
    notes?: string;
    tags?: string[];
    category_id: number;
    beneficiary_id: number;
    created_by_user_id: number;
    created_at: string;
    category: Category;
    beneficiary: Beneficiary;
    created_by_user: User;
}

export interface TransactionCreate {
    type: TransactionType;
    amount: number;
    description: string;
    transaction_date: string;
    category_id: number;
    beneficiary_id: number;
    created_by_user_id: number;
    image_path?: string;
    notes?: string;
    tags?: string[];
}

export interface AggregationSummary {
    total_income: number;
    total_expenses: number;
    net_balance: number;
    transaction_count: number;
}

// ============== Gift Tracking Models ==============

export enum OccasionType {
    BIRTHDAY = 'birthday',
    HOLIDAY = 'holiday',
    CELEBRATION = 'celebration',
    OTHER = 'other'
}

export enum GiftDirection {
    GIVEN = 'given',
    RECEIVED = 'received'
}

export interface BeneficiaryRef {
    id: number;
    name: string;
}

export interface UserRef {
    id: number;
    name: string;
}

export interface TransactionRef {
    id: number;
    amount: number;
    description: string;
    transaction_date: string;
}

export interface GiftOccasion {
    id: number;
    name: string;
    occasion_type: OccasionType;
    occasion_date?: string;
    person_id?: number;
    notes?: string;
    is_pool_account: boolean;
    created_by_user_id: number;
    created_at: string;
    person?: BeneficiaryRef;
    created_by_user?: UserRef;
}

export interface GiftOccasionCreate {
    name: string;
    occasion_type: OccasionType;
    occasion_date?: string;
    person_id?: number;
    notes?: string;
    is_pool_account: boolean;
    created_by_user_id: number;
}

export interface GiftOccasionUpdate {
    name?: string;
    occasion_type?: OccasionType;
    occasion_date?: string;
    person_id?: number;
    notes?: string;
    is_pool_account?: boolean;
}

export interface GiftEntry {
    id: number;
    occasion_id: number;
    direction: GiftDirection;
    person_id: number;
    amount: number;
    gift_date: string;
    description?: string;
    notes?: string;
    transaction_id?: number;
    created_by_user_id: number;
    created_at: string;
    person?: BeneficiaryRef;
    transaction?: TransactionRef;
    created_by_user?: UserRef;
}

export interface GiftEntryCreate {
    direction: GiftDirection;
    person_id: number;
    amount: number;
    gift_date: string;
    description?: string;
    notes?: string;
    transaction_id?: number;
    created_by_user_id: number;
}

export interface GiftEntryUpdate {
    direction?: GiftDirection;
    person_id?: number;
    amount?: number;
    gift_date?: string;
    description?: string;
    notes?: string;
    transaction_id?: number;
}

export interface GiftPurchase {
    id: number;
    occasion_id: number;
    amount: number;
    purchase_date: string;
    description: string;
    notes?: string;
    transaction_id?: number;
    created_by_user_id: number;
    created_at: string;
    transaction?: TransactionRef;
    created_by_user?: UserRef;
}

export interface GiftPurchaseCreate {
    amount: number;
    purchase_date: string;
    description: string;
    notes?: string;
    transaction_id?: number;
    created_by_user_id: number;
}

export interface GiftPurchaseUpdate {
    amount?: number;
    purchase_date?: string;
    description?: string;
    notes?: string;
    transaction_id?: number;
}

export interface GiftOccasionSummary {
    occasion_id: number;
    total_received: number;
    total_given: number;
    total_purchases: number;
    balance: number;
    entry_count: number;
    purchase_count: number;
}

export interface GiftOccasionWithSummary extends GiftOccasion {
    summary: GiftOccasionSummary;
}

export interface GiftOccasionWithEntries extends GiftOccasion {
    gift_entries: GiftEntry[];
    gift_purchases: GiftPurchase[];
}

