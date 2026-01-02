from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..auth.dependencies import get_current_active_user
from ..database import get_db
from ..models import GiftEntry as GiftEntryModel
from ..models import GiftOccasion as GiftOccasionModel
from ..models import GiftPurchase as GiftPurchaseModel
from ..models import User
from ..schemas import (
    GiftEntry,
    GiftEntryCreate,
    GiftEntryUpdate,
    GiftOccasion,
    GiftOccasionCreate,
    GiftOccasionSummary,
    GiftOccasionUpdate,
    GiftOccasionWithEntries,
    GiftOccasionWithSummary,
    GiftPurchase,
    GiftPurchaseCreate,
    GiftPurchaseUpdate,
)

router = APIRouter(prefix="/gift-occasions", tags=["gift-occasions"])


# ============== Helper Functions ==============


def calculate_occasion_summary(occasion: GiftOccasionModel) -> GiftOccasionSummary:
    """Calculate summary statistics for a gift occasion."""
    total_received = sum(entry.amount for entry in occasion.gift_entries if entry.direction.value == "received")
    total_given = sum(entry.amount for entry in occasion.gift_entries if entry.direction.value == "given")
    total_purchases = sum(purchase.amount for purchase in occasion.gift_purchases)

    return GiftOccasionSummary(
        occasion_id=occasion.id,
        total_received=total_received,
        total_given=total_given,
        total_purchases=total_purchases,
        balance=total_received - total_purchases,  # For pool accounts
        entry_count=len(occasion.gift_entries),
        purchase_count=len(occasion.gift_purchases),
    )


async def get_occasion_with_relations(db: AsyncSession, occasion_id: int) -> Optional[GiftOccasionModel]:
    """Load a gift occasion with all its relationships."""
    result = await db.execute(
        select(GiftOccasionModel)
        .where(GiftOccasionModel.id == occasion_id)
        .options(
            selectinload(GiftOccasionModel.person),
            selectinload(GiftOccasionModel.created_by_user),
            selectinload(GiftOccasionModel.gift_entries).selectinload(GiftEntryModel.person),
            selectinload(GiftOccasionModel.gift_entries).selectinload(GiftEntryModel.transaction),
            selectinload(GiftOccasionModel.gift_entries).selectinload(GiftEntryModel.created_by_user),
            selectinload(GiftOccasionModel.gift_purchases).selectinload(GiftPurchaseModel.transaction),
            selectinload(GiftOccasionModel.gift_purchases).selectinload(GiftPurchaseModel.created_by_user),
        )
    )
    return result.scalar_one_or_none()


# ============== Gift Occasion Endpoints ==============


@router.get("", response_model=List[GiftOccasionWithSummary])
async def list_gift_occasions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List all gift occasions with summary statistics."""
    result = await db.execute(
        select(GiftOccasionModel)
        .options(
            selectinload(GiftOccasionModel.person),
            selectinload(GiftOccasionModel.created_by_user),
            selectinload(GiftOccasionModel.gift_entries),
            selectinload(GiftOccasionModel.gift_purchases),
        )
        .order_by(GiftOccasionModel.occasion_date.desc().nullslast(), GiftOccasionModel.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    occasions = result.scalars().all()

    # Convert to response with summaries
    return [
        GiftOccasionWithSummary(
            id=occ.id,
            name=occ.name,
            occasion_type=occ.occasion_type,
            occasion_date=occ.occasion_date,
            person_id=occ.person_id,
            notes=occ.notes,
            is_pool_account=occ.is_pool_account,
            created_by_user_id=occ.created_by_user_id,
            created_at=occ.created_at,
            person=occ.person,
            created_by_user=occ.created_by_user,
            summary=calculate_occasion_summary(occ),
        )
        for occ in occasions
    ]


@router.post("", response_model=GiftOccasion, status_code=status.HTTP_201_CREATED)
async def create_gift_occasion(
    occasion: GiftOccasionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a new gift occasion."""
    db_occasion = GiftOccasionModel(
        name=occasion.name,
        occasion_type=occasion.occasion_type,
        occasion_date=occasion.occasion_date,
        person_id=occasion.person_id,
        notes=occasion.notes,
        is_pool_account=occasion.is_pool_account,
        created_by_user_id=occasion.created_by_user_id,
        created_at=datetime.utcnow(),
    )
    db.add(db_occasion)
    await db.commit()
    await db.refresh(db_occasion)

    # Load relationships
    result = await db.execute(
        select(GiftOccasionModel)
        .where(GiftOccasionModel.id == db_occasion.id)
        .options(
            selectinload(GiftOccasionModel.person),
            selectinload(GiftOccasionModel.created_by_user),
        )
    )
    return result.scalar_one()


