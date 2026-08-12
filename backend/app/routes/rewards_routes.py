from fastapi import APIRouter
from app.controllers import rewards_controller
from pydantic import BaseModel

router = APIRouter()

class RedeemRequest(BaseModel):
    rewardId: int

@router.get("/balance")
async def get_balance():
    return await rewards_controller.get_reward_balance()

@router.get("/")
async def get_rewards():
    return await rewards_controller.get_rewards()

@router.post("/redeem")
async def redeem_reward(req: RedeemRequest):
    return await rewards_controller.redeem_reward(req.rewardId)

@router.get("/history")
async def get_history():
    return await rewards_controller.get_redemption_history()
