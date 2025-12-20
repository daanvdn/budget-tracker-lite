from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from ..database import get_db
from ..models import Beneficiary as BeneficiaryModel
from ..schemas import Beneficiary, BeneficiaryCreate, BeneficiaryUpdate

router = APIRouter(prefix="/beneficiaries", tags=["beneficiaries"])


@router.get("", response_model=List[Beneficiary])
async def list_beneficiaries(db: AsyncSession = Depends(get_db)):
    """List all beneficiaries"""
    result = await db.execute(select(BeneficiaryModel).order_by(BeneficiaryModel.name))
    beneficiaries = result.scalars().all()
    return beneficiaries


@router.post("", response_model=Beneficiary, status_code=status.HTTP_201_CREATED)
async def create_beneficiary(beneficiary: BeneficiaryCreate, db: AsyncSession = Depends(get_db)):
    """Create a new beneficiary"""
    db_beneficiary = BeneficiaryModel(**beneficiary.model_dump())
    db.add(db_beneficiary)
    await db.commit()
    await db.refresh(db_beneficiary)
    return db_beneficiary


@router.get("/{beneficiary_id}", response_model=Beneficiary)
async def get_beneficiary(beneficiary_id: int, db: AsyncSession = Depends(get_db)):
    """Get a beneficiary by ID"""
    result = await db.execute(select(BeneficiaryModel).where(BeneficiaryModel.id == beneficiary_id))
    beneficiary = result.scalar_one_or_none()
    if not beneficiary:
        raise HTTPException(status_code=404, detail="Beneficiary not found")
    return beneficiary


@router.put("/{beneficiary_id}", response_model=Beneficiary)
async def update_beneficiary(beneficiary_id: int, beneficiary: BeneficiaryUpdate, db: AsyncSession = Depends(get_db)):
    """Update a beneficiary"""
    result = await db.execute(select(BeneficiaryModel).where(BeneficiaryModel.id == beneficiary_id))
    db_beneficiary = result.scalar_one_or_none()
    if not db_beneficiary:
        raise HTTPException(status_code=404, detail="Beneficiary not found")
    
    for key, value in beneficiary.model_dump().items():
        setattr(db_beneficiary, key, value)
    
    await db.commit()
    await db.refresh(db_beneficiary)
    return db_beneficiary


@router.delete("/{beneficiary_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_beneficiary(beneficiary_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a beneficiary"""
    result = await db.execute(select(BeneficiaryModel).where(BeneficiaryModel.id == beneficiary_id))
    db_beneficiary = result.scalar_one_or_none()
    if not db_beneficiary:
        raise HTTPException(status_code=404, detail="Beneficiary not found")
    
    await db.delete(db_beneficiary)
    await db.commit()
