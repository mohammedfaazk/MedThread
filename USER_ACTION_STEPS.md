# User Action Steps - Post Creation Fix

## Your Issue
You're getting a **401 Unauthorized** error when trying to create posts.

## Why It's Happening
Your browser has an **old token** that doesn't work with the current API. You need to get a **fresh token** by logging back in.

## Fix It Now (3 Steps - 2 Minutes)

### Step 1: Clear Your Browser Cache
**On Windows/Linux:**
- Press `Ctrl+Shift+R` at the same time

**On Mac:**
- Press `Cmd+Shift+R` at the same time

This clears the old token from your browser.

---

### Step 2: Log Out
1. Click on your **profile picture** (top right)
2. Click **"Logout"**
3. You'll be taken to the login page

---

### Step 3: Log Back In
1. Enter your **email/username**
2. Enter your **password**
3. Click **"Login"**

You now have a **fresh token** that works! ✅

---

## Test It Works

### Create a Post
1. Click **"Create Post"** button
2. Fill in:
   - **Title**: Your post title
   - **Content**: Your post content
   - **Community**: Select a community
3. Click **"Post"**

### You Should See
- ✅ **"✅ Post created successfully!"** message
- ✅ Your post appears at the **top of the feed**
- ✅ Other users see it in real-time

---

## If It Still Doesn't Work

### Check 1: Are Both Servers Running?
Open a terminal and run:
```
npm run dev
```

This should start:
- API server on port 3001
- Web server on port 3000

### Check 2: Clear Browser Cache Completely
1. Press `F12` to open Developer Tools
2. Right-click the refresh button
3. Click **"Empty cache and hard refresh"**

### Check 3: Try Incognito/Private Window
1. Open a new **Incognito** (Chrome) or **Private** (Firefox) window
2. Go to `http://localhost:3000`
3. Log in again
4. Try creating a post

### Check 4: Restart Everything
1. Stop both servers (Ctrl+C)
2. Wait 5 seconds
3. Run `npm run dev` again
4. Try creating a post

---

## What Changed
- Your token is now **synchronized** with the API
- New posts appear at the **top** of the feed
- You get a **success notification** when posts are created

## Questions?
If you're still having issues:
1. Check the browser console (F12 → Console tab)
2. Look for any red error messages
3. Share those errors for debugging

---

## You're Ready! 🎉
Follow these 3 steps and your post creation will work perfectly!
