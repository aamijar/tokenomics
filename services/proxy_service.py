import httpx
from sqlalchemy.orm import Session
from models import User, Token, SellerApiKey, TokenType, TransactionType
from services.transaction_service import TransactionService
from crypto_utils import decrypt_api_key
from typing import Dict, Any, Optional
import random

class ProxyService:
    
    TOKEN_COSTS = {
        TokenType.OPENAI: {
            "chat/completions": 1.0,
            "completions": 1.0,
            "embeddings": 0.5,
        }
    }
    
    @staticmethod
    def get_available_seller(token_type: TokenType, db: Session) -> Optional[SellerApiKey]:
        available_keys = db.query(SellerApiKey).filter(
            SellerApiKey.token_type == token_type,
            SellerApiKey.is_active == True
        ).all()
        
        if not available_keys:
            return None
            
        return random.choice(available_keys)
    
    @staticmethod
    def calculate_token_cost(endpoint: str, token_type: TokenType) -> float:
        if token_type in ProxyService.TOKEN_COSTS:
            endpoint_costs = ProxyService.TOKEN_COSTS[token_type]
            for pattern, cost in endpoint_costs.items():
                if pattern in endpoint:
                    return cost
        return 1.0
    
    @staticmethod
    async def proxy_request(
        user: User,
        token_type: TokenType,
        endpoint: str,
        method: str,
        headers: Dict[str, Any],
        data: Dict[str, Any],
        db: Session
    ) -> Dict[str, Any]:
        
        token_cost = ProxyService.calculate_token_cost(endpoint, token_type)
        
        user_token = db.query(Token).filter(
            Token.user_id == user.id,
            Token.token_type == token_type
        ).first()
        
        if not user_token or user_token.balance < token_cost:
            raise ValueError(f"Insufficient {token_type.value} tokens. Required: {token_cost}, Available: {user_token.balance if user_token else 0}")
        
        seller_key = ProxyService.get_available_seller(token_type, db)
        if not seller_key:
            raise ValueError(f"No available sellers for {token_type.value} tokens")
        
        api_key = decrypt_api_key(seller_key.encrypted_api_key)
        
        proxy_headers = headers.copy() if headers else {}
        if token_type == TokenType.OPENAI:
            proxy_headers["Authorization"] = f"Bearer {api_key}"
            proxy_headers["Content-Type"] = "application/json"
            base_url = "https://api.openai.com/v1"
        
        async with httpx.AsyncClient() as client:
            response = await client.request(
                method=method,
                url=f"{base_url}/{endpoint}",
                headers=proxy_headers,
                json=data
            )
        
        if response.status_code == 200:
            TransactionService.update_balance_with_history(
                user_id=user.id,
                token_type=token_type,
                amount_change=-token_cost,
                transaction_type=TransactionType.WITHDRAWAL,
                db=db,
                description=f"API call to {endpoint}"
            )
        
        return {
            "status_code": response.status_code,
            "data": response.json() if response.status_code == 200 else {"error": response.text}
        }
