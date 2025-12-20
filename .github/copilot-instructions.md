# GitHub Copilot Instructions for Budget Tracker Lite

## Project Overview

Budget Tracker Lite is a lean, self-hosted budget tracking application for household use. Track expenses and income with support for aggregations and filtering.

**Tech Stack:**
- **Frontend**: Angular 17+ (standalone components) + Angular Material
- **Backend**: FastAPI (Python 3.11+)
- **Database**: SQLite with SQLAlchemy ORM (async)
- **Package Management**: uv (Python), npm (Node.js)
- **Deployment**: Docker Compose

## Code Style and Conventions

### Backend (Python/FastAPI)

#### General Python Style
- Follow PEP 8 style guidelines
- Use type hints for all function parameters and return types
- Use async/await for all database operations
- Prefer descriptive variable names over abbreviations

#### Project Structure
- **Models** (`backend/src/app/models/`): SQLAlchemy ORM models for database schema
- **Schemas** (`backend/src/app/schemas/`): Pydantic models for request/response validation
- **Routers** (`backend/src/app/routers/`): FastAPI route handlers organized by resource
- **Services** (`backend/src/app/services/`): Reusable business logic (e.g., aggregations)
- **Tests** (`backend/tests/`): Pytest-based tests organized by test type

#### Database and Models
- Use SQLAlchemy 2.0 async patterns with `AsyncSession`
- Use enum types for fixed categories (e.g., `CategoryType`, `TransactionType`)
- Always define relationships with `relationship()` for foreign keys
- Use `Mapped` type hints for SQLAlchemy models
- Database operations should use `AsyncSessionLocal` from `database.py`

#### API Design
- Follow RESTful conventions for endpoints
- Use Pydantic schemas for validation
- Return appropriate HTTP status codes (200, 201, 404, 422)
- Include proper error handling with FastAPI's `HTTPException`
- Use dependency injection for database sessions: `db: AsyncSession = Depends(get_db)`
- Organize routes by resource in separate router files

#### Testing
- Write pytest tests for all new features
- Use the test fixtures from `conftest.py` (test_db, test_client, sample data fixtures)
- Test database is in-memory SQLite
- Organize tests by type: `test_api/`, `test_services/`, `test_models/`, `test_integration.py`
- Run tests with: `cd backend && pytest`
- Aim for comprehensive coverage of CRUD operations, validation, and error handling

### Frontend (Angular/TypeScript)

#### General TypeScript Style
- Use TypeScript strict mode
- Prefer interfaces over types for object definitions
- Use `const` for immutable values, `let` for mutable (avoid `var`)
- Follow Angular style guide conventions

#### Project Structure
- **Core Services** (`frontend/src/app/core/services/`): HTTP API client services
- **Features** (`frontend/src/app/features/`): Feature modules organized by domain
- **Shared** (`frontend/src/app/shared/`): Shared models and reusable components
- Use standalone components (no NgModules)

#### Component Design
- Use standalone components with explicit imports
- Follow reactive patterns with RxJS observables
- Use Angular Material components for UI consistency
- Implement OnInit for initialization logic
- Use reactive forms (`FormBuilder`, `FormGroup`) for data entry

#### Service Layer
- Use HttpClient for API communication
- Define model interfaces in `shared/models/`
- Use environment variables for API URL configuration
- Handle errors with RxJS operators (e.g., `catchError`)
- Use dependency injection for services

#### Testing
- Write Jasmine/Karma tests for all components and services
- Use `HttpClientTestingModule` for mocking HTTP calls
- Use Jasmine spies for service mocking
- Test component creation, data binding, and user interactions
- Run tests with: `cd frontend && npm test`
- Tests should run in headless Chrome for CI compatibility

## Development Workflow

### Setting Up Development Environment

