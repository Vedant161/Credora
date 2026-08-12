from app.db.database import db
from fastapi import HTTPException

async def get_dashboard_stats():
    try:
        query = """
            SELECT
                COUNT(*) AS total_transactions,
                COALESCE(
                    SUM(
                        CASE
                            WHEN UPPER(TRIM(status)) = 'SUCCESS'
                            THEN amount
                            ELSE 0
                        END
                    ),
                    0
                ) AS total_spend,
                COUNT(*) FILTER (
                    WHERE UPPER(TRIM(status)) = 'SUCCESS'
                ) AS successful_transactions,
                COUNT(*) FILTER (
                    WHERE UPPER(TRIM(status)) = 'FAILED'
                ) AS failed_transactions
            FROM transactions
        """
        pool = await db.get_pool()
        async with pool.acquire() as conn:
            row = await conn.fetchrow(query)
            
            total_transactions = int(row['total_transactions'])
            successful_transactions = int(row['successful_transactions'] or 0)
            failed_transactions = int(row['failed_transactions'] or 0)
            total_spend = float(row['total_spend'])
            
            success_rate = 0
            if total_transactions > 0:
                success_rate = (successful_transactions / total_transactions) * 100
                
            return {
                "totalTransactions": total_transactions,
                "totalSpend": total_spend,
                "successfulTransactions": successful_transactions,
                "failedTransactions": failed_transactions,
                "successRate": success_rate
            }
    except Exception as e:
        print("Failed to fetch dashboard stats:", e)
        raise HTTPException(status_code=500, detail="Failed to fetch dashboard statistics")

async def get_monthly_spending():
    try:
        query = """
            SELECT
                TO_CHAR(
                    DATE_TRUNC('month', timestamp),
                    'YYYY-MM'
                ) AS month,
                COALESCE(
                    SUM(amount),
                    0
                ) AS total
            FROM transactions
            WHERE UPPER(TRIM(status)) = 'SUCCESS'
            GROUP BY DATE_TRUNC('month', timestamp)
            ORDER BY DATE_TRUNC('month', timestamp);
        """
        pool = await db.get_pool()
        async with pool.acquire() as conn:
            rows = await conn.fetch(query)
            return [{"month": row['month'], "total": float(row['total'])} for row in rows]
    except Exception as e:
        print("Failed to fetch monthly spending:", e)
        raise HTTPException(status_code=500, detail="Failed to fetch monthly spending")

async def get_category_spending():
    try:
        query = """
            SELECT
                COALESCE(
                    NULLIF(TRIM(category), ''),
                    'Other'
                ) AS category,
                COALESCE(
                    SUM(amount),
                    0
                ) AS total
            FROM transactions
            WHERE UPPER(TRIM(status)) = 'SUCCESS'
            GROUP BY
                COALESCE(
                    NULLIF(TRIM(category), ''),
                    'Other'
                )
            ORDER BY total DESC;
        """
        pool = await db.get_pool()
        async with pool.acquire() as conn:
            rows = await conn.fetch(query)
            return [{"category": row['category'], "total": float(row['total'])} for row in rows]
    except Exception as e:
        print("Failed to fetch category spending:", e)
        raise HTTPException(status_code=500, detail="Failed to fetch category spending")
