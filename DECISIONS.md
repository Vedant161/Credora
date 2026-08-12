# Architectural Decisions

- Next.js remains the frontend.
- FastAPI remains the backend.
- `api/index.py` is the Vercel Python entry point.
- Frontend and backend share one Vercel domain (no CORS needed).
- Frontend uses relative `/api/*` requests for production fetching.
- Supabase PostgreSQL remains the database.
- Serverless-safe database pooling is used (asyncpg with statement_cache_size=0).
