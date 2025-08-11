from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, Order, TradeStatus, Token
from schemas import OrderCreate, OrderResponse
from auth import get_current_user
from services.order_matching_service import OrderMatchingService

router = APIRouter(prefix="/api/orders", tags=["orders"])

@router.post("/create", response_model=OrderResponse)
def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if order_data.from_token == order_data.to_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot trade the same token type"
        )
    
    user_token = db.query(Token).filter(
        Token.user_id == current_user.id,
        Token.token_type == order_data.from_token
    ).first()
    
    if not user_token or user_token.balance < order_data.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient balance for order"
        )
    
    order = Order(
        user_id=current_user.id,
        from_token=order_data.from_token,
        to_token=order_data.to_token,
        amount=order_data.amount,
        exchange_rate=order_data.exchange_rate
    )
    
    db.add(order)
    db.flush()
    
    matched_trade = OrderMatchingService.process_order(order, db)
    
    db.commit()
    db.refresh(order)
    
    return order

@router.get("/list", response_model=List[OrderResponse])
def list_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    orders = db.query(Order).filter(
        Order.user_id == current_user.id
    ).order_by(Order.created_at.desc()).all()
    
    return orders

@router.delete("/{order_id}")
def cancel_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user.id,
        Order.status == TradeStatus.PENDING
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found or cannot be cancelled"
        )
    
    order.status = TradeStatus.CANCELLED
    db.commit()
    
    return {"message": "Order cancelled successfully"}
