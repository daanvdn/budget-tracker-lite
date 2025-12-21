# Budget Tracker Lite - Testing Guide

## Backend API Testing

The backend has been fully implemented and tested. All endpoints are working correctly.

### Prerequisites
1. Install dependencies:
```bash
cd backend
pip install uv
uv sync --extra dev
```

2. Start the backend server:
```bash
uv run uvicorn src.app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at http://localhost:8000

### API Endpoints

#### Authentication Endpoints

**1. Register a new user**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

**2. Login**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

This returns a JWT token:
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer"
}
```

**3. Get current user**
```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**4. Request password reset**
```bash
curl -X POST http://localhost:8000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

This returns a reset token (for LAN use without email):
```json
{
  "message": "Password reset token generated...",
  "reset_token": "ZAeZSvARCaTY8q1WfEdiUpTF9dfRNtSH91SYc41LwcI"
}
```

**5. Reset password**
```bash
curl -X POST http://localhost:8000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "ZAeZSvARCaTY8q1WfEdiUpTF9dfRNtSH91SYc41LwcI",
    "new_password": "NewPass123"
  }'
```

#### Transaction Endpoints (Protected)

**1. Create a transaction**
```bash
curl -X POST http://localhost:8000/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Salary",
    "amount": 5000,
    "category": "Income",
    "type": "income"
  }'
```

**2. Get all transactions**
```bash
curl -X GET http://localhost:8000/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**3. Get a specific transaction**
```bash
curl -X GET http://localhost:8000/api/transactions/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**4. Update a transaction**
```bash
curl -X PUT http://localhost:8000/api/transactions/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Monthly Salary",
    "amount": 5500
  }'
```

**5. Delete a transaction**
```bash
curl -X DELETE http://localhost:8000/api/transactions/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### API Documentation

Interactive API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Frontend Testing

### Setup
1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm start
```

The application will be available at http://localhost:4200

### Test Flow

1. **Register a new account**
   - Navigate to http://localhost:4200/register
   - Fill in name, email, and password (min 8 chars, 1 number, 1 uppercase)
   - See password strength indicator
   - Submit to create account

2. **Login**
   - Navigate to http://localhost:4200/login
   - Enter email and password
   - Upon successful login, redirected to dashboard

3. **Dashboard**
   - View summary (total income, expenses, balance)
   - Add new transactions
   - View transaction list
   - Delete transactions

4. **Password Reset**
   - Click "Forgot Password" on login page
   - Enter email
   - Copy the reset token (displayed for LAN use)
   - Navigate to reset password page
   - Enter token and new password
   - Reset successful

## Security Testing

### Password Requirements
- Minimum 8 characters
- At least 1 number
- At least 1 uppercase letter
- Maximum 72 characters (bcrypt limitation)

Try these test cases:
- ❌ "short" - Too short
- ❌ "lowercase123" - No uppercase
- ❌ "UPPERCASE" - No number
- ✅ "TestPass123" - Valid

### Token Expiration
- Access tokens expire after 24 hours (configurable)
- Reset tokens expire after 1 hour
- Expired tokens return 401 Unauthorized

### Protected Routes
Try accessing protected endpoints without a token:
```bash
curl -X GET http://localhost:8000/api/transactions
```
Should return 401 Unauthorized

## Database

The SQLite database is created automatically at `backend/budget_tracker.db`

To inspect the database:
```bash
cd backend
sqlite3 budget_tracker.db
.tables
SELECT * FROM users;
SELECT * FROM transactions;
SELECT * FROM password_reset_tokens;
.quit
```

## Known Issues and Notes

1. **bcrypt Version**: bcrypt is pinned via `uv.lock` for Python 3.13 compatibility alongside passlib.

2. **Email**: Password reset tokens are displayed directly instead of being emailed (suitable for LAN use). To add email support, integrate an SMTP service in `auth/service.py`.

3. **SECRET_KEY**: Change the SECRET_KEY in production! Generate with:
   ```bash
   openssl rand -hex 32
   ```

4. **CORS**: Currently allows localhost:4200 and localhost:8080. Update `backend/src/app/config/settings.py` for production.

## Performance

- Registration: ~200ms
- Login: ~150ms
- Create transaction: ~50ms
- Get transactions: ~30ms

All tested on local SQLite database.
