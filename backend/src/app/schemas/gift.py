from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

# Import enums from parent module (they're defined in __init__.py)
from . import GiftDirection, OccasionType

# ============== Gift Occasion Schemas ==============


class GiftOccasionBase(BaseModel):
    """Base gift occasion schema"""

    name: str = Field(..., min_length=1, max_length=200)
    occasion_type: OccasionType = OccasionType.OTHER
    occasion_date: Optional[date] = None
    person_id: Optional[int] = None
    notes: Optional[str] = None
    is_pool_account: bool = False


class GiftOccasionCreate(GiftOccasionBase):
    """Schema for creating a gift occasion"""

    created_by_user_id: int


class GiftOccasionUpdate(BaseModel):
    """Schema for updating a gift occasion"""

    name: Optional[str] = Field(None, min_length=1, max_length=200)
    occasion_type: Optional[OccasionType] = None
    occasion_date: Optional[date] = None
    person_id: Optional[int] = None
    notes: Optional[str] = None
    is_pool_account: Optional[bool] = None


# Forward references for nested schemas
class BeneficiaryRef(BaseModel):
    """Minimal beneficiary reference"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class UserRef(BaseModel):
    """Minimal user reference"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class TransactionRef(BaseModel):
    """Minimal transaction reference"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    amount: float
    description: str
    transaction_date: datetime


# ============== Gift Entry Schemas ==============


class GiftEntryBase(BaseModel):
    """Base gift entry schema"""

    direction: GiftDirection
    person_id: int
    amount: float = Field(..., gt=0)
    gift_date: date
    description: Optional[str] = Field(None, max_length=200)
    notes: Optional[str] = None
    transaction_id: Optional[int] = None


class GiftEntryCreate(GiftEntryBase):
    """Schema for creating a gift entry"""

    created_by_user_id: int


class GiftEntryUpdate(BaseModel):
    """Schema for updating a gift entry"""

    direction: Optional[GiftDirection] = None
    person_id: Optional[int] = None
    amount: Optional[float] = Field(None, gt=0)
    gift_date: Optional[date] = None
    description: Optional[str] = Field(None, max_length=200)
    notes: Optional[str] = None
    transaction_id: Optional[int] = None


class GiftEntry(GiftEntryBase):
    """Schema for gift entry response"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    occasion_id: int
    created_by_user_id: int
    created_at: datetime
    person: Optional[BeneficiaryRef] = None
    transaction: Optional[TransactionRef] = None
    created_by_user: Optional[UserRef] = None


# ============== Gift Purchase Schemas ==============


class GiftPurchaseBase(BaseModel):
    """Base gift purchase schema"""

    amount: float = Field(..., gt=0)
    purchase_date: date
    description: str = Field(..., min_length=1, max_length=200)
    notes: Optional[str] = None
    transaction_id: Optional[int] = None


class GiftPurchaseCreate(GiftPurchaseBase):
    """Schema for creating a gift purchase"""

    created_by_user_id: int


class GiftPurchaseUpdate(BaseModel):
    """Schema for updating a gift purchase"""

    amount: Optional[float] = Field(None, gt=0)
    purchase_date: Optional[date] = None
    description: Optional[str] = Field(None, min_length=1, max_length=200)
    notes: Optional[str] = None
    transaction_id: Optional[int] = None


class GiftPurchase(GiftPurchaseBase):
    """Schema for gift purchase response"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    occasion_id: int
    created_by_user_id: int
    created_at: datetime
    transaction: Optional[TransactionRef] = None
    created_by_user: Optional[UserRef] = None


# ============== Gift Occasion Response Schemas ==============


class GiftOccasion(GiftOccasionBase):
    """Schema for gift occasion response"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    created_by_user_id: int
    created_at: datetime
    person: Optional[BeneficiaryRef] = None
    created_by_user: Optional[UserRef] = None


class GiftOccasionWithEntries(GiftOccasion):
    """Schema for gift occasion with entries and purchases"""

    gift_entries: List[GiftEntry] = []
    gift_purchases: List[GiftPurchase] = []


# ============== Summary Schemas ==============


class GiftOccasionSummary(BaseModel):
    """Summary statistics for a gift occasion"""

    occasion_id: int
    total_received: float = 0.0
    total_given: float = 0.0
    total_purchases: float = 0.0
    balance: float = 0.0  # For pool accounts: received - purchases
    entry_count: int = 0
    purchase_count: int = 0


class GiftOccasionWithSummary(GiftOccasion):
    """Gift occasion with summary statistics"""

    summary: GiftOccasionSummary
