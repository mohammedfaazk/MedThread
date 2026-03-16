# VitaVoice Features - Technical Summary

## Overview

Three production-ready healthcare features extracted from VitaVoice for integration into Medthread.

---

## Feature 1: Kendall AI Assistant

### What It Does
Voice-first multilingual healthcare assistant that helps users describe symptoms, detects emergencies, and provides health guidance.

### Key Capabilities
- **Voice I/O**: Speech-to-text and text-to-speech using Web Speech API
- **7 Languages**: English, Tamil, Telugu, Hindi, Bengali, Kannada, Malayalam
- **AI-Powered**: Google Gemini API for natural conversations
- **Offline Mode**: Rule-based fallback when no internet
- **Emergency Detection**: Automatic detection of critical symptoms
- **Conversation Memory**: Maintains context across messages

### Technical Stack
- React + TypeScript
- Google Gemini 2.5 Flash API
- Web Speech API (browser native)
- Motion (animations)
- Axios (HTTP client)

### Files (10 total)
```
components/
  ├── Chat.tsx (main interface)
  └── OfflineBanner.tsx
services/
  ├── aiService.ts (AI + rule-based logic)
  ├── speechService.ts (voice I/O)
  ├── languageService.ts (translations)
  ├── emergencyDetector.ts (emergency rules)
  └── symptomEngine.ts (symptom analysis)
config/
  └── constants.ts (languages, diseases, keywords)
hooks/
  └── useTranslation.ts
context/
  └── AppContext.tsx (global state)
types/
  └── health.ts
utils/
  └── debugApi.ts
```

### Dependencies
- axios
- Peer: react, react-dom, react-router-dom, motion, lucide-react

### Environment Variables
```env
VITE_GEMINI_API_KEY=your_key_here
```

### Integration Complexity: ⭐⭐⭐ (Medium)
- Requires API key setup
- Needs AppProvider wrapper
- Voice requires HTTPS
- Multilingual setup

### Use Cases
- Symptom checker
- Health Q&A
- Emergency triage
- Multilingual support
- Voice-first accessibility

---

## Feature 2: Emergency Services

### What It Does
Emergency page with one-tap 108 calling, GPS-based hospital locator, interactive map, and first aid guide.

### Key Capabilities
- **Emergency Call**: Animated button to call 108
- **Hospital Finder**: Searches within 50km radius using OpenStreetMap
- **Interactive Map**: Leaflet map with user location and hospital markers
- **GPS Location**: Browser geolocation with IP fallback
- **Hospital Details**: Distance, phone, address, directions
- **First Aid Guide**: Expandable guides for common emergencies

### Technical Stack
- React + TypeScript
- Leaflet + React-Leaflet (maps)
- OpenStreetMap Overpass API (hospital data)
- Axios (HTTP client)
- Motion (animations)

### Files (8 total)
```
components/
  ├── Emergency.tsx (main page)
  ├── Map.tsx (Leaflet map)
  ├── HospitalList.tsx (list view)
  └── HospitalCard.tsx (individual card)
services/
  ├── hospitalService.ts (Overpass API)
  └── emergencyDetector.ts (protocols)
config/
  └── constants.ts
hooks/
  └── useTranslation.ts
types/
  └── health.ts
```

### Dependencies
- leaflet
- react-leaflet
- axios
- @types/leaflet (dev)
- Peer: react, react-dom, react-router-dom, motion, lucide-react

### Environment Variables
None required (uses free OpenStreetMap API)

### Integration Complexity: ⭐⭐ (Easy-Medium)
- Requires Leaflet CSS import
- Map container needs explicit height
- Location permissions needed

### Use Cases
- Emergency situations
- Hospital locator
- First aid reference
- Navigation to facilities
- Emergency protocols

---

## Feature 3: Calorie Diet Planner

### What It Does
Generates personalized meal plans based on calorie goals, diet type (veg/non-veg/vegan), and health restrictions.

### Key Capabilities
- **Daily Plans**: Full day meal plan (breakfast, lunch, dinner, snacks)
- **Single Meals**: Generate individual meal suggestions
- **Diet Types**: Vegetarian, Non-Vegetarian, Vegan
- **Restrictions**: Filters by allergies and health conditions
- **Macro Tracking**: Protein, carbs, fats breakdown
- **Alternatives**: Generate different meals with same calories
- **Portion Scaling**: Auto-adjusts portions to match calorie target

### Technical Stack
- React + TypeScript
- Motion (animations)
- Local meal database (30+ meals)

### Files (4 total)
```
components/
  └── DietNutrition.tsx (main interface)
services/
  ├── dietPlanService.ts (meal generation)
  └── authService.ts (optional, for user profiles)
hooks/
  └── useTranslation.ts
```

### Dependencies
- Peer only: react, react-dom, react-router-dom, motion, lucide-react

### Environment Variables
None required

### Integration Complexity: ⭐ (Easy)
- No external APIs
- No special setup
- Self-contained logic

### Use Cases
- Meal planning
- Calorie tracking
- Diet management
- Nutrition guidance
- Health-conscious eating

---

