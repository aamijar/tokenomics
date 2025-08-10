from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class TokenType(enum.Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"
    COHERE = "cohere"
    MISTRAL = "mistral"

class TradeStatus(enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class TransactionType(enum.Enum):
    TRADE_SEND = "trade_send"
    TRADE_RECEIVE = "trade_receive"
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    INITIAL_BALANCE = "initial_balance"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    tokens = relationship("Token", back_populates="user")
    created_trades = relationship("Trade", foreign_keys="Trade.creator_id", back_populates="creator")

class Token(Base):
    __tablename__ = "tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token_type = Column(Enum(TokenType), nullable=False)
    balance = Column(Float, default=0.0, nullable=False)
    
    user = relationship("User", back_populates="tokens")

class Trade(Base):
    __tablename__ = "trades"
    
    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    from_token = Column(Enum(TokenType), nullable=False)
    to_token = Column(Enum(TokenType), nullable=False)
    exchange_rate = Column(Float, nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(Enum(TradeStatus), default=TradeStatus.ACTIVE, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    executor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    creator = relationship("User", foreign_keys=[creator_id], back_populates="created_trades")
    executor = relationship("User", foreign_keys=[executor_id])

class MarketPrice(Base):
    __tablename__ = "market_prices"
    
    id = Column(Integer, primary_key=True, index=True)
    token_type = Column(Enum(TokenType), unique=True, nullable=False)
    price_btc = Column(Float, nullable=False)
    price_usd = Column(Float, nullable=False)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class TransactionHistory(Base):
    __tablename__ = "transaction_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token_type = Column(Enum(TokenType), nullable=False)
    transaction_type = Column(Enum(TransactionType), nullable=False)
    amount = Column(Float, nullable=False)
    balance_before = Column(Float, nullable=False)
    balance_after = Column(Float, nullable=False)
    related_trade_id = Column(Integer, ForeignKey("trades.id"), nullable=True)
    description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User")
    related_trade = relationship("Trade")

class BalanceSnapshot(Base):
    __tablename__ = "balance_snapshots"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token_type = Column(Enum(TokenType), nullable=False)
    balance = Column(Float, nullable=False)
    snapshot_date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User")

class ConversionRate(Base):
    __tablename__ = "conversion_rates"
    
    id = Column(Integer, primary_key=True, index=True)
    from_token = Column(Enum(TokenType), nullable=False)
    to_token = Column(Enum(TokenType), nullable=False)
    market_rate = Column(Float, nullable=False)
    avg_trade_rate = Column(Float, nullable=True)
    volume_24h = Column(Float, default=0.0, nullable=False)
    spread_percentage = Column(Float, nullable=True)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
