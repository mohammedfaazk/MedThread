# How to Run MedThread Application

## Project Overview

MedThread is a monorepo healthcare platform built with:
- **Frontend**: Next.js 14 (apps/web)
- **Backend**: Express.js + Prisma (apps/api)
- **Database**: PostgreSQL (Supabase)
- **Monorepo Tool**: Turborepo
- **Real-time**: Socket.io

## Prerequisites

Before running the app, ensure you have:
- Node.js 18+ installed
- npm or yarn package manager
- PostgreSQL database (or Supabase account)

## Quick Start (Recommended)

### 1. Install Dependencies

```bash
# From root directory
npm install
```

This will install dependencies for all workspaces (apps/web, apps/api, packages/*).

### 2. Environment Setup

The project already has `.env` files configured:

**Backend** (`apps/api/.env`):
```env
DATABASE_URL="postgresql://postgres.lfjqtefsfhkzlzixleee:MedthreadDev@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=5"
DIRECT_URL="postgresql://postgres.lfjqtefsfhkzlzixleee:MedthreadDev@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
JWT_SECRET="change-this-to-a-secure-random-string-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000"
```

**Frontend** (`apps/web/.env`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://lfjqtefsfhkzlzixleee.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Generate Prisma Client

```bash
npm run db:generate
```

This generates the Prisma client from the schema.

### 4. Push Database Schema (if needed)

```bash
npm run db:push
```

This pushes the Prisma schema to your database.

### 5. Start Development Servers

```bash
npm run dev
```

This starts both frontend and backend concurrently using Turborepo.

**Services will be available at:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Socket.io: ws://localhost:3001

## Individual Service Commands

### Run Frontend Only

```bash
cd apps/web
npm run dev
```

### Run Backend Only

```bash
cd apps/api
npm run dev
```

### Build for Production

```bash
# Build all apps
npm run build

# Start production servers
cd apps/web && npm start  # Frontend
cd apps/api && npm start  # Backend
```

## Database Management

### Generate Prisma Client

```bash
npm run db:generate
```

### Push Schema Changes

```bash
npm run db:push
```

### Create Admin User

```bash
cd apps/api
npm run seed:admin
```

or

```bash
cd apps/api
npm run create:admin
```

## Project Structure

```
medthread/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/           # Next.js 14 app directory
│   │   │   ├── components/    # React components
│   │   │   ├── context/       # React context providers
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── lib/           # Utility functions
│   │   │   └── store/         # Zustand stores
│   │   ├── public/            # Static assets
│   │   ├── .env               # Frontend environment variables
│   │   └── package.json
│   │
│   └── api/                    # Express.js backend
│       ├── src/
│       │   ├── controllers/   # Request handlers
│       │   ├── services/      # Business logic
│       │   ├── routes/        # API routes
│       │   ├── middleware/    # Express middleware
│       │   ├── handlers/      # Socket.io handlers
│       │   ├── utils/         # Utility functions
│       │   ├── validators/    # Input validation
│       │   └── index.ts       # Server entry point
│       ├── uploads/           # File uploads directory
│       ├── .env               # Backend environment variables
│       └── package.json
│
├── packages/
│   ├── database/              # Prisma schema & client
│   │   └── prisma/
│   │       └── schema.prisma  # Database schema
│   ├── ui/                    # Shared React components
│   └── types/                 # Shared TypeScript types
│
├── package.json               # Root package.json
├── turbo.json                 # Turborepo configuration
└── README.md
```

## Key Features & Routes

### Frontend Routes

- `/` - Homepage with post feed
- `/login` - User login
- `/signup` - Patient signup
- `/signup/doctor` - Doctor signup
- `/u/[username]` - User profile page
- `/settings/profile` - Profile settings
- `/post/[id]` - Post detail page
- `/m/[community]` - Community page
- `/search` - Search page
- `/leaderboard` - User leaderboard
- `/dashboard/doctor` - Doctor dashboard
- `/dashboard/patient` - Patient dashboard

### Backend API Routes

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/profile/:username` - Get user profile
- `GET /api/profile/check-username` - Check username availability
- `PUT /api/profile/me/profile` - Update profile
- `PUT /api/profile/me/avatar` - Upload avatar
- `PUT /api/profile/me/banner` - Upload banner
- `GET /api/v1/posts` - Get posts
- `POST /api/v1/posts` - Create post
- `GET /api/v1/communities` - Get communities
- `GET /api/v1/search/autocomplete` - Search autocomplete
- `GET /api/notifications` - Get notifications

## Common Issues & Solutions

### Issue: "Cannot find module '@medthread/database'"

**Solution:**
```bash
npm run db:generate
```

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Kill the process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

### Issue: "Database connection failed"

**Solution:**
- Check DATABASE_URL in `apps/api/.env`
- Ensure PostgreSQL is running
- Verify database credentials

### Issue: "Prisma Client not generated"

**Solution:**
```bash
npm run db:generate
```

### Issue: "CORS errors"

**Solution:**
- Ensure CORS_ORIGIN in `apps/api/.env` matches your frontend URL
- Check that backend is running on port 3001

## Development Workflow

### 1. Making Database Changes

```bash
# 1. Edit packages/database/prisma/schema.prisma
# 2. Generate Prisma client
npm run db:generate
# 3. Push changes to database
npm run db:push
```

### 2. Adding New Features

```bash
# 1. Create feature branch
git checkout -b feature/your-feature

# 2. Make changes
# 3. Test locally
npm run dev

# 4. Build to check for errors
npm run build

# 5. Commit and push
git add .
git commit -m "Add your feature"
git push origin feature/your-feature
```

### 3. Testing

```bash
# Run all tests
npm run test

# Run linter
npm run lint
```

## Environment Variables Reference

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | postgresql://user:pass@host:5432/db |
| JWT_SECRET | Secret for JWT tokens | random-secure-string |
| JWT_EXPIRES_IN | JWT expiration time | 7d |
| PORT | Backend server port | 3001 |
| NODE_ENV | Environment | development |
| CORS_ORIGIN | Allowed CORS origin | http://localhost:3000 |
| CLOUDINARY_CLOUD_NAME | Cloudinary cloud name | your-cloud-name |
| CLOUDINARY_API_KEY | Cloudinary API key | your-api-key |
| CLOUDINARY_API_SECRET | Cloudinary API secret | your-api-secret |

### Frontend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL | https://xxx.supabase.co |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase anon key | eyJhbGci... |
| NEXT_PUBLIC_API_URL | Backend API URL | http://localhost:3001 |

## Production Deployment

### Build for Production

```bash
# Build all apps
npm run build
```

### Start Production Servers

```bash
# Frontend
cd apps/web
npm start

# Backend
cd apps/api
npm start
```

### Environment Variables for Production

Update the following in production:
- Change JWT_SECRET to a secure random string
- Update CORS_ORIGIN to your production domain
- Use production database URL
- Set NODE_ENV=production

## Useful Commands

```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Build all apps
npm run build

# Run tests
npm run test

# Run linter
npm run lint

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Create admin user
cd apps/api && npm run create:admin

# Seed admin user
cd apps/api && npm run seed:admin
```

## Monitoring & Logs

### View Backend Logs

```bash
cd apps/api
npm run dev
# Logs will appear in terminal
```

### View Frontend Logs

```bash
cd apps/web
npm run dev
# Logs will appear in terminal and browser console
```

## Support

For issues or questions:
1. Check this documentation
2. Review error logs
3. Check the README.md
4. Review the codebase documentation

## Next Steps

After running the app:
1. Create a user account at http://localhost:3000/signup
2. Login at http://localhost:3000/login
3. Update your profile at http://localhost:3000/settings/profile
4. Explore the features!

---

**Happy Coding! 🚀**
