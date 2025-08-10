from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, date
from models import TokenType, TradeStatus, TransactionType

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class User(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    id: int
    token_type: TokenType
    balance: float
    
    class Config:
        from_attributes = True

class TokenBalance(BaseModel):
    token_type: TokenType
    balance: float

class TokenTypeInfo(BaseModel):
    token_type: TokenType
    name: str
    description: str

class TradeCreate(BaseModel):
    from_token: TokenType
    to_token: TokenType
    exchange_rate: float
    amount: float

class TradeExecute(BaseModel):
    trade_id: int

class Trade(BaseModel):
    id: int
    creator_id: int
    from_token: TokenType
    to_token: TokenType
    exchange_rate: float
    amount: float
    status: TradeStatus
    created_at: datetime
    completed_at: Optional[datetime] = None
    executor_id: Optional[int] = None
    
    class Config:
        from_attributes = True

class MarketPrice(BaseModel):
    token_type: TokenType
    price_btc: float
    price_usd: float
    last_updated: datetime
    
    class Config:
        from_attributes = True

class AuthToken(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

class TransactionHistory(BaseModel):
    id: int
    user_id: int
    token_type: TokenType
    transaction_type: TransactionType
    amount: float
    balance_before: float
    balance_after: float
    related_trade_id: Optional[int] = None
    description: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class BalanceSnapshot(BaseModel):
    id: int
    user_id: int
    token_type: TokenType
    balance: float
    snapshot_date: date
    created_at: datetime
    
    class Config:
        from_attributes = True

class ConversionRate(BaseModel):
    from_token: TokenType
    to_token: TokenType
    market_rate: float
    avg_trade_rate: Optional[float] = None
    volume_24h: float
    spread_percentage: Optional[float] = None
    last_updated: datetime
    
    class Config:
        from_attributes = True

class TradeCreateEnhanced(BaseModel):
    from_token: TokenType
    to_token: TokenType
    exchange_rate: float
    amount: float
    validate_rate: bool = True
