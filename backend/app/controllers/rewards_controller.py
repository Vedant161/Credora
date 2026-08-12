from app.db.database import db
from fastapi import HTTPException
from fastapi.responses import JSONResponse
import math

COINS_PER_RUPEES = 100
MAX_COINS_PER_TRANSACTION = 100

async def get_reward_balance():
    try:
        earned_query = """
            SELECT
                COALESCE(
                    SUM(
                        LEAST(
                            FLOOR(
                                amount / $1
                            ),
                            $2
                        )
                    ),
                    0
                ) AS earned_coins
            FROM transactions
            WHERE UPPER(TRIM(status)) = 'SUCCESS'
        """
        
        redeemed_query = """
            SELECT
                COALESCE(
                    SUM(coins_spent),
                    0
                ) AS redeemed_coins
            FROM reward_redemptions
        """
        
        pool = await db.get_pool()
        async with pool.acquire() as conn:
            earned_row = await conn.fetchrow(earned_query, COINS_PER_RUPEES, MAX_COINS_PER_TRANSACTION)
            redeemed_row = await conn.fetchrow(redeemed_query)
            
            earned_coins = float(earned_row['earned_coins'])
            redeemed_coins = float(redeemed_row['redeemed_coins'])
            
            balance = max(earned_coins - redeemed_coins, 0)
            
            return {
                "earnedCoins": earned_coins,
                "redeemedCoins": redeemed_coins,
                "balance": balance
            }
    except Exception as e:
        print("Failed to calculate reward balance:", e)
        raise HTTPException(status_code=500, detail="Failed to calculate reward balance")

async def get_rewards():
    try:
        query = """
            SELECT
                id,
                name,
                description,
                coin_cost
            FROM rewards
            ORDER BY coin_cost ASC
        """
        pool = await db.get_pool()
        async with pool.acquire() as conn:
            rows = await conn.fetch(query)
            return {
                "data": [
                    {
                        "id": row['id'],
                        "name": row['name'],
                        "description": row['description'],
                        "coin_cost": int(row['coin_cost'])
                    } for row in rows
                ]
            }
    except Exception as e:
        print("Failed to fetch rewards:", e)
        raise HTTPException(status_code=500, detail="Failed to fetch rewards")

async def redeem_reward(reward_id: int):
    pool = await db.get_pool()
    async with pool.acquire() as conn:
        async with conn.transaction():
            try:
                await conn.execute("SELECT pg_advisory_xact_lock(123456789)")
                
                reward_query = """
                    SELECT
                        id,
                        name,
                        coin_cost
                    FROM rewards
                    WHERE id = $1
                """
                reward_row = await conn.fetchrow(reward_query, reward_id)
                
                if not reward_row:
                    return JSONResponse(status_code=404, content={"error": "Reward not found"})
                    
                earned_query = """
                    SELECT COALESCE(
                        SUM(
                            LEAST(
                                FLOOR(amount / $1),
                                $2
                            )
                        ),
                        0
                    ) AS earned_coins
                    FROM transactions
                    WHERE UPPER(TRIM(status)) = 'SUCCESS'
                """
                earned_row = await conn.fetchrow(earned_query, COINS_PER_RUPEES, MAX_COINS_PER_TRANSACTION)
                
                redeemed_query = """
                    SELECT COALESCE(
                        SUM(coins_spent),
                        0
                    ) AS redeemed_coins
                    FROM reward_redemptions
                """
                redeemed_row = await conn.fetchrow(redeemed_query)
                
                earned_coins = float(earned_row['earned_coins'])
                redeemed_coins = float(redeemed_row['redeemed_coins'])
                balance = earned_coins - redeemed_coins
                
                coin_cost = float(reward_row['coin_cost'])
                if balance < coin_cost:
                    return JSONResponse(status_code=400, content={
                        "error": "Insufficient coins",
                        "balance": balance,
                        "required": coin_cost
                    })
                    
                insert_query = """
                    INSERT INTO reward_redemptions (
                        reward_id,
                        coins_spent
                    )
                    VALUES ($1, $2)
                    RETURNING
                        id,
                        reward_id,
                        coins_spent,
                        redeemed_at
                """
                redemption_row = await conn.fetchrow(insert_query, reward_row['id'], coin_cost)
                
                new_balance = balance - coin_cost
                
                return JSONResponse(status_code=201, content={
                    "message": "Reward redeemed successfully",
                    "redemption": {
                        "id": redemption_row["id"],
                        "reward_id": redemption_row["reward_id"],
                        "coins_spent": float(redemption_row["coins_spent"]),
                        "redeemed_at": redemption_row["redeemed_at"].isoformat() if hasattr(redemption_row["redeemed_at"], 'isoformat') else str(redemption_row["redeemed_at"])
                    },
                    "reward": {
                        "id": reward_row['id'],
                        "name": reward_row['name'],
                        "coinCost": coin_cost
                    },
                    "balance": new_balance
                })
            except Exception as e:
                print("Failed to redeem reward:", e)
                return JSONResponse(status_code=500, content={"error": "Failed to redeem reward"})

async def get_redemption_history():
    try:
        query = """
            SELECT
                rr.id,
                rr.reward_id,
                rr.coins_spent,
                rr.redeemed_at,
                r.name AS reward_name,
                r.description AS reward_description
            FROM reward_redemptions rr
            INNER JOIN rewards r
                ON r.id = rr.reward_id
            ORDER BY rr.redeemed_at DESC
        """
        pool = await db.get_pool()
        async with pool.acquire() as conn:
            rows = await conn.fetch(query)
            return {
                "data": [
                    {
                        "id": row['id'],
                        "reward_id": row['reward_id'],
                        "coins_spent": float(row['coins_spent']),
                        "redeemed_at": row['redeemed_at'].isoformat() if hasattr(row['redeemed_at'], 'isoformat') else str(row['redeemed_at']),
                        "reward_name": row['reward_name'],
                        "reward_description": row['reward_description']
                    } for row in rows
                ]
            }
    except Exception as e:
        print("Failed to fetch redemption history:", e)
        raise HTTPException(status_code=500, detail="Failed to fetch redemption history")
