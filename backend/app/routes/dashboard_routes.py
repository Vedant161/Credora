from fastapi import APIRouter
from app.controllers import dashboard_controller

router = APIRouter()

@router.get("/stats")
async def get_stats():
    return await dashboard_controller.get_dashboard_stats()

@router.get("/monthly-spending")
async def get_monthly_spending():
    return await dashboard_controller.get_monthly_spending()

@router.get("/category-spending")
async def get_category_spending():
    return await dashboard_controller.get_category_spending()
