# Budget Tracker Lite - Development Guide

## Quick Start

### Local Development

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install uv
uv pip install -r pyproject.toml

# Create data directory
mkdir -p ../data/uploads

# Run the backend
uvicorn src.app.main:app --reload
```

Backend will be available at http://localhost:8000
API documentation at http://localhost:8000/docs

#### Frontend
```bash
cd frontend
npm install
npm start
```

Frontend will be available at http://localhost:4200

### Docker Development

```bash
# Build and start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

## Project Architecture

### Backend Architecture

The backend follows a clean architecture pattern:

```
backend/
├── src/app/
│   ├── models/          # SQLAlchemy ORM models
│   ├── schemas/         # Pydantic validation schemas
│   ├── routers/         # FastAPI route handlers
│   ├── services/        # Business logic
│   ├── database.py      # Database configuration
│   ├── config.py        # Application settings
│   └── main.py          # FastAPI app initialization
```

**Key Components:**

- **Models**: Define the database schema using SQLAlchemy ORM
- **Schemas**: Pydantic models for request/response validation
- **Routers**: API endpoints organized by resource
- **Services**: Reusable business logic (e.g., aggregations)

### Frontend Architecture

The frontend uses Angular 17+ standalone components:

```
frontend/src/app/
├── core/services/       # API client services
├── features/            # Feature modules
│   ├── transactions/    # Transaction management
│   ├── categories/      # Category management
│   ├── beneficiaries/   # Beneficiary management
│   ├── users/           # User management
│   └── reports/         # Aggregation reports
├── shared/
│   ├── models/          # TypeScript interfaces
│   └── components/      # Shared UI components
├── app.component.ts     # Root component with navigation
└── app.routes.ts        # Route configuration
```

**Key Features:**

- Standalone components (no NgModules)
- Angular Material for UI
- Reactive forms for data entry
- Service-based API communication

## Database Schema

### Tables

1. **users**
   - id (PK)
   - name
   - created_at

2. **categories**
   - id (PK)
   - name (unique)
   - type (expense|income|both)

3. **beneficiaries**
   - id (PK)
   - name (unique)

4. **transactions**
   - id (PK)
   - type (expense|income)
   - amount
   - description
   - transaction_date
   - image_path (optional)
   - category_id (FK)
   - beneficiary_id (FK)
   - created_by_user_id (FK)
   - created_at

## API Documentation

Full API documentation is available at http://localhost:8000/docs when running the backend.

### Key Endpoints

**Transactions**
- `GET /api/transactions` - List with filters (date range, type, category, beneficiary)
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/{id}` - Get single transaction
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction

**Aggregations**
- `GET /api/aggregations/summary` - Get summary with filters

**Categories**
- Standard CRUD operations at `/api/categories`

**Beneficiaries**
- Standard CRUD operations at `/api/beneficiaries`

**Users**
- Standard CRUD operations at `/api/users`

**Images**
- `POST /api/images/upload` - Upload receipt image
- `GET /api/images/{filename}` - Retrieve image

## Configuration

### Backend Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL=sqlite+aiosqlite:///data/budget_tracker.db
UPLOAD_DIR=/data/uploads
MAX_UPLOAD_SIZE=10485760  # 10MB
CORS_ORIGINS=["http://localhost:4200", "http://localhost"]
```

### Frontend Environment

Edit `frontend/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};
```

## Testing

### Backend Tests

```bash
cd backend
source venv/bin/activate
pytest
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Deployment

### Docker Compose Deployment

1. Update environment variables in `docker-compose.yml`
2. Run `docker compose up -d`
3. Access via http://your-server-ip

### Synology NAS Deployment

1. Enable SSH and Docker on Synology
2. Copy project to NAS
3. SSH into NAS:
   ```bash
   cd /path/to/project
   docker compose up -d
   ```
4. Access via NAS IP address

The application will automatically:
- Create the database on first run
- Seed sample data (users, categories, beneficiaries, transactions)
- Persist data in the `./data` directory

## Seed Data

On first run, the application creates:

**Users:**
- Parent 1
- Parent 2

**Categories:**
- Groceries (expense)
- Gifts (expense)
- School (expense)
- Entertainment (expense)
- Healthcare (expense)
- Transportation (expense)
- Utilities (expense)
- Salary (income)
- Birthday Money (income)
- Allowance (both)

**Beneficiaries:**
- Household
- Child A
- Child B

**Sample Transactions:**
- Weekly grocery shopping (expense)
- Birthday gift (expense)
- Monthly salary (income)
- Birthday money (income)

## Troubleshooting

### Backend won't start
- Ensure the `data` directory exists and is writable
- Check database file permissions
- Verify all dependencies are installed: `uv pip install -r pyproject.toml`

### Frontend build fails
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version (requires 20+)
- Verify Angular CLI is installed: `npm install -g @angular/cli`

### Docker issues
- Ensure Docker daemon is running
- Check port conflicts (8000, 80)
- View logs: `docker compose logs -f`

### Database locked errors
- Stop all backend instances
- Remove data/budget_tracker.db-journal if it exists
- Restart backend

## Future Enhancements

Potential features to add:

- [ ] Recurring transactions
- [ ] Budget planning and limits
- [ ] Export to CSV/PDF
- [ ] Charts and visualizations
- [ ] Multiple currencies
- [ ] Receipt OCR
- [ ] Mobile app
- [ ] Backup/restore functionality

## License

MIT
