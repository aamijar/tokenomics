from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import User, TokenType
from schemas import TransactionHistory, BalanceSnapshot
from auth import get_current_user
from services import TransactionService

router = APIRouter(prefix="/api/history", tags=["history"])

@router.get("/transactions", response_model=List[TransactionHistory])
def get_transaction_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    token_type: Optional[TokenType] = Query(None, description="Filter by token type"),
    limit: int = Query(100, ge=1, le=1000, description="Number of transactions to return")
):
    """Get transaction history for the current user"""
    transactions = TransactionService.get_user_transaction_history(
        user_id=current_user.id,
        db=db,
        token_type=token_type,
        limit=limit
    )
    return transactions

@router.get("/balances", response_model=List[BalanceSnapshot])
def get_balance_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    token_type: Optional[TokenType] = Query(None, description="Filter by token type"),
    days: int = Query(30, ge=1, le=365, description="Number of days of history to return")
):
    """Get balance history snapshots for the current user"""
    snapshots = TransactionService.get_user_balance_history(
        user_id=current_user.id,
        db=db,
        token_type=token_type,
        days=days
    )
    return snapshots

@router.post("/snapshot")
def create_balance_snapshot(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Manually create a balance snapshot for the current user"""
    TransactionService.create_daily_balance_snapshot(current_user.id, db)
    return {"message": "Balance snapshot created successfully"}
