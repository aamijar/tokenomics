from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from routes.auth import router as auth_router
from routes.users import router as users_router
from routes.tokens import router as tokens_router
from routes.trades import router as trades_router
from routes.market import router as market_router
from routes.history import router as history_router
from routes.conversion import router as conversion_router
from routes.proxy import router as proxy_router
from routes.api_keys import router as api_keys_router
from init_db import create_tables, seed_data

app = FastAPI(
    title="Tokenomics Trading Platform",
    description="AI token/credit trading marketplace",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(tokens_router)
app.include_router(trades_router)
app.include_router(market_router)
app.include_router(history_router)
app.include_router(conversion_router)
app.include_router(proxy_router)
app.include_router(api_keys_router)

app.mount("/assets", StaticFiles(directory="assets"), name="assets")
app.mount("/styles", StaticFiles(directory="styles"), name="styles") 
app.mount("/scripts", StaticFiles(directory="scripts"), name="scripts")
app.mount("/", StaticFiles(directory=".", html=True), name="static")

@app.on_event("startup")
async def startup_event():
    create_tables()
    seed_data()

@app.get("/")
def read_root():
    return {
        "message": "Tokenomics Trading Platform API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
