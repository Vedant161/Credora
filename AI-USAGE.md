# AI Usage

In the spirit of transparency, I utilized Artificial Intelligence tools (such as ChatGPT/Copilot) sparingly during the development of this project. The core logic, architectural decisions, and system design were created manually.

My AI usage was strictly limited to the following areas:

- **Boilerplate Generation:** Generating standard configuration files (like `eslint`, `tsconfig.json`) and setting up the initial folder structure.
- **CSS and Styling:** Assisting with the creation of tedious CSS variables and flexbox/grid layout alignments for some of the more complex dashboard components to speed up UI prototyping.
- **Syntax Reference:** Used as a highly-efficient search engine to quickly look up specific `asyncpg` query syntax and Next.js App Router hooks (e.g., `useSearchParams` implementation details) rather than digging through documentation.
- **Data Mocking:** Generating the initial mock JSON dataset for transactions to test the UI before the PostgreSQL database was fully connected.

**What was NOT done by AI:**
- The Vercel Serverless Function architecture and the custom `next.config.ts` rewrite logic.
- The complex SQL aggregation queries used in the dashboard controllers.
- The state management and component breakdown of the React frontend.
- Security and error handling logic. 

AI was treated as an assistant to accelerate mundane tasks, allowing me to focus on the engineering challenges.
