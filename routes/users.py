from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, Token
from schemas import TokenBalance
from auth import get_current_user

router = APIRouter(prefix="/api/user", tags=["users"])

@router.get("/balance", response_model=List[TokenBalance])
def get_user_balance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tokens = db.query(Token).filter(Token.user_id == current_user.id).all()
    
    return [
        TokenBalance(token_type=token.token_type, balance=token.balance)
        for token in tokens
    ]