**Backend:**
```bash
cd backend
pip install uv
uv pip install -r pyproject.toml
mkdir -p ../data/uploads
uvicorn src.app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

**Docker (full stack):**
```bash
docker compose up -d
```

### Running Tests

**Backend:**
```bash
cd backend
pytest                    # Run all tests
pytest -v                 # Verbose output
pytest --cov=app         # With coverage
```

**Frontend:**
```bash
cd frontend
npm test                  # Run tests in headless mode
```

### Building for Production

**Backend:**
- Uses Docker with multi-stage builds
- Runs with uvicorn in production mode

**Frontend:**
- Build with: `npm run build`
- Serves static files via Nginx in production

## Key Architecture Patterns

### Backend Patterns
- **Clean Architecture**: Separation of models, schemas, routers, and services
- **Dependency Injection**: FastAPI's dependency injection for database sessions
- **Async/Await**: All database operations are asynchronous
- **Pydantic Validation**: Request/response validation using Pydantic schemas
- **Database Migrations**: Alembic for schema changes (if needed)

### Frontend Patterns
- **Standalone Components**: Angular 17+ pattern (no NgModules)
- **Reactive Forms**: FormBuilder and validation
- **Service Layer**: HTTP services for API communication
- **Material Design**: Angular Material for consistent UI
- **Routing**: Angular Router with lazy loading support

## Data Models

### Core Entities
- **Users**: Track who creates transactions
- **Categories**: Expense/income categories (type: expense|income|both)
- **Beneficiaries**: Who transactions are for (e.g., children, household)
- **Transactions**: Unified model for expenses and income with amount, date, description, optional image

### Relationships
- Transactions → Category (many-to-one)
- Transactions → Beneficiary (many-to-one)
- Transactions → User (many-to-one, creator)

## API Endpoints

All endpoints are prefixed with `/api`:

- **Transactions**: `/api/transactions` (CRUD + filtering)
- **Categories**: `/api/categories` (CRUD)
- **Beneficiaries**: `/api/beneficiaries` (CRUD)
- **Users**: `/api/users` (CRUD)
- **Aggregations**: `/api/aggregations/summary` (GET with filters)
- **Images**: `/api/images/upload` (POST), `/api/images/{filename}` (GET)

## Common Tasks

### Adding a New Feature
1. Define or update database models in `backend/src/app/models/`
2. Create/update Pydantic schemas in `backend/src/app/schemas/`
3. Implement API endpoints in `backend/src/app/routers/`
4. Add business logic to `backend/src/app/services/` if needed
5. Write backend tests in `backend/tests/`
6. Define TypeScript interfaces in `frontend/src/app/shared/models/`
7. Create/update services in `frontend/src/app/core/services/`
8. Implement UI components in `frontend/src/app/features/`
9. Write frontend tests for new components/services
10. Update documentation if needed

### Adding a New API Endpoint
1. Create or update router file in `backend/src/app/routers/`
2. Define Pydantic schemas for request/response
3. Implement endpoint with proper async database operations
4. Include error handling
5. Add tests in `backend/tests/test_api/`
6. Update frontend service to call new endpoint
7. Test integration

### Modifying Database Schema
1. Update SQLAlchemy models in `backend/src/app/models/`
2. Update related Pydantic schemas
3. Consider using Alembic migrations for production deployments
4. Update seed data in `main.py` if applicable
5. Update tests to reflect schema changes

## Testing Guidelines

### Backend Testing
- Test all CRUD operations
- Test validation (required fields, data types, constraints)
- Test error cases (404, 400, 422)
- Test filtering and query parameters
- Test business logic in services
- Use fixtures for test data setup

### Frontend Testing
- Test component creation and initialization
- Test service HTTP calls with mocked responses
- Test form validation
- Test user interactions (clicks, input)
- Test conditional rendering
- Test error handling

## Security Considerations

- No authentication required (designed for private LAN use)
- Validate all user inputs with Pydantic schemas
- Sanitize file uploads (images only, size limits)
- Use SQLAlchemy ORM to prevent SQL injection
- CORS configured for allowed origins only

## Documentation

- **README.md**: Quick start and overview
- **DEVELOPMENT.md**: Detailed development guide
- **TESTING.md**: Test coverage and running tests
- Keep documentation up-to-date with code changes
- Document complex business logic in code comments

## Preferred Libraries and Tools

### Backend
- **FastAPI**: Web framework
- **SQLAlchemy**: ORM (async mode)
- **Pydantic**: Data validation
- **pytest**: Testing framework
- **uvicorn**: ASGI server
- **uv**: Python package manager

### Frontend
- **Angular**: Framework (v17+)
- **Angular Material**: UI components
- **RxJS**: Reactive programming
- **Jasmine/Karma**: Testing framework

## CI/CD

- Tests should pass before merging
- Backend: `pytest --cov=app`
- Frontend: `npm test -- --browsers=ChromeHeadless --watch=false`
- Docker builds should succeed
- Maintain clean commit history

## Notes for AI Coding Agents

- When making database changes, always update both models and schemas
- Follow the existing project structure strictly
- Write tests for new features before marking work complete
- Use existing patterns and conventions from the codebase
- Check `DEVELOPMENT.md` and `TESTING.md` for detailed workflows
- When in doubt, examine similar existing code for reference
- All database operations must be async (use `async def` and `await`)
- Use dependency injection for database sessions (don't create sessions manually)
- Frontend components should be standalone (not using NgModules)
