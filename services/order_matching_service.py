from sqlalchemy.orm import Session
from models import Order, Trade, TradeStatus, TokenType, TransactionType
from services.transaction_service import TransactionService
from datetime import datetime
from typing import Optional, List

class OrderMatchingService:
    
    @staticmethod
    def find_matching_order(order: Order, db: Session) -> Optional[Order]:
        matching_orders = db.query(Order).filter(
            Order.status == TradeStatus.PENDING,
            Order.from_token == order.to_token,
            Order.to_token == order.from_token,
            Order.user_id != order.user_id
        ).all()
        
        for matching_order in matching_orders:
            if OrderMatchingService.are_rates_compatible(order, matching_order):
                return matching_order
        
        return None
    
    @staticmethod
    def are_rates_compatible(order1: Order, order2: Order, tolerance: float = 0.05) -> bool:
        expected_rate = 1.0 / order1.exchange_rate
        actual_rate = order2.exchange_rate
        
        return abs(expected_rate - actual_rate) / expected_rate <= tolerance
    
    @staticmethod
    def execute_matched_orders(order1: Order, order2: Order, db: Session) -> Trade:
        trade_amount = min(order1.amount, order2.amount / order2.exchange_rate)
        
        trade = Trade(
            creator_id=order1.user_id,
            executor_id=order2.user_id,
            from_token=order1.from_token,
            to_token=order1.to_token,
            exchange_rate=order1.exchange_rate,
            amount=trade_amount,
            status=TradeStatus.COMPLETED,
            completed_at=datetime.utcnow()
        )
        
        db.add(trade)
        db.flush()
        
        required_amount = trade_amount * order1.exchange_rate
        
        TransactionService.update_balance_with_history(
            user_id=order1.user_id,
            token_type=order1.from_token,
            amount_change=-trade_amount,
            transaction_type=TransactionType.TRADE_SEND,
            db=db,
            related_trade_id=trade.id,
            description=f"Order match #{trade.id}: Sent {trade_amount} {order1.from_token.value}"
        )
        
        TransactionService.update_balance_with_history(
            user_id=order1.user_id,
            token_type=order1.to_token,
            amount_change=required_amount,
            transaction_type=TransactionType.TRADE_RECEIVE,
            db=db,
            related_trade_id=trade.id,
            description=f"Order match #{trade.id}: Received {required_amount} {order1.to_token.value}"
        )
        
        TransactionService.update_balance_with_history(
            user_id=order2.user_id,
            token_type=order2.from_token,
            amount_change=-required_amount,
            transaction_type=TransactionType.TRADE_SEND,
            db=db,
            related_trade_id=trade.id,
            description=f"Order match #{trade.id}: Sent {required_amount} {order2.from_token.value}"
        )
        
        TransactionService.update_balance_with_history(
            user_id=order2.user_id,
            token_type=order2.to_token,
            amount_change=trade_amount,
            transaction_type=TransactionType.TRADE_RECEIVE,
            db=db,
            related_trade_id=trade.id,
            description=f"Order match #{trade.id}: Received {trade_amount} {order2.to_token.value}"
        )
        
        order1.status = TradeStatus.COMPLETED
        order1.matched_order_id = order2.id
        order1.matched_at = datetime.utcnow()
        
        order2.status = TradeStatus.COMPLETED
        order2.matched_order_id = order1.id
        order2.matched_at = datetime.utcnow()
        
        if order1.amount > trade_amount:
            remaining_order = Order(
                user_id=order1.user_id,
                from_token=order1.from_token,
                to_token=order1.to_token,
                amount=order1.amount - trade_amount,
                exchange_rate=order1.exchange_rate,
                status=TradeStatus.PENDING
            )
            db.add(remaining_order)
        
        if order2.amount > required_amount:
            remaining_order = Order(
                user_id=order2.user_id,
                from_token=order2.from_token,
                to_token=order2.to_token,
                amount=order2.amount - required_amount,
                exchange_rate=order2.exchange_rate,
                status=TradeStatus.PENDING
            )
            db.add(remaining_order)
        
        return trade
    
    @staticmethod
    def process_order(order: Order, db: Session) -> Optional[Trade]:
        matching_order = OrderMatchingService.find_matching_order(order, db)
        
        if matching_order:
            return OrderMatchingService.execute_matched_orders(order, matching_order, db)
        
        return None
