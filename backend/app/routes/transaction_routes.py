from fastapi import APIRouter
from app.controllers import transaction_controller

router = APIRouter()

@router.get("/")
async def get_transactions(
    page: int = 1,
    limit: int = 20,
    search: str = "",
    category: str = "",
    status: str = "",
    paymentMethod: str = "",
    minAmount: float = None,
    maxAmount: float = None,
    startDate: str = "",
    endDate: str = "",
    sortBy: str = "timestamp",
    sortOrder: str = "desc"
):
    return await transaction_controller.get_transactions(
        page, limit, search, category, status, paymentMethod,
        minAmount, maxAmount, startDate, endDate, sortBy, sortOrder
    )
