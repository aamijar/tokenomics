from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from models import TokenType, TradeStatus

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
