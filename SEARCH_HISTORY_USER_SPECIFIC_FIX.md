# Search History User-Specific Fix ✅

## Issue
Search history was shared across all users. When one user searched for something, all other users would see the same search history.

## Root Cause
The `useSearchHistory` hook used a static localStorage key `'medthread_search_history'` for all users, causing all users to share the same search history data.

## Solution Applied

### Updated `useSearchHistory` Hook

**Before:**
```typescript
const SEARCH_HISTORY_KEY = 'medthread_search_history';

useEffect(() => {
  const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
  // ...
}, []);
```

**After:**
```typescript
const { user } = useJWTAuth();

const getStorageKey = () => {
  if (!user?.id) return 'medthread_search_history_guest';
  return `medthread_search_history_${user.id}`;
};

useEffect(() => {
  const storageKey = getStorageKey();
  const stored = localStorage.getItem(storageKey);
  // ...
}, [user?.id]);
```

## Key Changes

### 1. User-Specific Storage Keys
- **Logged-in users**: `medthread_search_history_{userId}`
- **Guest users**: `medthread_search_history_guest`

### 2. Dynamic Key Generation
Added `getStorageKey()` function that:
- Checks if user is logged in
- Returns user-specific key if logged in
- Returns guest key if not logged in

### 3. User Change Detection
Updated `useEffect` dependency:
- Now depends on `user?.id`
- Reloads history when user changes
- Clears history when switching users

### 4. All Operations Updated
Updated all localStorage operations to use dynamic key:
- `addToHistory()` - Saves to user-specific key
- `removeFromHistory()` - Removes from user-specific key
- `clearHistory()` - Clears user-specific key

## How It Works Now

### User A Searches
1. User A logs in with ID `user123`
2. Searches for "diabetes"
3. Stored in: `medthread_search_history_user123`
4. Only User A sees this history

### User B Searches
1. User B logs in with ID `user456`
2. Searches for "cardiology"
3. Stored in: `medthread_search_history_user456`
4. Only User B sees this history

### User Switches Accounts
1. User A logs out
2. User B logs in
3. Hook detects user change (`user?.id` changed)
4. Loads User B's history from `medthread_search_history_user456`
5. User A's history remains in `medthread_search_history_user123`

### Guest Users
1. Not logged in
2. Searches stored in: `medthread_search_history_guest`
3. Shared among all guest sessions (expected behavior)
4. Cleared when user logs in

## Benefits

### Privacy
✅ Each user has their own private search history
✅ Users cannot see other users' searches
✅ History persists across sessions for same user

### User Experience
✅ Personalized search suggestions
✅ Relevant recent searches
✅ History follows the user across devices (same browser)

### Data Isolation
✅ No data leakage between users
✅ Clean separation of user data
✅ Easy to clear individual user history

## Testing Scenarios

### Scenario 1: Multiple Users, Same Browser
1. User A logs in and searches "heart disease"
2. User A logs out
3. User B logs in and searches "diabetes"
4. User B sees only "diabetes" in history
5. User A logs back in and sees only "heart disease"

### Scenario 2: Same User, Multiple Sessions
1. User A logs in and searches "cardiology"
2. User A closes browser
3. User A opens browser and logs in again
4. User A sees "cardiology" in history (persisted)

### Scenario 3: Guest to Logged-in
1. Guest searches "symptoms"
2. Guest logs in as User A
3. User A sees empty history (guest history not carried over)
4. User A's searches now saved to their account

### Scenario 4: Clear History
1. User A has 5 searches in history
2. User A clicks "Clear All"
3. Only User A's history is cleared
4. Other users' histories remain intact

## localStorage Structure

### Before Fix (Shared)
```
medthread_search_history: [
  { query: "diabetes", timestamp: 123456 },
  { query: "cardiology", timestamp: 123457 }
]
```
All users see the same data.

### After Fix (User-Specific)
```
medthread_search_history_user123: [
  { query: "diabetes", timestamp: 123456 }
]

medthread_search_history_user456: [
  { query: "cardiology", timestamp: 123457 }
]

medthread_search_history_guest: [
  { query: "symptoms", timestamp: 123458 }
]
```
Each user has their own isolated data.

## Migration

### Existing Users
Users with existing search history under the old key will:
1. See empty history on first login after update
2. Start building new user-specific history
3. Old shared history remains in localStorage but unused

### Optional: Migrate Old History
If you want to preserve old history, add this one-time migration:

```typescript
useEffect(() => {
  if (user?.id) {
    const oldKey = 'medthread_search_history';
    const newKey = getStorageKey();
    
    // Check if new key doesn't exist but old key does
    if (!localStorage.getItem(newKey) && localStorage.getItem(oldKey)) {
      const oldData = localStorage.getItem(oldKey);
      localStorage.setItem(newKey, oldData);
      // Optionally remove old key
      // localStorage.removeItem(oldKey);
    }
  }
}, [user?.id]);
```

## Files Modified

1. ✅ `apps/web/src/hooks/useSearchHistory.ts`
   - Added `useJWTAuth()` import
   - Added `getStorageKey()` function
   - Updated `useEffect` to depend on `user?.id`
   - Updated all localStorage operations to use dynamic key

## Related Components

These components use `useSearchHistory` and will automatically benefit:
- `NavbarEnhanced.tsx` - Search bar with history dropdown
- `apps/web/src/app/search/page.tsx` - Search page (if exists)

## Security Considerations

### Data Privacy
✅ User search history is private
✅ No cross-user data exposure
✅ Guest history separate from logged-in users

### localStorage Limits
- Each user's history stored separately
- Max 10 items per user (configurable)
- Total localStorage usage increases with more users
- Browser limit: ~5-10MB total (plenty of space)

### Cleanup
Consider adding cleanup for:
- Inactive user histories (30+ days old)
- Deleted user accounts
- Guest history after login

## Future Enhancements

### Server-Side Storage (Optional)
For cross-device sync:
1. Store search history in database
2. Sync with localStorage for offline access
3. Merge histories on login
4. Backup and restore capabilities

### Analytics (Optional)
Track search patterns:
- Popular searches per user type
- Search success rates
- Query refinement patterns
- Trending searches

### Privacy Controls (Optional)
User preferences:
- Enable/disable search history
- Auto-clear after X days
- Incognito mode (no history)
- Export/download history

## Status: ✅ COMPLETE

Search history is now user-specific. Each user has their own private search history that persists across sessions and doesn't interfere with other users.
