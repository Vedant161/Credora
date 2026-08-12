import json
import os
import asyncio
from datetime import datetime, timezone
import re
from app.db.database import db

async def seed():
    file_path = os.path.join(os.getcwd(), "data", "transactions.json")
    
    with open(file_path, "r", encoding="utf-8") as f:
        transactions = json.load(f)
        
    def normalize_status(status):
        return status.strip().upper()
        
    def normalize_category(category):
        if not category or not str(category).strip():
            return None
        return str(category).strip()
        
    def normalize_timestamp(ts):
        if isinstance(ts, (int, float)):
            return datetime.fromtimestamp(ts / 1000.0, tz=timezone.utc)
            
        ts_str = str(ts).strip()
        if ts_str.isdigit() and len(ts_str) == 13:
            return datetime.fromtimestamp(int(ts_str) / 1000.0, tz=timezone.utc)
            
        # DD/MM/YYYY HH:mm:ss
        match = re.match(r"^(\d{2})/(\d{2})/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$", ts_str)
        if match:
            day, month, year, hours, minutes, seconds = match.groups()
            return datetime(int(year), int(month), int(day), int(hours), int(minutes), int(seconds), tzinfo=timezone.utc)
            
        try:
            return datetime.fromisoformat(ts_str.replace('Z', '+00:00'))
        except:
            raise ValueError(f"Invalid timestamp: {ts}")

    print(f"Found {len(transactions)} transactions.")
    
    await db.connect()
    
    try:
        async with db.pool.acquire() as conn:
            for tx in transactions:
                try:
                    await conn.execute("""
                        INSERT INTO transactions (
                            id, timestamp, merchant, category, amount, currency, status, payment_method
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                        ON CONFLICT (id) DO NOTHING
                    """,
                        tx['id'],
                        normalize_timestamp(tx['timestamp']),
                        tx['merchant'].strip(),
                        normalize_category(tx.get('category')),
                        float(tx['amount']),
                        tx['currency'].strip().upper(),
                        normalize_status(tx['status']),
                        tx['payment_method'].strip()
                    )
                except Exception as e:
                    print(f"Failed to insert transaction {tx['id']}: {e}")
                    raise e
                    
        print("Database seeding completed.")
    except Exception as e:
        print("Database seeding failed:", e)
    finally:
        await db.close()

if __name__ == "__main__":
    asyncio.run(seed())
