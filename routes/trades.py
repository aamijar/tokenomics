from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, Token, Trade, TradeStatus
from schemas import TradeCreate, TradeExecute, Trade as TradeSchema
from auth import get_current_user
from datetime import datetime

router = APIRouter(prefix="/api/trades", tags=["trades"])

@router.post("/create", response_model=TradeSchema)
def create_trade(
    trade_data: TradeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if trade_data.from_token == trade_data.to_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot trade the same token type"
        )
    
    user_token = db.query(Token).filter(
        Token.user_id == current_user.id,
        Token.token_type == trade_data.from_token
    ).first()
    
    if not user_token or user_token.balance < trade_data.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient balance for trade"
        )
    
    db_trade = Trade(
        creator_id=current_user.id,
        from_token=trade_data.from_token,
        to_token=trade_data.to_token,
        exchange_rate=trade_data.exchange_rate,
        amount=trade_data.amount
    )
    
    db.add(db_trade)
    db.commit()
    db.refresh(db_trade)
    
    return db_trade

@router.get("/list", response_model=List[TradeSchema])
def list_trades(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trades = db.query(Trade).filter(
        Trade.status == TradeStatus.ACTIVE,
        Trade.creator_id != current_user.id
    ).all()
    
    return trades

@router.post("/execute", response_model=TradeSchema)
def execute_trade(
    trade_data: TradeExecute,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    trade = db.query(Trade).filter(Trade.id == trade_data.trade_id).first()
    
    if not trade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trade not found"
        )
    
    if trade.status != TradeStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Trade is not active"
        )
    
    if trade.creator_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot execute your own trade"
        )
    
    executor_token = db.query(Token).filter(
        Token.user_id == current_user.id,
        Token.token_type == trade.to_token
    ).first()
    
    required_amount = trade.amount * trade.exchange_rate
    
    if not executor_token or executor_token.balance < required_amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient balance to execute trade"
        )
    
    creator_from_token = db.query(Token).filter(
        Token.user_id == trade.creator_id,
        Token.token_type == trade.from_token
    ).first()
    
    creator_to_token = db.query(Token).filter(
        Token.user_id == trade.creator_id,
        Token.token_type == trade.to_token
    ).first()
    
    executor_from_token = db.query(Token).filter(
        Token.user_id == current_user.id,
        Token.token_type == trade.from_token
    ).first()
    
    creator_from_token.balance -= trade.amount
    creator_to_token.balance += required_amount
    executor_from_token.balance += trade.amount
    executor_token.balance -= required_amount
    
    trade.status = TradeStatus.COMPLETED
    trade.executor_id = current_user.id
    trade.completed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(trade)
    
    return trade
