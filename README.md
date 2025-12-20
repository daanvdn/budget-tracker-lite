# Budget Tracker Lite

A simple budget tracking application with user authentication, built with FastAPI (backend) and Angular (frontend).

## Features

### Authentication
- ✅ User registration with password strength validation
- ✅ Login with JWT tokens
- ✅ Password reset functionality (with token display for LAN use)
- ✅ Protected API endpoints and routes
- ✅ Automatic token management and refresh handling

### Budget Tracking
- ✅ Add income and expense transactions
- ✅ View transaction history
- ✅ Track total income, expenses, and balance
- ✅ Categorize transactions
- ✅ Delete transactions

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: ORM for database operations
- **SQLite**: Database (easily swappable with PostgreSQL/MySQL)
- **Passlib**: Password hashing with bcrypt
- **Python-JOSE**: JWT token generation and validation
- **Pydantic**: Data validation

### Frontend
- **Angular 17**: Modern web framework with standalone components
- **RxJS**: Reactive programming
- **TypeScript**: Type-safe development
- **CSS**: Custom styling

## Project Structure

```
budget-tracker-lite/
├── backend/              # FastAPI backend
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/         # Authentication module
│   │   │   ├── transactions/ # Transactions module
│   │   │   ├── models/       # Database models
│   │   │   ├── database/     # Database configuration
│   │   │   └── config/       # Application settings
│   │   └── main.py          # Application entry point
│   └── pyproject.toml       # Python dependencies
│
└── frontend/            # Angular frontend
    ├── src/
    │   └── app/
    │       ├── core/           # Core services, guards, interceptors
    │       └── features/       # Feature modules (auth, transactions)
    └── package.json         # Node.js dependencies
```

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Poetry (for Python dependency management)
- npm (comes with Node.js)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Poetry (if not already installed):
```bash
curl -sSL https://install.python-poetry.org | python3 -
```

3. Install dependencies:
```bash
poetry install
```

4. Create environment configuration:
```bash
cp .env.example .env
```

5. Generate a secure SECRET_KEY:
```bash
openssl rand -hex 32
```
Update the `SECRET_KEY` in `.env` with the generated value.

6. Run the backend server:
```bash
poetry run python src/main.py
```

The API will be available at http://localhost:8000
- API docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm start
```

The application will be available at http://localhost:4200

## API Endpoints

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

## Security Features

1. **Password Security**
   - Passwords hashed with bcrypt
   - Minimum 8 characters
   - Requires at least 1 number and 1 uppercase letter
   - Never stored in plain text

2. **JWT Authentication**
   - Tokens expire after 24 hours (configurable)
   - Secure token generation with HS256 algorithm
   - Automatic token validation on protected routes

3. **Password Reset**
   - Reset tokens expire after 1 hour
   - One-time use tokens
   - Secure random token generation
   - For LAN use: tokens displayed directly (email integration optional)

4. **API Security**
   - CORS enabled for configured origins
   - All transaction endpoints require authentication
   - 401 errors automatically redirect to login

## Development

### Backend Development
- The backend uses SQLite by default for easy development
- Database tables are created automatically on first run
- API documentation is auto-generated via FastAPI

### Frontend Development
- Uses Angular standalone components (no NgModules)
- Reactive forms for all user inputs
- Password strength indicator on registration
- Auth guard prevents unauthorized access
- HTTP interceptor automatically adds JWT tokens

## CI/CD

This project includes comprehensive GitHub Actions workflows for continuous integration:

### Workflows

- **CI** (`ci.yml`) - Runs all checks on push/PR to main and develop branches
  - Backend unit tests
  - Backend linting (flake8)
  - Frontend unit tests
  - Docker build verification

- **Backend Tests** (`backend-tests.yml`) - Runs pytest with coverage
- **Frontend Tests** (`frontend-tests.yml`) - Runs Angular/Karma tests with ChromeHeadless
- **Backend Linter** (`backend-lint.yml`) - Checks code quality with flake8, black, and isort
- **Docker Build** (`docker-build.yml`) - Builds and verifies Docker images for both frontend and backend

### Running Tests Locally

**Backend:**
```bash
cd backend
pip install -e ".[dev]"
pytest -v --cov=src
```

**Frontend:**
```bash
cd frontend
npm install
npm test -- --browsers=ChromeHeadless --watch=false
```

**Linting:**
```bash
cd backend
pip install flake8 black isort
flake8 src tests --max-line-length=120
black --check --line-length=120 src tests
isort --check-only --profile=black src tests
```

**Docker Build:**
```bash
docker-compose build
```

## Configuration

### Backend Configuration (backend/.env)
```env
DATABASE_URL=sqlite:///./budget_tracker.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
RESET_TOKEN_EXPIRE_MINUTES=60
```

### Frontend Configuration
The API URL is configured in each service. To change:
- Update `apiUrl` in `auth.service.ts`
- Update `apiUrl` in `transaction.service.ts`

## Testing

### Test the Backend
```bash
cd backend
poetry run pytest
```

### Test the Frontend
```bash
cd frontend
npm test
```

## Production Deployment

### Backend
1. Use a production database (PostgreSQL recommended)
2. Set a strong SECRET_KEY
3. Enable HTTPS
4. Configure proper CORS origins
5. Consider adding rate limiting
6. Use a production WSGI server (uvicorn with gunicorn)

### Frontend
1. Build for production: `npm run build`
2. Serve the `dist/` folder with a web server
3. Configure proper API URL for production
4. Enable HTTPS

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
