# Groq API Setup Instructions 🤖

## Current Status
The MedThread AI Diet Planner is currently using **fallback mode** because the Groq API key is not configured.

## How to Enable Full AI Features

### Step 1: Get Your Groq API Key
1. Visit: https://console.groq.com/keys
2. Sign up or log in to your Groq account
3. Create a new API key
4. Copy the API key (starts with `gsk_...`)

### Step 2: Update Your .env File
Replace the placeholder in your `.env` file:

**Current:**
```env
GROQ_API_KEY="your_groq_api_key_here"
```

**Update to:**
```env
GROQ_API_KEY="gsk_your_actual_api_key_here"
```

### Step 3: Restart the Application
After updating the .env file:
```bash
# Stop the current application (Ctrl+C)
# Then restart:
npm run dev
```

## What Changes When Groq API is Enabled

### Current Fallback Mode
- ✅ Basic diet plans generated
- ✅ Nutritional calculations work
- ✅ Considers user health profile
- ⚠️ Generic meal suggestions

### With Groq AI Enabled
- ✅ **Personalized AI-generated meal plans**
- ✅ **Medical condition-specific recommendations**
- ✅ **Detailed nutritional explanations**
- ✅ **Variety in meal suggestions**
- ✅ **Cultural and dietary preference awareness**

## Testing AI Diet Planner

### After Adding Your API Key:
1. **Restart the app**: `npm run dev`
2. **Visit**: http://localhost:3000/diet
3. **Complete health profile** if not done
4. **Generate diet plan** and see AI-powered results

### Test Script:
```bash
# Test the diet planner functionality
node scripts/test-diet-planner.js
```

## API Key Security

### ✅ Good Practices:
- Keep your API key in `.env` file only
- Never commit API keys to version control
- Use different keys for development/production

### ⚠️ Important Notes:
- The `.env` file is already in `.gitignore`
- Your API key will not be exposed in the frontend
- Only the backend API service uses the Groq key

## Troubleshooting

### If AI Features Don't Work:
1. **Check API key format**: Should start with `gsk_`
2. **Verify .env file**: No extra spaces or quotes
3. **Restart application**: Changes require restart
4. **Check console logs**: Look for Groq-related errors

### Fallback Mode Will Continue If:
- API key is missing or invalid
- Groq service is temporarily unavailable
- Network connectivity issues

## Cost Information
- **Groq API**: Generally very affordable
- **Free tier**: Usually available for testing
- **Usage**: Only charged when generating diet plans
- **Fallback**: No cost when using basic mode

---

**Ready to enable full AI features? Just add your Groq API key to the .env file!** 🚀