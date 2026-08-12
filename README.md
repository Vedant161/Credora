# Credora

Credora is a modern, full-stack application designed to help users manage their credit card transactions, analyze spending habits, and redeem earned rewards. 

## Architecture
The application uses a **Next.js frontend** and a **FastAPI backend** deployed as a single Vercel project.
The backend API is exposed via `api/index.py` allowing Vercel to route `/api/*` traffic to FastAPI.

## Tech Stack
- **Frontend:** Next.js, React, TypeScript
- **Backend:** FastAPI, Python, asyncpg
- **Database:** Supabase PostgreSQL

## Deployment on Vercel
1. Set up the Vercel project to deploy Next.js (Root directory: `.`, build command: `npm run build`, output: `.next`).
2. Add the `DATABASE_URL` environment variable in the Vercel dashboard.
3. Deploy! Both frontend and backend share the same domain.

## Local Development
1. Clone the repository.
2. Run `npm install` in the root directory.
3. Install backend requirements from `requirements.txt`.
4. Create a `.env` file at the root containing `DATABASE_URL`.
5. Start the Next.js dev server on port 3000 and FastAPI on port 5000.