## Comparison Matrix

| Feature | Complexity | External APIs | Offline | Mobile | Languages |
|---------|-----------|---------------|---------|--------|-----------|
| Kendall AI | Medium | Gemini API | Yes (fallback) | Yes | 7 |
| Emergency | Easy-Medium | OpenStreetMap | Partial | Yes | 1 (extendable) |
| Diet Planner | Easy | None | Yes | Yes | 1 (extendable) |

---

## Shared Components

### All Features Use:
- React 18.3+
- TypeScript
- Motion (animations)
- Lucide React (icons)
- React Router DOM

### Common Patterns:
- `useTranslation` hook for i18n
- Motion animations for UX
- Mobile-first responsive design
- Accessibility features
- Error boundaries

---

## Data Flow

### Kendall AI Assistant
```
User Voice → Speech API → AI Service → Gemini API → Response
                                    ↓
                              Emergency Detector
                                    ↓
                              Navigate to Emergency
```

### Emergency Services
```
User Location → GPS/IP → Hospital Service → Overpass API → Hospitals
                                                              ↓
                                                         Map + List
```

### Diet Planner
```
User Input → Diet Service → Filter by Type/Restrictions → Scale Portions
                                                              ↓
                                                         Meal Plan
```

---

## Storage

### LocalStorage Keys
- `vitavoice_language` - Selected language
- `vitavoice_autoplay` - Auto-play voice responses
- `vitavoice_voiceSpeed` - Speech rate
- `vitavoice_voiceGender` - Voice gender preference
- `vitavoice_family` - Family members
- `vitavoice_history` - Medical history
- `vitavoice_diet_plans` - Saved diet plans

---

## API Usage

### Gemini API (Kendall)
- **Endpoint**: `generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`
- **Rate Limit**: Per API key quota
- **Cost**: Free tier available, then pay-per-use
- **Fallback**: Rule-based responses

### Overpass API (Emergency)
- **Endpoint**: `overpass-api.de/api/interpreter`
- **Rate Limit**: Fair use policy
- **Cost**: Free
- **Fallback**: Default location

---

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge | Mobile |
|---------|--------|---------|--------|------|--------|
| Kendall AI | ✅ | ⚠️ (limited speech) | ✅ (iOS 14.5+) | ✅ | ✅ |
| Emergency | ✅ | ✅ | ✅ | ✅ | ✅ |
| Diet Planner | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Performance Metrics

### Bundle Sizes (estimated)
- Kendall AI: ~150KB (+ Gemini API calls)
- Emergency: ~200KB (+ Leaflet ~140KB)
- Diet Planner: ~80KB

### Load Times (3G)
- Kendall AI: 2-3s
- Emergency: 3-4s (map tiles)
- Diet Planner: 1-2s

---

## Security Considerations

### Kendall AI
- ⚠️ API key exposed in client (use backend proxy in production)
- ✅ No user data sent to server
- ✅ Conversations not stored remotely

### Emergency
- ✅ No API keys required
- ✅ Location not stored
- ✅ Public hospital data only

### Diet Planner
- ✅ No external APIs
- ✅ Data stored locally only
- ✅ No sensitive information

---

## Accessibility

All features include:
- ✅ Keyboard navigation
- ✅ ARIA labels
- ✅ Screen reader support
- ✅ High contrast mode
- ✅ Touch-friendly (44x44px minimum)
- ✅ Focus indicators

---

## Testing Recommendations

### Unit Tests
- Service functions
- Data transformations
- Filtering logic
- Calculations

### Integration Tests
- API calls
- Component interactions
- Navigation flows
- State management

### E2E Tests
- Complete user journeys
- Voice interactions
- Map interactions
- Form submissions

---

## Maintenance

### Regular Updates
- **Monthly**: Dependency updates
- **Quarterly**: Meal database refresh
- **Annually**: Disease patterns review
- **As Needed**: Emergency protocols, translations

### Monitoring
- API usage and errors
- Feature adoption rates
- Performance metrics
- User feedback

---

## Future Enhancements

### Kendall AI
- [ ] More languages
- [ ] Voice cloning
- [ ] Symptom images
- [ ] Video consultations

### Emergency
- [ ] Ambulance tracking
- [ ] Hospital bed availability
- [ ] Emergency contacts
- [ ] Medical records access

### Diet Planner
- [ ] Meal photos
- [ ] Recipe instructions
- [ ] Shopping lists
- [ ] Meal prep guides
- [ ] Nutrition charts

---

## License & Attribution

- **VitaVoice**: Original project
- **OpenStreetMap**: © OpenStreetMap contributors (ODbL)
- **Leaflet**: BSD 2-Clause License
- **Google Gemini**: Google Terms of Service

---

## Support & Documentation

- Feature READMEs: Detailed feature documentation
- INTEGRATION.md: Step-by-step integration guides
- MIGRATION_CHECKLIST.md: Complete migration checklist
- Code comments: Inline documentation

---

**Package Version**: 1.0.0
**Last Updated**: February 2026
**Extracted From**: VitaVoice v1.0
**Target**: Medthread Integration
