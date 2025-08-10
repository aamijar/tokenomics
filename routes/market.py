from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import MarketPrice
from schemas import MarketPrice as MarketPriceSchema

router = APIRouter(prefix="/api/market", tags=["market"])

@router.get("/prices", response_model=List[MarketPriceSchema])
def get_market_prices(db: Session = Depends(get_db)):
    prices = db.query(MarketPrice).all()
    return prices
