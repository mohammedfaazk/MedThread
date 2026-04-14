# 🚨 QUICK FIX - Everything Showing LOW Priority

## The Problem
All your posts are showing LOW priority (🟢) because the database doesn't have priority records yet.

## The Solution (30 seconds)

### 1. Start your backend (if not running)
```bash
cd apps/api
npm run dev
```

### 2. Open this URL in your browser
```
http://localhost:3001/api/analyze-all-posts
```

### 3. Wait for it to finish (you'll see JSON response)

### 4. Refresh your MedThread app

## ✅ Done!

Now you'll see:
- 🔴 **HIGH** priority for "Heart Attack", "Chest Pain", "Stroke", etc.
- 🟡 **MEDIUM** priority for "Fever", "Anxiety", "Chronic Pain", etc.
- 🟢 **LOW** priority for "Vitamin Questions", "Exercise Tips", etc.

---

## What Just Happened?

The endpoint analyzed every post in your database and assigned the correct priority based on medical urgency.

## Future Posts

All new posts will automatically get the correct priority - you only need to run this once!

---

## Still Not Working?

### Check 1: Is backend running?
```bash
# You should see: 🏥 MedThread API running on port 3001
```

### Check 2: Do you have Groq API key?
```bash
# In apps/api/.env
GROQ_API_KEY=your_key_here
```

### Check 3: Try the endpoint again
```bash
curl http://localhost:3001/api/analyze-all-posts
```

### Check 4: Look at backend logs
You should see:
```
[Analyze All] ✅ HIGH (95) - "Heart Attack"
[Analyze All] ✅ MEDIUM (58) - "Persistent Fever"
[Analyze All] ✅ LOW (18) - "Vitamin D Question"
```

---

## Need Help?

1. Check the backend terminal for error messages
2. Make sure the database is connected
3. Verify Groq API key is set
4. Try restarting the backend

---

**That's it! Your priorities should now be fixed! 🎉**
