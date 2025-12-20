# Budget Tracker Lite - Backend

FastAPI backend for Budget Tracker Lite with JWT authentication.

## Setup

1. Install dependencies (requires Python 3.13 and [uv](https://docs.astral.sh/uv/)):
```bash
cd backend
pip install uv
uv sync --extra dev
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env and set SECRET_KEY (use: openssl rand -hex 32)
```

3. Run the server:
```bash
uv run uvicorn src.app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at http://localhost:8000

## API Documentation

Interactive API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Authentication

All transaction endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-token>
```

## Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Transactions (Protected)
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/{id}` - Get transaction by ID
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication (default expiry: 24 hours)
- Password requirements: min 8 chars, 1 number, 1 uppercase
- Reset tokens expire after 1 hour
