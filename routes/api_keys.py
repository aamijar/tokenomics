from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, SellerApiKey, TokenType, UserType, TransactionType
from schemas import SellerApiKeyCreate, SellerApiKeyResponse
from auth import get_current_user
from crypto_utils import encrypt_api_key
from services.transaction_service import TransactionService

router = APIRouter(prefix="/api/seller/keys", tags=["seller-api-keys"])

@router.post("/register", response_model=SellerApiKeyResponse)
def register_api_key(
    key_data: SellerApiKeyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing_key = db.query(SellerApiKey).filter(
        SellerApiKey.user_id == current_user.id,
        SellerApiKey.token_type == key_data.token_type,
        SellerApiKey.user_type == key_data.user_type,
        SellerApiKey.is_active == True
    ).first()
    
    if existing_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Active {key_data.user_type.value} API key already exists for {key_data.token_type.value}"
        )
    
    encrypted_key = encrypt_api_key(key_data.api_key)
    
    db_key = SellerApiKey(
        user_id=current_user.id,
        token_type=key_data.token_type,
        user_type=key_data.user_type,
        encrypted_api_key=encrypted_key
    )
    
    db.add(db_key)
    db.flush()
    
    initial_balance = 1000.0  # Grant 1000 tokens for testing
    TransactionService.update_balance_with_history(
        user_id=current_user.id,
        token_type=key_data.token_type,
        amount_change=initial_balance,
        transaction_type=TransactionType.DEPOSIT,
        db=db,
        description=f"Initial balance for {key_data.user_type.value} API key registration"
    )
    
    db.commit()
    db.refresh(db_key)
    
    return db_key

@router.get("/list", response_model=List[SellerApiKeyResponse])
def list_api_keys(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    keys = db.query(SellerApiKey).filter(
        SellerApiKey.user_id == current_user.id
    ).all()
    return keys

@router.delete("/{key_id}")
def deactivate_api_key(
    key_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    key = db.query(SellerApiKey).filter(
        SellerApiKey.id == key_id,
        SellerApiKey.user_id == current_user.id
    ).first()
    
    if not key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )
    
    key.is_active = False
    db.commit()
    
    return {"message": "API key deactivated successfully"}
