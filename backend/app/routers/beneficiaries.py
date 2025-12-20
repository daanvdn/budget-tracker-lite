from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Beneficiary
from app.schemas import BeneficiaryCreate, BeneficiaryUpdate, BeneficiaryResponse

router = APIRouter(prefix="/beneficiaries", tags=["beneficiaries"])


@router.get("/", response_model=list[BeneficiaryResponse])
def get_beneficiaries(db: Session = Depends(get_db)):
    return db.query(Beneficiary).all()


@router.get("/{beneficiary_id}", response_model=BeneficiaryResponse)
def get_beneficiary(beneficiary_id: int, db: Session = Depends(get_db)):
    beneficiary = db.query(Beneficiary).filter(Beneficiary.id == beneficiary_id).first()
    if not beneficiary:
        raise HTTPException(status_code=404, detail="Beneficiary not found")
    return beneficiary


@router.post("/", response_model=BeneficiaryResponse, status_code=201)
def create_beneficiary(beneficiary: BeneficiaryCreate, db: Session = Depends(get_db)):
    # Check if name already exists
    existing = db.query(Beneficiary).filter(Beneficiary.name == beneficiary.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Beneficiary name already exists")
    
    db_beneficiary = Beneficiary(**beneficiary.model_dump())
    db.add(db_beneficiary)
    db.commit()
    db.refresh(db_beneficiary)
    return db_beneficiary


@router.put("/{beneficiary_id}", response_model=BeneficiaryResponse)
def update_beneficiary(beneficiary_id: int, beneficiary: BeneficiaryUpdate, db: Session = Depends(get_db)):
    db_beneficiary = db.query(Beneficiary).filter(Beneficiary.id == beneficiary_id).first()
    if not db_beneficiary:
        raise HTTPException(status_code=404, detail="Beneficiary not found")
    
    for field, value in beneficiary.model_dump(exclude_unset=True).items():
        setattr(db_beneficiary, field, value)
    
    db.commit()
    db.refresh(db_beneficiary)
    return db_beneficiary


@router.delete("/{beneficiary_id}", status_code=204)
def delete_beneficiary(beneficiary_id: int, db: Session = Depends(get_db)):
    db_beneficiary = db.query(Beneficiary).filter(Beneficiary.id == beneficiary_id).first()
    if not db_beneficiary:
        raise HTTPException(status_code=404, detail="Beneficiary not found")
    
    db.delete(db_beneficiary)
    db.commit()
    return None