@router.get("/{occasion_id}", response_model=GiftOccasionWithEntries)
async def get_gift_occasion(
    occasion_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a gift occasion with all entries and purchases."""
    occasion = await get_occasion_with_relations(db, occasion_id)
    if not occasion:
        raise HTTPException(status_code=404, detail="Gift occasion not found")
    return occasion


@router.get("/{occasion_id}/summary", response_model=GiftOccasionSummary)
async def get_gift_occasion_summary(
    occasion_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get summary statistics for a gift occasion."""
    occasion = await get_occasion_with_relations(db, occasion_id)
    if not occasion:
        raise HTTPException(status_code=404, detail="Gift occasion not found")
    return calculate_occasion_summary(occasion)


@router.put("/{occasion_id}", response_model=GiftOccasion)
async def update_gift_occasion(
    occasion_id: int,
    occasion_update: GiftOccasionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update a gift occasion."""
    result = await db.execute(select(GiftOccasionModel).where(GiftOccasionModel.id == occasion_id))
    db_occasion = result.scalar_one_or_none()
    if not db_occasion:
        raise HTTPException(status_code=404, detail="Gift occasion not found")

    # Update only provided fields
    for key, value in occasion_update.model_dump(exclude_unset=True).items():
        setattr(db_occasion, key, value)

    await db.commit()
    await db.refresh(db_occasion)

    # Load relationships
    result = await db.execute(
        select(GiftOccasionModel)
        .where(GiftOccasionModel.id == occasion_id)
        .options(
            selectinload(GiftOccasionModel.person),
            selectinload(GiftOccasionModel.created_by_user),
        )
    )
    return result.scalar_one()


@router.delete("/{occasion_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_gift_occasion(
    occasion_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete a gift occasion and all its entries/purchases."""
    result = await db.execute(select(GiftOccasionModel).where(GiftOccasionModel.id == occasion_id))
    db_occasion = result.scalar_one_or_none()
    if not db_occasion:
        raise HTTPException(status_code=404, detail="Gift occasion not found")

    await db.delete(db_occasion)
    await db.commit()


# ============== Gift Entry Endpoints ==============


@router.get("/{occasion_id}/entries", response_model=List[GiftEntry])
async def list_gift_entries(
    occasion_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List all gift entries for an occasion."""
    # Verify occasion exists
    occ_result = await db.execute(select(GiftOccasionModel).where(GiftOccasionModel.id == occasion_id))
    if not occ_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Gift occasion not found")

    result = await db.execute(
        select(GiftEntryModel)
        .where(GiftEntryModel.occasion_id == occasion_id)
        .options(
            selectinload(GiftEntryModel.person),
            selectinload(GiftEntryModel.transaction),
            selectinload(GiftEntryModel.created_by_user),
        )
        .order_by(GiftEntryModel.gift_date.desc())
    )
    return result.scalars().all()


@router.post("/{occasion_id}/entries", response_model=GiftEntry, status_code=status.HTTP_201_CREATED)
async def create_gift_entry(
    occasion_id: int,
    entry: GiftEntryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a new gift entry for an occasion."""
    # Verify occasion exists
    occ_result = await db.execute(select(GiftOccasionModel).where(GiftOccasionModel.id == occasion_id))
    if not occ_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Gift occasion not found")

    db_entry = GiftEntryModel(
        occasion_id=occasion_id,
        direction=entry.direction,
        person_id=entry.person_id,
        amount=entry.amount,
        gift_date=entry.gift_date,
        description=entry.description,
        notes=entry.notes,
        transaction_id=entry.transaction_id,
        created_by_user_id=entry.created_by_user_id,
        created_at=datetime.utcnow(),
    )
    db.add(db_entry)
    await db.commit()
    await db.refresh(db_entry)

    # Load relationships
    result = await db.execute(
        select(GiftEntryModel)
        .where(GiftEntryModel.id == db_entry.id)
        .options(
            selectinload(GiftEntryModel.person),
            selectinload(GiftEntryModel.transaction),
            selectinload(GiftEntryModel.created_by_user),
        )
    )
    return result.scalar_one()


@router.put("/entries/{entry_id}", response_model=GiftEntry)
async def update_gift_entry(
    entry_id: int,
    entry_update: GiftEntryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update a gift entry."""
    result = await db.execute(select(GiftEntryModel).where(GiftEntryModel.id == entry_id))
    db_entry = result.scalar_one_or_none()
    if not db_entry:
        raise HTTPException(status_code=404, detail="Gift entry not found")

    # Update only provided fields
    for key, value in entry_update.model_dump(exclude_unset=True).items():
        setattr(db_entry, key, value)

    await db.commit()
    await db.refresh(db_entry)

    # Load relationships
    result = await db.execute(
        select(GiftEntryModel)
        .where(GiftEntryModel.id == entry_id)
        .options(
            selectinload(GiftEntryModel.person),
            selectinload(GiftEntryModel.transaction),
            selectinload(GiftEntryModel.created_by_user),
        )
    )
    return result.scalar_one()


@router.delete("/entries/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_gift_entry(
    entry_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete a gift entry."""
    result = await db.execute(select(GiftEntryModel).where(GiftEntryModel.id == entry_id))
    db_entry = result.scalar_one_or_none()
    if not db_entry:
        raise HTTPException(status_code=404, detail="Gift entry not found")

    await db.delete(db_entry)
    await db.commit()


# ============== Gift Purchase Endpoints ==============


@router.get("/{occasion_id}/purchases", response_model=List[GiftPurchase])
async def list_gift_purchases(
    occasion_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List all gift purchases for an occasion."""
    # Verify occasion exists
    occ_result = await db.execute(select(GiftOccasionModel).where(GiftOccasionModel.id == occasion_id))
    if not occ_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Gift occasion not found")

    result = await db.execute(
        select(GiftPurchaseModel)
        .where(GiftPurchaseModel.occasion_id == occasion_id)
        .options(
            selectinload(GiftPurchaseModel.transaction),
            selectinload(GiftPurchaseModel.created_by_user),
        )
        .order_by(GiftPurchaseModel.purchase_date.desc())
    )
    return result.scalars().all()


@router.post("/{occasion_id}/purchases", response_model=GiftPurchase, status_code=status.HTTP_201_CREATED)
async def create_gift_purchase(
    occasion_id: int,
    purchase: GiftPurchaseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a new gift purchase for an occasion."""
    # Verify occasion exists
    occ_result = await db.execute(select(GiftOccasionModel).where(GiftOccasionModel.id == occasion_id))
    if not occ_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Gift occasion not found")

    db_purchase = GiftPurchaseModel(
        occasion_id=occasion_id,
        amount=purchase.amount,
        purchase_date=purchase.purchase_date,
        description=purchase.description,
        notes=purchase.notes,
        transaction_id=purchase.transaction_id,
        created_by_user_id=purchase.created_by_user_id,
        created_at=datetime.utcnow(),
    )
    db.add(db_purchase)
    await db.commit()
    await db.refresh(db_purchase)

    # Load relationships
    result = await db.execute(
        select(GiftPurchaseModel)
        .where(GiftPurchaseModel.id == db_purchase.id)
        .options(
            selectinload(GiftPurchaseModel.transaction),
            selectinload(GiftPurchaseModel.created_by_user),
        )
    )
    return result.scalar_one()


@router.put("/purchases/{purchase_id}", response_model=GiftPurchase)
async def update_gift_purchase(
    purchase_id: int,
    purchase_update: GiftPurchaseUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update a gift purchase."""
    result = await db.execute(select(GiftPurchaseModel).where(GiftPurchaseModel.id == purchase_id))
    db_purchase = result.scalar_one_or_none()
    if not db_purchase:
        raise HTTPException(status_code=404, detail="Gift purchase not found")

    # Update only provided fields
    for key, value in purchase_update.model_dump(exclude_unset=True).items():
        setattr(db_purchase, key, value)

    await db.commit()
    await db.refresh(db_purchase)

    # Load relationships
    result = await db.execute(
        select(GiftPurchaseModel)
        .where(GiftPurchaseModel.id == purchase_id)
        .options(
            selectinload(GiftPurchaseModel.transaction),
            selectinload(GiftPurchaseModel.created_by_user),
        )
    )
    return result.scalar_one()


@router.delete("/purchases/{purchase_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_gift_purchase(
    purchase_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete a gift purchase."""
    result = await db.execute(select(GiftPurchaseModel).where(GiftPurchaseModel.id == purchase_id))
    db_purchase = result.scalar_one_or_none()
    if not db_purchase:
        raise HTTPException(status_code=404, detail="Gift purchase not found")

    await db.delete(db_purchase)
    await db.commit()
