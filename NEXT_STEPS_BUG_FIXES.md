# Next Steps - Remaining Bug Fixes

## 🎯 Quick Action Items

### Immediate (Do Now)
1. **Apply Database Migrations**
   ```bash
   cd packages/database
   npx prisma migrate dev --name fix-updated-at-fields
   npx prisma generate
   ```

2. **Test Critical Paths**
   ```bash
   # Test authentication
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}'
   
   # Test validation
   curl -X GET "http://localhost:3001/api/health-tips/personalized?count=999"
   # Should return 400 error
   ```

3. **Review Logs**
   - Check application logs for any password-related output
   - Verify no sensitive data is being logged

---

## 🔴 Critical - Must Fix Before Production

### 1. Secure Environment Variables
**Current Issue**: `.env` file contains exposed secrets

**Action**:
```bash
# 1. Move .env to .env.local (gitignored)
mv .env .env.local

# 2. Update .gitignore
echo ".env.local" >> .gitignore

# 3. Rotate all exposed credentials:
# - Database password
# - JWT secret
# - API keys (Groq, Tavily, Supabase)
# - Email password
```

**Files to Update**:
- `.env` → Delete or use only for examples
- `.env.local` → Create with real secrets (gitignored)
- `.env.production.example` → Update with placeholder values

---

## 🟡 High Priority - Fix This Week

### 2. Add Validation to Remaining Routes

**Routes Needing Validation** (20+ files):
```
apps/api/src/routes/
├── success-stories.routes.ts
├── reviews.routes.ts
├── moderation.routes.ts
├── search.routes.ts
├── health-challenges.routes.ts
├── qa-forum.routes.ts
├── emergency-broadcast.routes.ts
├── awards.ts
├── karma.ts
└── ... (12 more)
```

**Template to Use**:
```typescript
import { parseIntSafe, validatePagination, validateEnum } from '../utils/validation';

// Replace:
const page = parseInt(req.query.page as string) || 1;
const limit = parseInt(req.query.limit as string) || 20;

// With:
const { page, limit } = validatePagination(req.query);
```

**Estimated Time**: 2-3 hours

---

### 3. Add Null Safety Checks

**Pattern to Find**:
```typescript
// UNSAFE:
const user = await prisma.user.findUnique({ where: { id } });
return user.email; // Could crash if user is null

// SAFE:
const user = await prisma.user.findUnique({ where: { id } });
if (!user) {
  throw new NotFoundError('User not found');
}
return user.email;
```

**Files to Check**:
- All service files in `apps/api/src/services/`
- All route handlers using Prisma queries

**Alternative**: Use Prisma's `findUniqueOrThrow()`
```typescript
const user = await prisma.user.findUniqueOrThrow({ 
  where: { id } 
});
// Automatically throws if not found
```

**Estimated Time**: 3-4 hours

---

## 🟢 Medium Priority - Fix This Month

### 4. Add Error Boundaries to Frontend

**Create Error Boundary Component**:
```typescript
// apps/web/src/components/ErrorBoundary.tsx
import React from 'react';

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Wrap Critical Components**:
```typescript
// apps/web/src/app/layout.tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

**Estimated Time**: 2 hours

---

### 5. Implement Rate Limiting

**Install Dependencies**:
```bash
cd apps/api
npm install express-rate-limit
```

**Add Rate Limiting**:
```typescript
// apps/api/src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests, please slow down',
});
```

**Apply to Routes**:
```typescript
// apps/api/src/routes/auth.ts
import { authLimiter } from '../middleware/rateLimiter';

authRouter.post('/login', authLimiter, async (req, res) => {
  // ... login logic
});

authRouter.post('/register', authLimiter, async (req, res) => {
  // ... register logic
});
```

**Estimated Time**: 1-2 hours

---

### 6. Improve Type Safety

**Create Authenticated Request Type**:
```typescript
// apps/api/src/types/express.d.ts
import { UserRole } from '@medthread/database';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: UserRole;
      user?: {
        id: string;
        role: UserRole;
        email: string;
        username: string;
      };
    }
  }
}
```

**Replace Type Assertions**:
```typescript
// Before:
const userId = (req as any).userId;
const userRole = (req as any).userRole;

// After:
const userId = req.userId!; // Non-null assertion
const userRole = req.userRole!;

// Or with guard:
if (!req.userId) {
  throw new UnauthorizedError('Authentication required');
}
const userId = req.userId;
```

**Estimated Time**: 2-3 hours

---

## 📝 Low Priority - Nice to Have

### 7. Standardize API Responses

**Create Response Wrapper**:
```typescript
// apps/api/src/utils/response.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return { success: true, data, message };
}

export function errorResponse(error: string): ApiResponse {
  return { success: false, error };
}

export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): ApiResponse<T[]> {
  return {
    success: true,
    data,
    meta: { page, limit, total },
  };
}
```

**Estimated Time**: 3-4 hours

---

### 8. Implement Structured Logging

**Install Winston**:
```bash
cd apps/api
npm install winston
```

**Create Logger**:
```typescript
// apps/api/src/utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

**Replace console.log**:
```typescript
// Before:
console.log('User logged in:', userId);
console.error('Login failed:', error);

// After:
logger.info('User logged in', { userId });
logger.error('Login failed', { error: error.message, stack: error.stack });
```

**Estimated Time**: 2-3 hours

---

## 🧪 Testing Checklist

After applying fixes, test:

- [ ] User registration (patient and doctor)
- [ ] User login
- [ ] Password verification
- [ ] Health tips API with various parameters
- [ ] Community listing with pagination
- [ ] Database migrations applied successfully
- [ ] No TypeScript compilation errors
- [ ] No password information in logs
- [ ] Validation errors return proper status codes
- [ ] Rate limiting works (if implemented)

---

## 📊 Progress Tracking

| Task | Priority | Status | Estimated Time | Actual Time |
|------|----------|--------|----------------|-------------|
| Database migrations | Critical | ✅ Ready | 5 min | - |
| Secure env variables | Critical | ⏳ Pending | 30 min | - |
| Add validation to routes | High | 🔄 In Progress (2/20) | 3 hours | - |
| Add null safety checks | High | ⏳ Pending | 4 hours | - |
| Error boundaries | Medium | ⏳ Pending | 2 hours | - |
| Rate limiting | Medium | ⏳ Pending | 2 hours | - |
| Type safety improvements | Medium | ⏳ Pending | 3 hours | - |
| Standardize responses | Low | ⏳ Pending | 4 hours | - |
| Structured logging | Low | ⏳ Pending | 3 hours | - |

**Total Estimated Time**: ~21 hours
**Completed**: ~2 hours (validation utility + 2 routes)
**Remaining**: ~19 hours

---

## 🎓 Learning Resources

### Input Validation
- [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [Zod Documentation](https://zod.dev/) (alternative to custom validation)

### Security
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Express with TypeScript](https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-d-ts.html)

---

**Last Updated**: 2026-04-19
**Status**: 6 bugs fixed, 8 remaining
**Next Review**: After completing high-priority items
