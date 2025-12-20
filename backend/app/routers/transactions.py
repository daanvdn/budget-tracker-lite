from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Transaction
from app.schemas import TransactionCreate, TransactionUpdate, TransactionResponse
from datetime import date
from app.models.transaction import TransactionType
from typing import Optional

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("/", response_model=list[TransactionResponse])
def get_transactions(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    beneficiary_id: Optional[int] = None,
    category_id: Optional[int] = None,
    type: Optional[TransactionType] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Transaction)
    
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    if beneficiary_id:
        query = query.filter(Transaction.beneficiary_id == beneficiary_id)
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    if type:
        query = query.filter(Transaction.type == type)
    
    return query.all()


@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(transaction_id: int, db: Session = Depends(get_db)):
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction


@router.post("/", response_model=TransactionResponse, status_code=201)
def create_transaction(transaction: TransactionCreate, db: Session = Depends(get_db)):
    # Validate amount
    if transaction.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than 0")
    
    db_transaction = Transaction(**transaction.model_dump())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


@router.put("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(transaction_id: int, transaction: TransactionUpdate, db: Session = Depends(get_db)):
    db_transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    for field, value in transaction.model_dump(exclude_unset=True).items():
        setattr(db_transaction, field, value)
    
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


@router.delete("/{transaction_id}", status_code=204)
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    db_transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    db.delete(db_transaction)
    db.commit()
    return None


@router.post("/{transaction_id}/upload-image")
def upload_image(transaction_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    db_transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # In a real implementation, you would save the file to storage
    # For now, we'll just save the filename
    db_transaction.image_path = f"/uploads/{file.filename}"
    db.commit()
    
    return {"message": "Image uploaded successfully", "path": db_transaction.image_path}
