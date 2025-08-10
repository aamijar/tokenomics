from sqlalchemy.orm import Session
from database import engine, SessionLocal, Base
from models import User, Token, MarketPrice, TokenType, ConversionRate, TransactionType
from auth import get_password_hash
from services import ConversionService
import random

def create_tables():
    Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()
    
    try:
        if db.query(User).first():
            print("Database already seeded")
            return
        
        demo_user = User(
            username="demo",
            email="demo@tokenomics.com",
            password_hash=get_password_hash("demo123")
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)
        
        for token_type in TokenType:
            initial_balance = random.uniform(500, 2000)
            token = Token(
                user_id=demo_user.id,
                token_type=token_type,
                balance=initial_balance
            )
            db.add(token)
        
        market_prices = [
            MarketPrice(token_type=TokenType.OPENAI, price_btc=0.000001, price_usd=0.05),
            MarketPrice(token_type=TokenType.ANTHROPIC, price_btc=0.0000012, price_usd=0.06),
            MarketPrice(token_type=TokenType.GOOGLE, price_btc=0.0000008, price_usd=0.04),
            MarketPrice(token_type=TokenType.COHERE, price_btc=0.0000009, price_usd=0.045),
            MarketPrice(token_type=TokenType.MISTRAL, price_btc=0.0000007, price_usd=0.035),
        ]
        
        for price in market_prices:
            db.add(price)
        
        db.commit()
        
        for from_token in TokenType:
            for to_token in TokenType:
                if from_token != to_token:
                    try:
                        ConversionService.get_or_create_conversion_rate(from_token, to_token, db)
                    except Exception as e:
                        print(f"Error creating conversion rate {from_token.value} -> {to_token.value}: {e}")
        
        print("Database seeded successfully")
        
    finally:
        db.close()

if __name__ == "__main__":
    create_tables()
    seed_data()
