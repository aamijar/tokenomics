from sqlalchemy.orm import Session
from models import TransactionHistory, BalanceSnapshot, Token, User, TokenType, TransactionType
from datetime import datetime, date
import logging

logger = logging.getLogger(__name__)

class TransactionService:
    
    @staticmethod
    def log_transaction(
        user_id: int,
        token_type: TokenType,
        transaction_type: TransactionType,
        amount: float,
        balance_before: float,
        balance_after: float,
        db: Session,
        related_trade_id: int = None,
        description: str = None
    ) -> TransactionHistory:
        """Log a transaction to the transaction history"""
        transaction = TransactionHistory(
            user_id=user_id,
            token_type=token_type,
            transaction_type=transaction_type,
            amount=amount,
            balance_before=balance_before,
            balance_after=balance_after,
            related_trade_id=related_trade_id,
            description=description
        )
        
        db.add(transaction)
        db.commit()
        db.refresh(transaction)
        
        logger.info(f"Logged transaction: User {user_id}, {token_type.value}, {transaction_type.value}, Amount: {amount}")
        
        return transaction
    
    @staticmethod
    def update_balance_with_history(
        user_id: int,
        token_type: TokenType,
        amount_change: float,
        transaction_type: TransactionType,
        db: Session,
        related_trade_id: int = None,
        description: str = None
    ) -> Token:
        """Update token balance and log the transaction"""
        token = db.query(Token).filter(
            Token.user_id == user_id,
            Token.token_type == token_type
        ).first()
        
        if not token:
            token = Token(
                user_id=user_id,
                token_type=token_type,
                balance=0.0
            )
            db.add(token)
            db.flush()
        
        balance_before = token.balance
        balance_after = balance_before + amount_change
        
        if balance_after < 0:
            raise ValueError(f"Insufficient balance: {balance_before} + {amount_change} = {balance_after}")
        
        token.balance = balance_after
        
        TransactionService.log_transaction(
            user_id=user_id,
            token_type=token_type,
            transaction_type=transaction_type,
            amount=amount_change,
            balance_before=balance_before,
            balance_after=balance_after,
            db=db,
            related_trade_id=related_trade_id,
            description=description
        )
        
        db.commit()
        db.refresh(token)
        
        return token
    
    @staticmethod
    def create_daily_balance_snapshot(user_id: int, db: Session):
        """Create daily balance snapshots for a user"""
        today = date.today()
        
        existing_snapshots = db.query(BalanceSnapshot).filter(
            BalanceSnapshot.user_id == user_id,
            BalanceSnapshot.snapshot_date == today
        ).count()
        
        if existing_snapshots > 0:
            logger.info(f"Balance snapshots already exist for user {user_id} on {today}")
            return
        
        user_tokens = db.query(Token).filter(Token.user_id == user_id).all()
        
        for token in user_tokens:
            snapshot = BalanceSnapshot(
                user_id=user_id,
                token_type=token.token_type,
                balance=token.balance,
                snapshot_date=today
            )
            db.add(snapshot)
        
        db.commit()
        logger.info(f"Created daily balance snapshots for user {user_id}")
    
    @staticmethod
    def get_user_transaction_history(
        user_id: int,
        db: Session,
        token_type: TokenType = None,
        limit: int = 100
    ) -> list[TransactionHistory]:
        """Get transaction history for a user"""
        query = db.query(TransactionHistory).filter(TransactionHistory.user_id == user_id)
        
        if token_type:
            query = query.filter(TransactionHistory.token_type == token_type)
        
        transactions = query.order_by(TransactionHistory.created_at.desc()).limit(limit).all()
        
        return transactions
    
    @staticmethod
    def get_user_balance_history(
        user_id: int,
        db: Session,
        token_type: TokenType = None,
        days: int = 30
    ) -> list[BalanceSnapshot]:
        """Get balance history for a user"""
        query = db.query(BalanceSnapshot).filter(BalanceSnapshot.user_id == user_id)
        
        if token_type:
            query = query.filter(BalanceSnapshot.token_type == token_type)
        
        snapshots = query.order_by(BalanceSnapshot.snapshot_date.desc()).limit(days).all()
        
        return snapshots
