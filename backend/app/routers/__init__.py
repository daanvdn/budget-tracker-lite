from .users import router as users_router
from .categories import router as categories_router
from .beneficiaries import router as beneficiaries_router
from .transactions import router as transactions_router
from .aggregations import router as aggregations_router

__all__ = [
    "users_router",
    "categories_router",
    "beneficiaries_router",
    "transactions_router",
    "aggregations_router",
]
