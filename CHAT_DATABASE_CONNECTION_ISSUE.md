# Chat Database Connection Pool Issue

## Critical Issue
**Error**: `MaxClientsInSessionMode: max clients reached - in Session mode max clients are limited to pool_size`

**Impact**: 
- Messages not saving to database
- Messages not appearing in chat
- Chat functionality broken

## Root Cause
Supabase connection pool exhausted. In session mode, Supabase limits connections to the pool size (typically 5 connections). The backend has opened too many database connections and hasn't closed them properly.

## Immediate Solution

### RESTART THE BACKEND SERVER

This will close all existing connections and reset the pool.

**Steps**:
1. Go to the terminal running the backend
2. Press `Ctrl+C` to stop the server
3. Wait 5 seconds
4. Run `npm run dev` again (or your start command)
5. Wait for "Server running on port 3001" message

## What Was Also Fixed

### Frontend Error (Line 364)
**Error**: `Cannot read properties of undefined (reading 'id')`

**Fix**: Added validation when replacing optimistic messages with real ones from API.

**File**: `apps/web/src/components/Chat/ChatWindow.tsx`

```typescript
// Before
setMessages(prev =>
  prev.map(m => (m.id === tempId ? data.data : m))
);

// After
const realMessage = data.data || data;
if (realMessage && realMessage.id) {
  setMessages(prev =>
    prev.map(m => (m.id === tempId ? realMessage : m))
  );
}
```

## Why This Happened

### Connection Pool Exhaustion
1. Multiple API requests opening connections
2. Connections not being properly closed
3. Supabase session mode has strict limits
4. Development mode may keep connections open longer

### Common Causes
- Too many simultaneous requests
- Long-running queries
- Connection leaks in code
- Not using connection pooling properly

## Long-Term Solutions

### 1. Use Connection Pooling Mode
Change Supabase connection string from session mode to pooling mode:

**Session Mode** (current - limited to 5):
```
postgresql://user:pass@host:5432/db
```

**Pooling Mode** (recommended - up to 200):
```
postgresql://user:pass@host:6543/db?pgbouncer=true
```

### 2. Implement Connection Management
- Use Prisma connection pooling
- Close connections after use
- Limit concurrent connections
- Use connection timeout

### 3. Add Connection Monitoring
```typescript
// Check active connections
const activeConnections = await prisma.$queryRaw`
  SELECT count(*) FROM pg_stat_activity 
  WHERE datname = current_database()
`;
```

## Testing After Restart

1. **Restart backend** (Ctrl+C then npm run dev)
2. **Refresh frontend** (Ctrl+R)
3. **Login as doctor**
4. **Go to chat**
5. **Send a message**
6. **Expected**: Message appears immediately
7. **Check backend logs**: Should see successful DB saves

### Success Indicators
- No "MaxClientsInSessionMode" errors
- Messages save to database
- Messages appear in chat
- No undefined errors in console

### If Still Failing
- Check Supabase dashboard for active connections
- Verify database credentials
- Check if database is accessible
- Look for other connection leaks

## Prevention

### Best Practices
1. Always close database connections
2. Use connection pooling
3. Limit concurrent requests
4. Monitor connection usage
5. Use Prisma's built-in pooling
6. Set connection timeouts

### Monitoring
Watch backend logs for:
- "DB Message save failed"
- "MaxClientsInSessionMode"
- "Error in connector"
- Connection timeout errors

## Quick Reference

| Issue | Solution |
|-------|----------|
| MaxClientsInSessionMode | Restart backend |
| Messages not appearing | Restart backend + refresh frontend |
| Undefined message.id | Already fixed in code |
| Connection leaks | Use pooling mode |

---

## Action Required

**RIGHT NOW**: Restart the backend server to fix the immediate issue.

**LATER**: Consider switching to Supabase pooling mode for better scalability.

---

🔴 **CRITICAL**: Restart backend server now to restore chat functionality!
