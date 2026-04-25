# Post Creation 401 Error - Fix Instructions

## Problem
When trying to create a post, you're getting a **401 Unauthorized** error. This happens because:

1. Your token in localStorage was created with an **old JWT_SECRET**
2. The API now uses a **new JWT_SECRET** that matches the root `.env` file
3. When you try to create a post, the token verification fails because the secrets don't match

## Solution - 3 Simple Steps

### Step 1: Clear Browser Cache & Refresh
Press **Ctrl+Shift+R** (or Cmd+Shift+R on Mac) to do a hard refresh. This clears:
- Old tokens from localStorage
- Browser cache
- Session storage

### Step 2: Log Out
Click on your profile menu and select **Logout** to clear all authentication data.

### Step 3: Log Back In
Log in again with your credentials. This will create a **fresh token** with the correct JWT_SECRET.

## After Logging Back In
- Your new token will be valid
- You can now create posts successfully
- Posts will appear at the **top of the feed** in real-time

## Verification
After logging back in, try creating a post:
1. Click "Create Post"
2. Fill in the details
3. Click "Post"
4. You should see: **✅ Post created successfully!**
5. The post will appear at the top of the feed

## If You Still Get 401 Error
1. Make sure both servers are running:
   - API: `npm run dev` (port 3001)
   - Web: `npm run dev` (port 3000)
2. Check that `.env` files have matching JWT_SECRET:
   - Root `.env`: `JWT_SECRET="dev-secret-change-in-production"`
   - `apps/api/.env`: `JWT_SECRET="dev-secret-change-in-production"`

## Technical Details
- JWT_SECRET in root `.env`: `dev-secret-change-in-production`
- JWT_SECRET in `apps/api/.env`: `dev-secret-change-in-production`
- Both are now synchronized ✅
- New posts appear at top via socket.io real-time updates
- Success notification shows when post is created
