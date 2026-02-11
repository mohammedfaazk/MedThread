# How to Run MedThread Project

## Prerequisites

Before you start, make sure you have the following installed:

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify: `node --version`

2. **npm** (comes with Node.js)
   - Verify: `npm --version`

3. **PostgreSQL** (v14 or higher) - Optional if using Docker
   - Download from: https://www.postgresql.org/download/
   - Or use Docker (recommended)

4. **Docker Desktop** (Optional but recommended)
   - Download from: https://www.docker.com/products/docker-desktop/

---

## Quick Start (Easiest Method)

### Option 1: Using Docker (Recommended)

This is the easiest way to run the entire project with all services.

```bash
# 1. Start all services (database, API, web app)
docker-compose up -d

# 2. View logs
docker-compose logs -f

# 3. Access the application
# Web App: http://localhost:3000
# API: http://localhost:3001
```

**To stop:**
```bash
docker-compose down
```

---

## Manual Setup (Step by Step)

### Step 1: Install Dependencies

Open your terminal in the project root directory:

```bash
# Install all dependencies for the monorepo
npm install
```

This will install dependencies for:
- Root workspace
- Web app (`apps/web`)
- API (`apps/api`)
- All packages (`packages/*`)

### Step 2: Set Up Environment Variables

#### For the API:

```bash
# Copy the example environment file
copy .env.example apps\api\.env

# Or on Mac/Linux:
# cp .env.example apps/api/.env
```

Edit `apps/api/.env` with your settings:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/medthread"
JWT_SECRET="your-super-secret-jwt-key-change-this"
PORT=3001
NODE_ENV="development"
```

#### For the Web App (Optional):

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Step 3: Start PostgreSQL Database

#### Option A: Using Docker (Easiest)

```bash
# Start only the PostgreSQL container
docker-compose up postgres -d

# Verify it's running
docker ps
```

#### Option B: Using Local PostgreSQL

1. Start your PostgreSQL service
2. Create a database named `medthread`:

```sql
CREATE DATABASE medthread;
```

### Step 4: Set Up Database Schema

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push
```

### Step 5: Start Development Servers

#### Option A: Start All Services Together (Recommended)

```bash
# This starts both web and API servers
npm run dev
```

This will start:
- **Web App** on http://localhost:3000
- **API Server** on http://localhost:3001

#### Option B: Start Services Individually

Open **two separate terminals**:

**Terminal 1 - API Server:**
```bash
cd apps/api
npm run dev
```

**Terminal 2 - Web App:**
```bash
cd apps/web
npm run dev
```

### Step 6: Access the Application

Open your browser and go to:
- **Web App**: http://localhost:3000
- **API**: http://localhost:3001

---

## Project Structure

```
medthread/
├── apps/
│   ├── web/              # Next.js frontend (Port 3000)
│   └── api/              # Express backend (Port 3001)
├── packages/
│   ├── ui/               # Shared React components
│   ├── database/         # Prisma schema
│   └── types/            # TypeScript types
└── docs/                 # Documentation
```

---

## Common Commands

### Development

```bash
# Start all services in development mode
npm run dev

# Start only the web app
cd apps/web && npm run dev

# Start only the API
cd apps/api && npm run dev
```

### Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes to database
npm run db:push

# Open Prisma Studio (database GUI)
cd packages/database && npx prisma studio
```

### Building for Production

```bash
# Build all apps
npm run build

# Build only web app
cd apps/web && npm run build

# Build only API
cd apps/api && npm run build
```

### Linting

```bash
# Run linter on all packages
npm run lint
```

---

## Troubleshooting

### Issue: "Cannot find module" errors

**Solution:**
```bash
# Clean install
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
npm install
```

### Issue: Database connection errors

**Solution:**
1. Check if PostgreSQL is running:
   ```bash
   docker ps  # If using Docker
   ```

2. Verify DATABASE_URL in `apps/api/.env`

3. Test connection:
   ```bash
   cd packages/database
   npx prisma db push
   ```

### Issue: Port already in use

**Solution:**
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change the port in package.json
```

### Issue: Prisma client not generated

**Solution:**
```bash
cd packages/database
npx prisma generate
```

### Issue: TypeScript errors

**Solution:**
```bash
# Rebuild TypeScript
npm run build

# Or for specific package
cd apps/web && npm run build
```

---

## Development Workflow

### 1. Making Changes to the Web App

```bash
# The dev server auto-reloads on file changes
cd apps/web
npm run dev

# Edit files in apps/web/src/
# Changes will appear immediately in the browser
```

### 2. Making Changes to the API

```bash
# The API auto-restarts on file changes
cd apps/api
npm run dev

# Edit files in apps/api/src/
# API will restart automatically
```

### 3. Making Database Changes

```bash
# 1. Edit schema in packages/database/prisma/schema.prisma

# 2. Push changes to database
npm run db:push

# 3. Regenerate Prisma client
npm run db:generate
```

### 4. Adding New Dependencies

```bash
# For web app
cd apps/web
npm install <package-name>

# For API
cd apps/api
npm install <package-name>

# For shared packages
cd packages/ui
npm install <package-name>
```

---

## Testing the Application

### 1. Test the Web App

1. Open http://localhost:3000
2. You should see the MedThread home page
3. Try navigating to different pages:
   - `/login` - Login page
   - `/doctors` - Verified doctors
   - `/about` - About page
   - `/m/cardiology` - Community page

### 2. Test the API

```bash
# Test API health endpoint
curl http://localhost:3001/health

# Or open in browser:
# http://localhost:3001/health
```

### 3. Test Database Connection

```bash
# Open Prisma Studio
cd packages/database
npx prisma studio

# Opens at http://localhost:5555
```

---

## Production Deployment

### Build for Production

```bash
# Build all apps
npm run build

# Start production servers
cd apps/web && npm start  # Port 3000
cd apps/api && npm start  # Port 3001
```

### Using Docker for Production

```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml up -d
```

---

## Useful Links

- **Web App**: http://localhost:3000
- **API**: http://localhost:3001
- **Prisma Studio**: http://localhost:5555 (when running)
- **Documentation**: [./docs](./docs)
- **Design System**: [./docs/design-system.md](./docs/design-system.md)

---

## Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section above
2. Review the logs:
   ```bash
   # Docker logs
   docker-compose logs -f
   
   # Or check terminal output where you ran npm run dev
   ```

3. Check the documentation in the `docs/` folder

4. Verify all prerequisites are installed correctly

---

## Summary

**Quickest way to run:**

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npm run db:generate

# 3. Start database (if using Docker)
docker-compose up postgres -d

# 4. Setup database schema
npm run db:push

# 5. Start dev servers
npm run dev

# 6. Open browser
# http://localhost:3000
```

**Note**: The `npm run lint` command is configured to pass without strict linting. If you want to enable proper linting, you'll need to configure ESLint for each workspace.

That's it! You should now have MedThread running locally. 🎉
