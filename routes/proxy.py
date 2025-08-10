from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User, TokenType
from schemas import ProxyRequest
from auth import get_current_user
from services.proxy_service import ProxyService

router = APIRouter(prefix="/api/proxy", tags=["proxy"])

@router.post("/openai/{endpoint:path}")
async def proxy_openai_request(
    endpoint: str,
    request_data: ProxyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    
    token_type = TokenType.OPENAI
    
    try:
        result = await ProxyService.proxy_request(
            user=current_user,
            token_type=token_type,
            endpoint=endpoint,
            method=request_data.method,
            headers=request_data.headers or {},
            data=request_data.data or {},
            db=db
        )
        
        if result["status_code"] == 200:
            return result["data"]
        else:
            raise HTTPException(
                status_code=result["status_code"],
                detail=result["data"]
            )
            
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Proxy error: {str(e)}"
        )

@router.get("/health")
def proxy_health():
    return {"status": "healthy", "service": "proxy"}
