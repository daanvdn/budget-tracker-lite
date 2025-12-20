# Budget Tracker Lite

A lean, self-hosted budget tracking application for household use. Track expenses and income with support for aggregations and filtering.

## Features

- ✅ Track both expenses and income in a unified transaction system
- ✅ Manage categories, beneficiaries, and users
- ✅ Filter transactions by date range, category, beneficiary, and type
- ✅ View aggregated summaries and reports
- ✅ Mobile-responsive design with Angular Material
- ✅ Optional image uploads for receipts
- ✅ No authentication required (designed for private LAN use)

## Tech Stack

- **Frontend**: Angular 17+ (standalone components) + Angular Material
- **Backend**: FastAPI (Python)
- **Database**: SQLite
- **Dependency Management**: uv (for Python)
- **Deployment**: Docker Compose

## Quick Start

### Prerequisites

- Docker and Docker Compose
- (Optional) Node.js 20+ and Python 3.11+ for local development

### Run with Docker Compose

1. Clone the repository:
```bash
git clone https://github.com/daanvdn/budget-tracker-lite.git
cd budget-tracker-lite
```

2. Start the application:
```bash
docker-compose up -d
```

3. Access the application:
- Frontend: http://localhost
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

The database and uploaded images will be stored in the `./data` directory.

### Stop the application:
```bash
docker-compose down
```

## Development

### Backend Development

```bash
cd backend

# Install uv if not already installed
pip install uv

# Install dependencies
uv pip install -r pyproject.toml

# Run the backend
uvicorn src.app.main:app --reload
```

Backend will be available at http://localhost:8000

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm start
```

Frontend will be available at http://localhost:4200

## Project Structure

```
budget-tracker-lite/
├── docker-compose.yml          # Docker Compose configuration
├── README.md                   # This file
├── backend/                    # FastAPI backend
│   ├── Dockerfile
│   ├── pyproject.toml         # Python dependencies (uv managed)
│   └── src/app/
│       ├── main.py            # FastAPI application
│       ├── config.py          # Configuration
│       ├── database.py        # Database setup
│       ├── models/            # SQLAlchemy models
│       ├── schemas/           # Pydantic schemas
│       ├── routers/           # API endpoints
│       └── services/          # Business logic
├── frontend/                  # Angular frontend
│   ├── Dockerfile
│   ├── nginx.conf            # Nginx configuration
│   ├── package.json
│   └── src/app/
│       ├── core/services/    # API services
│       ├── features/         # Feature components
│       └── shared/           # Shared models and components
└── data/                     # SQLite DB + uploaded images (mounted volume)
```

## Data Models

### Users
- Track who creates transactions
- Pre-seeded with sample users

### Categories
- Define expense and income categories
- Can be used for expenses, income, or both
- Pre-seeded with common categories (groceries, gifts, salary, etc.)

### Beneficiaries
- Track who transactions are for (e.g., children, household)
- Pre-seeded with sample beneficiaries

### Transactions
- Unified model for both expenses and income
- Includes amount, description, date, and optional image
- Links to category, beneficiary, and creating user

## API Endpoints

### Transactions
- `GET /api/transactions` - List with filters
- `POST /api/transactions` - Create
- `GET /api/transactions/{id}` - Get one
- `PUT /api/transactions/{id}` - Update
- `DELETE /api/transactions/{id}` - Delete

### Aggregations
- `GET /api/aggregations/summary` - Get totals with filters

### Categories
- `GET /api/categories` - List all
- `POST /api/categories` - Create
- `PUT /api/categories/{id}` - Update
- `DELETE /api/categories/{id}` - Delete

### Beneficiaries
- `GET /api/beneficiaries` - List all
- `POST /api/beneficiaries` - Create
- `PUT /api/beneficiaries/{id}` - Update
- `DELETE /api/beneficiaries/{id}` - Delete

### Users
- `GET /api/users` - List all
- `POST /api/users` - Create
- `PUT /api/users/{id}` - Update
- `DELETE /api/users/{id}` - Delete

### Images
- `POST /api/images/upload` - Upload image
- `GET /api/images/{filename}` - Serve image

## Usage Examples

### Example Query
"How much did I spend on Child A for gifts in the past month?"

1. Go to the **Reports** page
2. Set filters:
   - Beneficiary: Child A
   - Category: Gifts
   - Transaction Type: Expense
   - Click "Last Month" button
3. View the aggregated summary

## Configuration

### Environment Variables

Backend configuration can be customized via environment variables or `.env` file:

- `DATABASE_URL` - Database connection string (default: `sqlite+aiosqlite:///data/budget_tracker.db`)
- `UPLOAD_DIR` - Directory for uploaded images (default: `/data/uploads`)
- `MAX_UPLOAD_SIZE` - Maximum file upload size in bytes (default: 10MB)
- `CORS_ORIGINS` - Allowed CORS origins (default: `["http://localhost:4200", "http://localhost"]`)

## Deployment on Synology NAS

1. Enable SSH and Docker on your Synology NAS
2. Copy the project files to your NAS
3. SSH into your NAS and navigate to the project directory
4. Run `docker-compose up -d`
5. Access via your NAS's IP address on port 80

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
