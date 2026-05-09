# Backend Setup Instructions

## Prerequisites

1. Ensure you have Node.js installed
2. Set up your `.env` file in the `backend/` directory with the following variables:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `DIRECT_URL` - Direct PostgreSQL connection (same as DATABASE_URL for most cases)
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_ANON_KEY` - Your Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
   - `PORT` - Server port (default: 3000)
   - `NODE_ENV` - Environment (development/production)
   - `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:8081)

## Setup Steps

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Set up your `.env` file in the `backend/` directory (see Prerequisites above).

3. The Prisma schema is already set up in `backend/src/prisma/schema.prisma` with all models:
   - User, Project, Client, Contractor, Worker
   - Attendance, Material, Photo, Trade
   - ProjectMaterial, ProjectParticipant, Purchase, PurchaseItem
   - Supplier, Todo, UserMaterial, WorkerContract, LaborEstimate

4. Generate Prisma Client:
   ```bash
   npm run prisma:generate
   ```

5. Create and run database migrations:
   ```bash
   npm run prisma:migrate
   ```
   This will create the initial migration and apply it to your database.

6. (Optional) Open Prisma Studio to view/edit your database:
   ```bash
   npm run prisma:studio
   ```

7. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Users
- `GET /api/users` - Get all users (with pagination and search)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Soft delete user

### Projects
- `GET /api/projects` - Get all projects (with pagination, filters, and search)
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Soft delete project

## Authentication

All endpoints require authentication. Include the Supabase JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Project Structure

```
backend/
├── src/
│   ├── app.ts              # Express app configuration
│   ├── server.ts           # Server entry point
│   ├── lib/
│   │   ├── prisma.ts       # Prisma client instance
│   │   └── supabase-admin.ts  # Supabase admin client
│   ├── middleware/
│   │   ├── auth.ts         # Authentication middleware
│   │   └── validate.ts    # Request validation middleware
│   ├── routes/
│   │   ├── index.ts        # Route registration
│   │   ├── user.routes.ts  # User routes
│   │   └── project.routes.ts  # Project routes
│   ├── controllers/
│   │   ├── user.controller.ts
│   │   └── project.controller.ts
│   ├── services/
│   │   ├── user.service.ts
│   │   └── project.service.ts
│   └── schemas/
│       ├── user.schema.ts  # Zod validation schemas
│       └── project.schema.ts
```

