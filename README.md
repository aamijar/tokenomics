# Tokenomics Trading Platform Backend

A FastAPI-based backend for an AI token/credit trading marketplace where users can trade tokens between AI models (OpenAI ↔ Anthropic, etc.) and convert back to Bitcoin.

## Features

- **User Authentication**: JWT-based authentication with registration and login
- **Token Management**: Support for multiple AI token types (OpenAI, Anthropic, Google, Cohere, Mistral)
- **P2P Trading System**: Create and execute trades with custom exchange rates
- **Market Pricing**: Real-time market prices for token-to-Bitcoin conversion
- **Trading History**: Track all completed trades and portfolio changes
- **RESTful API**: Comprehensive API with automatic OpenAPI documentation

## Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: SQL toolkit and ORM for database operations
- **SQLite**: Lightweight database (perfect for demos and development)
- **JWT**: JSON Web Tokens for secure authentication
- **Pydantic**: Data validation and serialization
- **Passlib**: Password hashing with bcrypt
- **Uvicorn**: ASGI server for running the application

## Quick Start

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Initialize Database**
   ```bash
   python init_db.py
   ```

4. **Run the Server**
   ```bash
   uvicorn main:app --reload
   ```

5. **Access the API**
   - API: http://localhost:8000
   - Documentation: http://localhost:8000/docs
   - Alternative docs: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### User Management
- `GET /api/user/balance` - Get user token balances (protected)

### Tokens
- `GET /api/tokens/types` - List available AI token types

### Trading
- `POST /api/trades/create` - Create a new trade offer (protected)
- `GET /api/trades/list` - List available trades (protected)
- `POST /api/trades/execute` - Execute a trade (protected)

### Market Data
- `GET /api/market/prices` - Get current market prices

## Database Schema

### Users
- `id`: Primary key
- `username`: Unique username
- `email`: Unique email address
- `password_hash`: Bcrypt hashed password
- `created_at`: Account creation timestamp

### Tokens
- `id`: Primary key
- `user_id`: Foreign key to users table
- `token_type`: AI token type (OpenAI, Anthropic, etc.)
- `balance`: Current token balance

### Trades
- `id`: Primary key
- `creator_id`: User who created the trade
- `from_token`: Token type being offered
- `to_token`: Token type being requested
- `exchange_rate`: Exchange rate for the trade
- `amount`: Amount of from_token being traded
- `status`: Trade status (active, completed, cancelled)
- `created_at`: Trade creation timestamp
- `completed_at`: Trade completion timestamp
- `executor_id`: User who executed the trade

### Market Prices
- `id`: Primary key
- `token_type`: AI token type
- `price_btc`: Price in Bitcoin
- `price_usd`: Price in USD
- `last_updated`: Last price update timestamp

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Testing

Run the test script to verify all endpoints:

```bash
python test_api.py
```

This will test:
- User registration and login
- Token balance retrieval
- Trade creation and listing
- Market price fetching

## Demo Data

The database is automatically seeded with:
- Demo user (username: `demo`, password: `demo123`)
- Initial token balances for all AI token types
- Market prices for all supported tokens

## Token Types

The platform supports the following AI token types:
- **OpenAI**: Credits for GPT models and APIs
- **Anthropic**: Credits for Claude and other models
- **Google**: Credits for Gemini and AI services
- **Cohere**: Credits for Cohere language models
- **Mistral**: Credits for Mistral AI models

## Trading System

### Creating Trades
Users can create trade offers by specifying:
- Source token type and amount
- Target token type
- Exchange rate

### Executing Trades
Other users can execute trades if they have sufficient balance of the target token type. The system automatically:
- Validates balances
- Updates all relevant token balances
- Marks the trade as completed
- Records the executor

### Trade Matching
The current implementation uses a simple first-come-first-served matching algorithm. Trades are listed in creation order and can be executed by any user with sufficient balance.

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **JWT Tokens**: Secure token-based authentication
- **Input Validation**: Comprehensive validation using Pydantic models
- **CORS**: Properly configured for frontend integration
- **Error Handling**: Detailed error responses with appropriate HTTP status codes

## Development

### Project Structure
```
tokenomics/
├── main.py              # FastAPI application entry point
├── database.py          # Database configuration and session management
├── models.py            # SQLAlchemy database models
├── schemas.py           # Pydantic request/response models
├── auth.py              # Authentication and JWT handling
├── init_db.py           # Database initialization and seeding
├── test_api.py          # API testing script
├── requirements.txt     # Python dependencies
├── .env.example         # Environment variables template
└── routes/              # API route modules
    ├── __init__.py
    ├── auth.py          # Authentication endpoints
    ├── users.py         # User management endpoints
    ├── tokens.py        # Token type endpoints
    ├── trades.py        # Trading endpoints
    └── market.py        # Market data endpoints
```

### Adding New Features

1. **New Models**: Add to `models.py` and create migration
2. **New Endpoints**: Create new router in `routes/` directory
3. **New Schemas**: Add Pydantic models to `schemas.py`
4. **Authentication**: Use `get_current_user` dependency for protected routes

## Deployment

The backend is designed to be easily deployable to platforms like:
- Fly.io
- Heroku
- Railway
- DigitalOcean App Platform

For production deployment:
1. Set proper environment variables
2. Use a production database (PostgreSQL recommended)
3. Configure proper CORS origins
4. Set up monitoring and logging

## Future Enhancements

- WebSocket support for real-time price updates
- Advanced trading algorithms (order books, limit orders)
- Integration with real cryptocurrency exchanges
- Portfolio analytics and reporting
- Trading fees and commission system
- Multi-currency support beyond Bitcoin
