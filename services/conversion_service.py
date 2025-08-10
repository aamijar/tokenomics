from sqlalchemy.orm import Session
from models import MarketPrice, ConversionRate, TokenType
from typing import Dict, Tuple
import logging

logger = logging.getLogger(__name__)

class ConversionService:
    
    @staticmethod
    def calculate_market_rate(from_token: TokenType, to_token: TokenType, db: Session) -> float:
        """Calculate market-based conversion rate between two tokens using BTC prices"""
        if from_token == to_token:
            return 1.0
            
        from_price = db.query(MarketPrice).filter(MarketPrice.token_type == from_token).first()
        to_price = db.query(MarketPrice).filter(MarketPrice.token_type == to_token).first()
        
        if not from_price or not to_price:
            raise ValueError(f"Market prices not found for {from_token.value} or {to_token.value}")
        
        market_rate = from_price.price_btc / to_price.price_btc
        logger.info(f"Market rate {from_token.value} -> {to_token.value}: {market_rate}")
        
        return market_rate
    
    @staticmethod
    def validate_trade_rate(
        user_rate: float, 
        market_rate: float, 
        max_spread_percentage: float = 15.0
    ) -> Tuple[bool, float]:
        """Validate if user's trade rate is within acceptable spread from market rate"""
        spread_percentage = abs(user_rate - market_rate) / market_rate * 100
        is_valid = spread_percentage <= max_spread_percentage
        
        logger.info(f"Rate validation: user={user_rate}, market={market_rate}, spread={spread_percentage:.2f}%")
        
        return is_valid, spread_percentage
    
    @staticmethod
    def get_or_create_conversion_rate(
        from_token: TokenType, 
        to_token: TokenType, 
        db: Session
    ) -> ConversionRate:
        """Get existing conversion rate or create new one with market calculation"""
        conversion_rate = db.query(ConversionRate).filter(
            ConversionRate.from_token == from_token,
            ConversionRate.to_token == to_token
        ).first()
        
        if not conversion_rate:
            market_rate = ConversionService.calculate_market_rate(from_token, to_token, db)
            conversion_rate = ConversionRate(
                from_token=from_token,
                to_token=to_token,
                market_rate=market_rate,
                volume_24h=0.0
            )
            db.add(conversion_rate)
            db.commit()
            db.refresh(conversion_rate)
        else:
            market_rate = ConversionService.calculate_market_rate(from_token, to_token, db)
            conversion_rate.market_rate = market_rate
            db.commit()
        
        return conversion_rate
    
    @staticmethod
    def update_conversion_rate_stats(
        from_token: TokenType,
        to_token: TokenType,
        trade_rate: float,
        trade_amount: float,
        db: Session
    ):
        """Update conversion rate statistics after a trade"""
        conversion_rate = ConversionService.get_or_create_conversion_rate(from_token, to_token, db)
        
        conversion_rate.volume_24h += trade_amount
        
        if conversion_rate.avg_trade_rate is None:
            conversion_rate.avg_trade_rate = trade_rate
        else:
            conversion_rate.avg_trade_rate = (conversion_rate.avg_trade_rate + trade_rate) / 2
        
        market_rate = conversion_rate.market_rate
        conversion_rate.spread_percentage = abs(trade_rate - market_rate) / market_rate * 100
        
        db.commit()
        logger.info(f"Updated conversion rate stats for {from_token.value} -> {to_token.value}")
