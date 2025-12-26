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

## Frontend HMR (optional)

For faster frontend development without losing in-memory state (such as auth state during edits), you can run the frontend with Hot Module Replacement:

```bash
cd ../frontend
npm install        # only required once
npm run start:hmr  # starts the dev server with HMR enabled
```

HMR updates components in-place and avoids a full page reload on most code changes, which helps preserve developer sessions while you iterate. This is a development convenience only and is not used in production builds.

## API Documentation

Interactive API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Authentication

All transaction endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-token>
```

## Development helper: Dev auth bypass (opt-in, local only)

A small dev-only convenience has been implemented to avoid repeated logins during local frontend development.

- How it works
  - When enabled, the backend auth dependency will return a local user when a special header is present on a request. This allows the frontend to make authenticated requests during development without performing the login flow.

- How to enable (local only)
  1. In `backend/.env` set:
     ```env
     DEV_AUTH_BYPASS=true
     # Optional: target a specific dev user by email (fallback is the first user in the DB)
     DEV_BYPASS_USER_EMAIL=dev@local
     ```
  2. Restart the backend so the new env values are picked up.
  3. Send the header `X-DEV-AUTH: 1` with requests you want to bypass authentication for. Example using curl (PowerShell):
     ```powershell
     Invoke-RestMethod -Uri http://localhost:8000/api/auth/me -Headers @{ 'X-DEV-AUTH' = '1' }
     ```

- Notes
  - The header name is configurable via the `DEV_BYPASS_HEADER` setting but defaults to `X-DEV-AUTH`.
  - The bypass returns an existing user from the database (either the one matching `DEV_BYPASS_USER_EMAIL`, if set, or the first user). Make sure you have at least one user in the dev DB.
  - This feature is strictly for local development. Do NOT enable `DEV_AUTH_BYPASS` on any public or production environment and do not commit a .env containing `DEV_AUTH_BYPASS=true`.

- Where the code lives
  - Backend settings: `backend/src/app/config/settings.py` (new `DEV_AUTH_BYPASS` settings)
  - Backend auth dependency: `backend/src/app/auth/dependencies.py` (bypass logic)
  - Frontend helper (optional): the frontend interceptor can add the header automatically in dev — see `frontend/src/app/core/interceptors/auth.interceptor.ts`.

- Tests
  - A small test verifying the bypass behavior has been added at `backend/tests/test_dev_bypass.py`.

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
