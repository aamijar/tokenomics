from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, Token, Trade, TradeStatus, TransactionType
from schemas import TradeCreate, TradeExecute, Trade as TradeSchema, TradeCreateEnhanced
from auth import get_current_user
from services import ConversionService, TransactionService
from datetime import datetime

router = APIRouter(prefix="/api/trades", tags=["trades"])

@router.post("/create", response_model=TradeSchema)
def create_trade(
    trade_data: TradeCreateEnhanced,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if trade_data.from_token == trade_data.to_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot trade the same token type"
        )
    
    if trade_data.validate_rate:
        try:
            market_rate = ConversionService.calculate_market_rate(
                trade_data.from_token, trade_data.to_token, db
            )
            is_valid, spread = ConversionService.validate_trade_rate(
                trade_data.exchange_rate, market_rate
            )
            if not is_valid:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Trade rate {trade_data.exchange_rate} deviates {spread:.1f}% from market rate {market_rate:.4f}. Maximum allowed spread is 15%."
                )
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
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
    
    required_amount = trade.amount * trade.exchange_rate
    
    try:
        TransactionService.update_balance_with_history(
            user_id=trade.creator_id,
            token_type=trade.from_token,
            amount_change=-trade.amount,
            transaction_type=TransactionType.TRADE_SEND,
            db=db,
            related_trade_id=trade.id,
            description=f"Trade #{trade.id}: Sent {trade.amount} {trade.from_token.value}"
        )
        
        TransactionService.update_balance_with_history(
            user_id=trade.creator_id,
            token_type=trade.to_token,
            amount_change=required_amount,
            transaction_type=TransactionType.TRADE_RECEIVE,
            db=db,
            related_trade_id=trade.id,
            description=f"Trade #{trade.id}: Received {required_amount} {trade.to_token.value}"
        )
        
        TransactionService.update_balance_with_history(
            user_id=current_user.id,
            token_type=trade.to_token,
            amount_change=-required_amount,
            transaction_type=TransactionType.TRADE_SEND,
            db=db,
            related_trade_id=trade.id,
            description=f"Trade #{trade.id}: Sent {required_amount} {trade.to_token.value}"
        )
        
        TransactionService.update_balance_with_history(
            user_id=current_user.id,
            token_type=trade.from_token,
            amount_change=trade.amount,
            transaction_type=TransactionType.TRADE_RECEIVE,
            db=db,
            related_trade_id=trade.id,
            description=f"Trade #{trade.id}: Received {trade.amount} {trade.from_token.value}"
        )
        
        trade.status = TradeStatus.COMPLETED
        trade.executor_id = current_user.id
        trade.completed_at = datetime.utcnow()
        
        ConversionService.update_conversion_rate_stats(
            trade.from_token, trade.to_token, trade.exchange_rate, trade.amount, db
        )
        
        TransactionService.create_daily_balance_snapshot(trade.creator_id, db)
        TransactionService.create_daily_balance_snapshot(current_user.id, db)
        
        db.commit()
        db.refresh(trade)
        
        return trade
        
    except ValueError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
