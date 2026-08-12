from app.db.database import db
from fastapi import HTTPException
import math

async def get_transactions(
    page: int, limit: int, search: str, category: str, status: str, paymentMethod: str,
    minAmount: float, maxAmount: float, startDate: str, endDate: str, sortBy: str, sortOrder: str
):
    try:
        page = max(page, 1)
        limit = min(max(limit, 1), 100)
        offset = (page - 1) * limit
        
        search = search.strip() if search else ""
        category = category.strip() if category else ""
        status = status.strip().upper() if status else ""
        paymentMethod = paymentMethod.strip() if paymentMethod else ""
        
        conditions = []
        values = []
        
        def add_condition(cond, val):
            values.append(val)
            conditions.append(cond.replace('?', f'${len(values)}'))
            
        if search:
            values.append(f"%{search}%")
            values.append(f"%{search}%")
            conditions.append(f"(merchant ILIKE ${len(values)-1} OR id ILIKE ${len(values)})")
            
        if category:
            add_condition("category = ?", category)
            
        if status:
            add_condition("status = ?", status)
            
        if paymentMethod:
            add_condition("payment_method = ?", paymentMethod)
            
        if minAmount is not None:
            add_condition("amount >= ?", minAmount)
            
        if maxAmount is not None:
            add_condition("amount <= ?", maxAmount)
            
        if startDate:
            add_condition("timestamp >= ?::timestamp", startDate)
            
        if endDate:
            add_condition("timestamp < (?::date + INTERVAL '1 day')", endDate)
            
        where_clause = ""
        if conditions:
            where_clause = "WHERE " + " AND ".join(conditions)
            
        allowed_sort_columns = {
            "date": "timestamp",
            "timestamp": "timestamp",
            "amount": "amount",
            "merchant": "merchant",
            "status": "status",
        }
        
        order_column = allowed_sort_columns.get(sortBy, "timestamp")
        order_direction = "ASC" if sortOrder.lower() == "asc" else "DESC"
        
        count_query = f"SELECT COUNT(*) AS total FROM transactions {where_clause}"
        
        pool = await db.get_pool()
        async with pool.acquire() as conn:
            total_row = await conn.fetchrow(count_query, *values)
            total = int(total_row['total'])
            
            data_values = list(values)
            data_values.append(limit)
            data_values.append(offset)
            
            data_query = f"""
                SELECT
                    id,
                    timestamp,
                    merchant,
                    category,
                    amount,
                    currency,
                    status,
                    payment_method
                FROM transactions
                {where_clause}
                ORDER BY {order_column} {order_direction}
                LIMIT ${len(values) + 1}
                OFFSET ${len(values) + 2}
            """
            
            rows = await conn.fetch(data_query, *data_values)
            
            data = []
            for row in rows:
                data.append({
                    "id": row['id'],
                    "timestamp": row['timestamp'].isoformat() if hasattr(row['timestamp'], 'isoformat') else str(row['timestamp']),
                    "merchant": row['merchant'],
                    "category": row['category'],
                    "amount": float(row['amount']),
                    "currency": row['currency'],
                    "status": row['status'],
                    "payment_method": row['payment_method']
                })
                
            return {
                "data": data,
                "pagination": {
                    "page": page,
                    "limit": limit,
                    "total": total,
                    "totalPages": math.ceil(total / limit)
                }
            }
    except Exception as e:
        print("Failed to fetch transactions:", e)
        raise HTTPException(status_code=500, detail="Failed to fetch transactions")
