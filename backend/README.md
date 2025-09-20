# Backend (Node.js + Express + MongoDB)

This is the backend API for the Agency site. It supports:

- Auth (admin only access)
- CRUD: Portfolio, Blog, Team Members
- Contact form submissions
- Analytics: traffic, form fills, social landing attribution
- Admin dashboard endpoints

## Structure

- `src/server.js` - Server bootstrap (port, listener)
- `src/app.js` - Express app setup (middlewares, routes)
- `src/config/` - Env, DB connection, config helpers
- `src/controllers/` - Request handlers
- `src/models/` - Mongoose models
- `src/routes/` - Route definitions
- `src/middlewares/` - Auth, validation, errors, CORS, rate limiting
- `src/services/` - Business logic (email, analytics, uploads)
- `src/utils/` - Helpers and utilities
- `src/validators/` - Joi/Zod/Yup validators (choose one later)
- `src/jobs/` - Scheduled/background jobs (optional)
- `src/seed/` - Seeding scripts
- `tests/` - Tests
- `scripts/` - One-off maintenance scripts

## Setup (to be completed later)

1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies: `npm install`
3. Run dev: `npm run dev`
