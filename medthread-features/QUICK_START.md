# Quick Start Guide

Get started with VitaVoice features in Medthread in 5 minutes.

## 📦 What's Included

```
medthread-features/
├── 1-kendall-ai-assistant/     # Voice AI healthcare assistant
├── 2-emergency-services/       # Emergency page with hospital locator
├── 3-calorie-diet-planner/     # Meal planning and nutrition
├── README.md                   # Overview
├── FEATURE_SUMMARY.md          # Technical details
├── MIGRATION_CHECKLIST.md      # Complete checklist
└── bundle-features.ps1         # Bundling script
```

## 🚀 Quick Integration (Choose One Feature)

### Option 1: Kendall AI Assistant

```bash
# 1. Install dependencies
npm install axios

# 2. Add to .env
echo "VITE_GEMINI_API_KEY=your_key_here" >> .env

# 3. Copy folder
cp -r medthread-features/1-kendall-ai-assistant src/features/

# 4. Add route
# In your router file:
import { Chat } from './features/1-kendall-ai-assistant/components/Chat';
<Route path="/chat" element={<Chat />} />

# 5. Wrap with provider
# In App.tsx:
import { AppProvider } from './features/1-kendall-ai-assistant/context/AppContext';
<AppProvider><YourApp /></AppProvider>
```

### Option 2: Emergency Services

```bash
# 1. Install dependencies
npm install leaflet react-leaflet axios @types/leaflet

# 2. Add CSS import
# In main.tsx or App.css:
@import 'leaflet/dist/leaflet.css';

# 3. Copy folder
cp -r medthread-features/2-emergency-services src/features/

# 4. Add route
import { Emergency } from './features/2-emergency-services/components/Emergency';
<Route path="/emergency" element={<Emergency />} />
```

### Option 3: Calorie Diet Planner

```bash
# 1. No extra dependencies needed!

# 2. Copy folder
cp -r medthread-features/3-calorie-diet-planner src/features/

# 3. Add route
import { DietNutrition } from './features/3-calorie-diet-planner/components/DietNutrition';
<Route path="/diet-plan" element={<DietNutrition />} />
```

## 🔧 Update Import Paths

After copying, update imports in all files from:
```typescript
import { something } from '@/services/...'
```

To your project's structure:
```typescript
import { something } from '../services/...'
// or
import { something } from '@/features/feature-name/services/...'
```

## ✅ Verify Installation

### Test Kendall AI
1. Navigate to `/chat`
2. Click microphone button
3. Say "I have a headache"
4. Verify voice response

### Test Emergency
1. Navigate to `/emergency`
2. Allow location permissions
3. Verify map loads with hospitals
4. Click a hospital card

### Test Diet Planner
1. Navigate to `/diet-plan`
2. Click "Plan My Day"
3. Enter 2000 calories
4. Select "Veg"
5. Click "Generate Plan"

## 📚 Next Steps

1. Read feature-specific INTEGRATION.md files
2. Customize for your needs
3. Update styling to match Medthread
4. Add to navigation menu
5. Test on mobile devices

## 🆘 Troubleshooting

### Kendall AI not responding
- Check API key in .env
- Restart dev server
- Check browser console for errors

### Map not showing
- Verify Leaflet CSS imported
- Check map container has height
- Allow location permissions

### Import errors
- Update all `@/` imports to relative paths
- Check file paths are correct
- Verify dependencies installed

## 📖 Documentation

- `README.md` - Overview and dependencies
- `FEATURE_SUMMARY.md` - Technical details
- `INTEGRATION.md` (per feature) - Step-by-step guide
- `MIGRATION_CHECKLIST.md` - Complete checklist

## 🎯 Integration Time Estimates

- Kendall AI: 2-3 hours
- Emergency: 1-2 hours
- Diet Planner: 30-60 minutes

## 💡 Tips

1. Start with one feature at a time
2. Test thoroughly before moving to next
3. Keep original files as backup
4. Use feature flags for gradual rollout
5. Monitor console for errors

## 🔗 Useful Links

- Gemini API: https://makersuite.google.com/app/apikey
- Leaflet Docs: https://leafletjs.com/
- OpenStreetMap: https://www.openstreetmap.org/

## 📞 Support

Check individual feature READMEs for detailed troubleshooting and customization options.

---

**Ready to integrate? Start with the feature that best fits your immediate needs!**
