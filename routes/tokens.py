from fastapi import APIRouter
from typing import List
from models import TokenType
from schemas import TokenTypeInfo

router = APIRouter(prefix="/api/tokens", tags=["tokens"])

TOKEN_INFO = {
    TokenType.OPENAI: TokenTypeInfo(
        token_type=TokenType.OPENAI,
        name="OpenAI Credits",
        description="Credits for OpenAI GPT models and APIs"
    ),
    TokenType.ANTHROPIC: TokenTypeInfo(
        token_type=TokenType.ANTHROPIC,
        name="Anthropic Credits",
        description="Credits for Claude and other Anthropic models"
    ),
    TokenType.GOOGLE: TokenTypeInfo(
        token_type=TokenType.GOOGLE,
        name="Google AI Credits",
        description="Credits for Google Gemini and AI services"
    ),
    TokenType.COHERE: TokenTypeInfo(
        token_type=TokenType.COHERE,
        name="Cohere Credits",
        description="Credits for Cohere language models"
    ),
    TokenType.MISTRAL: TokenTypeInfo(
        token_type=TokenType.MISTRAL,
        name="Mistral Credits",
        description="Credits for Mistral AI models"
    )
}

@router.get("/types", response_model=List[TokenTypeInfo])
def get_token_types():
    return list(TOKEN_INFO.values())
