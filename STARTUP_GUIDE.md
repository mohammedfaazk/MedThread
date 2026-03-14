# MedThread Application Startup Guide 🚀

## Project Structure
MedThread is a **Turbo monorepo** with the following structure:
```
medthread/
├── apps/
│   ├── api/          # Express.js backend API (Port 3001)
│   └── web/          # Next.js frontend (Port 3000)
├── packages/
│   ├── database/     # Prisma database schema
│   ├── types/        # Shared TypeScript types
│   └── ui/           # Shared UI components
└── scripts/          # Utility and test scripts
```

## Prerequisites ✅
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** database (Supabase configured)

## Environment Setup 🔧

### 1. Environment Variables
The `.env` file is already configured with:
- ✅ **Database**: Supabase PostgreSQL
- ✅ **JWT**: Authentication secrets
- ✅ **Ports**: API (3001), Web (3000)
- ✅ **CORS**: Configured for localhost
- ✅ **Email**: SMTP configuration
- ⚠️ **Groq API**: Needs valid key for AI features

### 2. Install Dependencies
```bash
# Install all dependencies for the monorepo
npm install
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (if needed)
npm run db:push
```

## Running the Application 🏃‍♂️

### Option 1: Run Everything (Recommended)
```bash
# Start both API and Web simultaneously
npm run dev
```
This will start:
- 🔧 **API Server**: http://localhost:3001
- 🌐 **Web App**: http://localhost:3000

### Option 2: Run Individually
```bash
# Terminal 1 - Start API
cd apps/api
npm run dev

# Terminal 2 - Start Web
cd apps/web  
npm run dev
```

## Verification Steps ✅

### 1. Check API Health
```bash
curl http://localhost:3001/health
# Should return: {"status": "ok", "timestamp": "..."}
```

### 2. Check Web App
- Open: http://localhost:3000
- Should see MedThread homepage

### 3. Test Hospital Finder
- Navigate to: http://localhost:3000/find-hospitals
- Allow location access
- Verify map loads with nearby hospitals

## Application Features 🎯

### For Patients
- 🏥 **Hospital Finder**: `/find-hospitals` (NEW!)
- 📊 **Health Analytics**: Dashboard and trends
- 💬 **Doctor Consultation**: Chat and appointments
- 🍎 **AI Diet Planner**: Personalized nutrition

### For Doctors  
- 📈 **Analytics Dashboard**: Patient insights
- 🔍 **Priority Feed**: Medical urgency detection
- 👥 **Patient Management**: Consultations and records
- 📊 **Performance Metrics**: Profile statistics

### For Admins
- 📊 **User Analytics**: Activity monitoring
- 🗺️ **Regional Health**: Symptom mapping
- 👨‍⚕️ **Doctor Verification**: Profile management
- 📈 **Platform Metrics**: Usage statistics

## Troubleshooting 🔧

### Common Issues

#### 1. Port Already in Use
```bash
# Kill processes on ports 3000/3001
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

#### 2. Database Connection Issues
- Verify Supabase credentials in `.env`
- Check network connectivity
- Run `npm run db:generate` to refresh Prisma client

#### 3. Dependencies Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

#### 4. Turbo Cache Issues
```bash
# Clear Turbo cache
npx turbo clean
npm run dev
```

### Environment-Specific Issues

#### macOS
```bash
# If you get permission errors
sudo chown -R $(whoami) ~/.npm
```

#### Windows
```bash
# Use PowerShell or Git Bash
# Ensure Node.js is in PATH
```

## Testing the New Features 🧪

### Hospital Finder Integration
```bash
# Run hospital finder test
node scripts/test-hospital-finder.js
```

### Analytics Features
```bash
# Run comprehensive feature tests
node scripts/test-new-features-comprehensive.js
```

### Health Check
```bash
# Quick system validation
node scripts/quick-health-check.js
```

## Development Workflow 💻

### 1. Making Changes
- **Frontend**: Edit files in `apps/web/src/`
- **Backend**: Edit files in `apps/api/src/`
- **Database**: Modify `packages/database/prisma/schema.prisma`

### 2. Hot Reload
- Both API and Web support hot reload
- Changes reflect automatically during development

### 3. Building for Production
```bash
npm run build
```

## Key URLs 🔗

### Development
- **Web App**: http://localhost:3000
- **API**: http://localhost:3001
- **Hospital Finder**: http://localhost:3000/find-hospitals

### API Endpoints
- **Health**: `GET /health`
- **Auth**: `POST /api/v1/auth/login`
- **Analytics**: `GET /api/v1/analytics/*`
- **Hospitals**: External Overpass API

## Next Steps 📋

1. **Start the application**: `npm run dev`
2. **Create test accounts**: Use signup flow
3. **Test hospital finder**: Navigate to `/find-hospitals`
4. **Explore analytics**: Check dashboard features
5. **Run test scripts**: Validate functionality

## Support 🆘

If you encounter issues:
1. Check this guide first
2. Review error logs in terminal
3. Run health check scripts
4. Verify environment variables
5. Check database connectivity

---

**Ready to start? Run `npm run dev` and visit http://localhost:3000!** 🎉