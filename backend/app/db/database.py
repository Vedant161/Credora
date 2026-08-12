import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()

class Database:
    def __init__(self):
        self.pool = None

    async def get_pool(self):
        if self.pool is None:
            self.pool = await asyncpg.create_pool(
                dsn=os.environ.get("DATABASE_URL"),
                min_size=1,
                max_size=3,
                statement_cache_size=0,
            )
        return self.pool

db = Database()
