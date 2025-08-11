from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import TokenType, ConversionRate
from schemas import ConversionRate as ConversionRateSchema
from services import ConversionService

router = APIRouter(prefix="/api/conversion", tags=["conversion"])

@router.get("/rates", response_model=List[ConversionRateSchema])
def get_conversion_rates(db: Session = Depends(get_db)):
    """Get all conversion rates"""
    rates = db.query(ConversionRate).all()
    return rates

@router.get("/rate/{from_token}/{to_token}")
def get_conversion_rate(
    from_token: TokenType,
    to_token: TokenType,
    db: Session = Depends(get_db)
):
    """Get conversion rate between two specific tokens"""
    try:
        market_rate = ConversionService.calculate_market_rate(from_token, to_token, db)
        conversion_rate = ConversionService.get_or_create_conversion_rate(from_token, to_token, db)
        
        return {
            "from_token": from_token,
            "to_token": to_token,
            "market_rate": market_rate,
            "avg_trade_rate": conversion_rate.avg_trade_rate,
            "volume_24h": conversion_rate.volume_24h,
            "spread_percentage": conversion_rate.spread_percentage,
            "last_updated": conversion_rate.last_updated
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/market-rate/{from_token}/{to_token}")
def get_market_rate(
    from_token: TokenType,
    to_token: TokenType,
    db: Session = Depends(get_db)
):
    """Get current market-based conversion rate between two tokens"""
    try:
        market_rate = ConversionService.calculate_market_rate(from_token, to_token, db)
        return {
            "from_token": from_token,
            "to_token": to_token,
            "market_rate": market_rate
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
