# Budget Tracker Lite

A comprehensive budget tracking application with FastAPI backend and Angular frontend, featuring full unit test coverage.

## Project Structure

```
budget-tracker-lite/
├── backend/          # FastAPI Python backend
│   ├── app/          # Application code
│   │   ├── models/   # Database models
│   │   ├── routers/  # API endpoints
│   │   ├── services/ # Business logic
│   │   └── schemas/  # Pydantic schemas
│   └── tests/        # Backend tests (67 tests)
│       ├── test_api/       # API endpoint tests
│       ├── test_services/  # Service layer tests
│       ├── test_models/    # Model tests
│       └── test_integration.py  # Integration tests
└── frontend/         # Angular frontend
    └── src/app/
        ├── core/     # Services and models
        └── features/ # Components
```

## Backend (FastAPI/Python)

### Features
- RESTful API with FastAPI
- SQLAlchemy ORM with SQLite
- CRUD operations for Users, Categories, Beneficiaries, and Transactions
- Aggregation endpoints for reporting
- Image upload support for transactions

### Setup

```bash
cd backend
pip install -e ".[dev]"
```

### Running Tests

```bash
cd backend
pytest
```

All 67 backend tests cover:
- API endpoints (transactions, categories, beneficiaries, users, aggregations)
- Service layer (aggregation logic)
- Database models and relationships
- Integration tests for complete workflows

### Running the Server

```bash
cd backend
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`. API documentation is at `http://localhost:8000/docs`.

## Frontend (Angular)

### Features
- Angular 17 components and services
- HTTP client for API communication
- Reactive forms for data entry
- Filtering and reporting capabilities

### Setup

```bash
cd frontend
npm install
```

### Running Tests

```bash
cd frontend
npm test
```

Frontend tests cover:
- Service tests with HttpClient mocking (transaction, category, beneficiary, user services)
- Component tests with proper test module setup
- Form validation
- Data display and filtering

### Running the Application

```bash
cd frontend
npm start
```

The application will be available at `http://localhost:4200`.

## API Endpoints

### Users
- GET `/users/` - List all users
- POST `/users/` - Create user
- GET `/users/{id}` - Get user
- PUT `/users/{id}` - Update user
- DELETE `/users/{id}` - Delete user

### Categories
- GET `/categories/` - List all categories
- POST `/categories/` - Create category
- GET `/categories/{id}` - Get category
- PUT `/categories/{id}` - Update category
- DELETE `/categories/{id}` - Delete category

### Beneficiaries
- GET `/beneficiaries/` - List all beneficiaries
- POST `/beneficiaries/` - Create beneficiary
- GET `/beneficiaries/{id}` - Get beneficiary
- PUT `/beneficiaries/{id}` - Update beneficiary
- DELETE `/beneficiaries/{id}` - Delete beneficiary

### Transactions
- GET `/transactions/` - List transactions (with optional filters)
- POST `/transactions/` - Create transaction
- GET `/transactions/{id}` - Get transaction
- PUT `/transactions/{id}` - Update transaction
- DELETE `/transactions/{id}` - Delete transaction
- POST `/transactions/{id}/upload-image` - Upload receipt image

### Aggregations
- GET `/aggregations/summary` - Get summary with totals by category and beneficiary (with optional filters)

## Testing

### Backend Tests
```bash
cd backend
pytest -v
```

Coverage includes:
- ✅ 67 backend tests passing
- ✅ API endpoint validation
- ✅ Error handling
- ✅ Database relationships
- ✅ Service layer logic
- ✅ Integration workflows

### Frontend Tests
```bash
cd frontend
npm test
```

Coverage includes:
- ✅ Service tests with mocked HttpClient
- ✅ Component rendering
- ✅ Form validation
- ✅ User interactions
- ✅ Error handling

## CI/CD Ready

Both test suites are configured to run in CI environments:
- Backend: pytest with coverage reporting
- Frontend: Karma with ChromeHeadless for headless browser testing

## Development

1. Start the backend:
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

2. In another terminal, start the frontend:
   ```bash
   cd frontend
   npm start
   ```

3. Run tests during development:
   ```bash
   # Backend
   cd backend && pytest --watch

   # Frontend
   cd frontend && npm run test:watch
   ```
