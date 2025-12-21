from app.database.database import Base, engine
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import (
    aggregations_router,
    beneficiaries_router,
    categories_router,
    transactions_router,
    users_router,
)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Budget Tracker Lite", version="0.1.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users_router)
app.include_router(categories_router)
app.include_router(beneficiaries_router)
app.include_router(transactions_router)
app.include_router(aggregations_router)


@app.get("/")
def read_root():
    return {"message": "Budget Tracker Lite API"}
