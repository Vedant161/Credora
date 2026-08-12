from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import uvicorn
import os

from app.db.database import db
from app.routes import transaction_routes, dashboard_routes, rewards_routes

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/api/health")
async def health():
    return {"status": "ok"}

app.include_router(transaction_routes.router, prefix="/api/transactions")
app.include_router(dashboard_routes.router, prefix="/api/dashboard")
app.include_router(rewards_routes.router, prefix="/api/rewards")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
