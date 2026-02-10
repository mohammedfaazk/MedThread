# MedThread - Quick Start Guide

## 🚀 Fastest Way to Run

### Prerequisites
- Node.js 18+ installed
- Docker Desktop installed (optional but recommended)

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Start database (Docker)
docker-compose up postgres -d

# 3. Setup database
npm run db:generate && npm run db:push

# 4. Start development servers
npm run dev
```

### Access
- **Web App**: http://localhost:3000
- **API**: http://localhost:3001

---

## 📋 Common Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run dev` | Start all dev servers |
| `npm run build` | Build for production |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `docker-compose up -d` | Start all services with Docker |
| `docker-compose down` | Stop all Docker services |

---

## 🔧 Environment Setup

Create `apps/api/.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/medthread"
JWT_SECRET="your-secret-key"
PORT=3001
NODE_ENV="development"
```

---

## 🐛 Quick Troubleshooting

### Port already in use?
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Database connection error?
```bash
# Check if PostgreSQL is running
docker ps

# Restart database
docker-compose restart postgres
```

### Module not found?
```bash
# Clean reinstall
rm -rf node_modules
npm install
```

---

## 📁 Project Structure

```
medthread/
├── apps/
│   ├── web/          # Frontend (Next.js) - Port 3000
│   └── api/          # Backend (Express) - Port 3001
├── packages/
│   ├── ui/           # Shared components
│   ├── database/     # Prisma schema
│   └── types/        # TypeScript types
└── docs/             # Documentation
```

---

## 🎨 Key Features

- ✅ Medical community discussions (m/[community])
- ✅ Verified doctor badges
- ✅ Symptom posting with guided forms
- ✅ Real-time notifications
- ✅ AI-assisted symptom analysis
- ✅ Emergency detection
- ✅ Frosted glass UI design
- ✅ Cyan/blue button theme

---

## 📚 More Help

- Full guide: [HOW_TO_RUN.md](./HOW_TO_RUN.md)
- Documentation: [docs/](./docs/)
- Design system: [docs/design-system.md](./docs/design-system.md)

---

**Need help?** Check the full [HOW_TO_RUN.md](./HOW_TO_RUN.md) guide for detailed instructions.
