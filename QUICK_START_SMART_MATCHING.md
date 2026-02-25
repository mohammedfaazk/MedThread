# Smart Matching Algorithm - Quick Start Guide

## What It Does
Intelligently matches patients with best-fit doctors based on symptoms, location, availability, language, insurance, and past success with similar cases.

## How It Works

### 1. Patient Enters Symptoms
```typescript
symptoms: ['cough', 'fever', 'shortness of breath']
```

### 2. System Analyzes
- Identifies symptom categories (Respiratory, Infectious)
- Extracts related specialties (Pulmonology, Internal Medicine)
- Finds doctors with expertise in those areas

### 3. Calculates Match Scores
7 criteria with weighted scoring:
- **Specialty (30%)** - Expertise with similar symptoms
- **Location (25%)** - Distance from patient
- **Availability (20%)** - Next available slot
- **Rating (15%)** - Patient ratings
- **Language (5%)** - Language compatibility
- **Insurance (5%)** - Insurance acceptance
- **Experience** - Success rate with similar cases

### 4. Returns Top Matches
Sorted by overall match score with detailed breakdown.

## API Usage

### Find Matches
```bash
POST /api/matching/find
Authorization: Bearer <token>

{
  "symptoms": ["headache", "dizziness", "nausea"],
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "preferredLanguage": "en",
  "insuranceProvider": "Blue Cross",
  "maxDistance": 50,
  "minRating": 4.0,
  "consultationType": "any",
  "preferredGender": "any",
  "limit": 10
}
```

### Response
```json
{
  "success": true,
  "data": {
    "matches": [
      {
        "doctor": {
          "id": "doc123",
          "username": "Smith",
          "specialty": "Neurology",
          "overall_rating": 4.8,
          "total_reviews": 156
        },
        "matchScore": 87.5,
        "scores": {
          "specialty": 92,
          "location": 85,
          "availability": 100,
          "rating": 96,
          "language": 100,
          "insurance": 100,
          "experience": 88
        },
        "distance": 3.2,
        "matchReason": "High expertise in treating similar cases • Nearby location (3.2km) • Available soon",
        "estimatedWaitTime": 45
      }
    ],
    "total": 10
  }
}
```

## Frontend Integration

### Basic Usage
```tsx
import SmartDoctorMatcher from '@/components/SmartDoctorMatcher';

export default function FindDoctorPage() {
  return <SmartDoctorMatcher />;
}
```

### Features
- Symptom input with tags
- Location detection (browser geolocation)
- Advanced filters (collapsible)
- Match results with:
  - Rank badges (#1 gold, #2 silver, #3 bronze)
  - Match score percentage
  - Match reason explanation
  - Stats (rating, experience, distance, wait time)
  - Score breakdown with progress bars
  - Book appointment / View profile buttons

## Database Setup

### 1. Run Migration
```bash
cd packages/database
npx prisma migrate deploy
```

### 2. Verify Tables
```bash
cd apps/api
npx ts-node test-smart-matching.ts
```

Should show:
- ✓ 10 symptom categories
- ✓ calculate_match_score function exists

## Adding Sample Data

### Doctor Expertise
```sql
INSERT INTO "DoctorExpertise" (
  doctor_id, expertise_area, symptom_categories,
  cases_handled, success_rate, confidence_level
) VALUES (
  'doctor_id', 'Respiratory Conditions',
  ARRAY['Respiratory', 'Infectious'],
  150, 92.5, 'expert'
);
```

### Doctor Languages
```sql
INSERT INTO "DoctorLanguage" (
  doctor_id, language_code, language_name,
  proficiency_level, is_primary
) VALUES (
  'doctor_id', 'en', 'English', 'native', true
);
```

### Doctor Insurance
```sql
INSERT INTO "DoctorInsurance" (
  doctor_id, insurance_provider, insurance_plan_types,
  is_in_network, verification_status
) VALUES (
  'doctor_id', 'Blue Cross', ARRAY['PPO', 'HMO'],
  true, 'verified'
);
```

## Symptom Categories

Pre-loaded with 10 categories:
1. **Respiratory** - cough, shortness of breath, wheezing
2. **Cardiovascular** - chest pain, palpitations, irregular heartbeat
3. **Gastrointestinal** - abdominal pain, nausea, vomiting
4. **Neurological** - headache, dizziness, numbness
5. **Musculoskeletal** - joint pain, back pain, muscle pain
6. **Dermatological** - rash, itching, skin lesion
7. **Mental Health** - anxiety, depression, stress
8. **Endocrine** - fatigue, weight changes, thyroid issues
9. **Infectious** - fever, chills, body aches
10. **Pediatric** - developmental delays, childhood illnesses

## Patient Preferences

### Update Preferences
```bash
PUT /api/matching/preferences
Authorization: Bearer <token>

{
  "specialtyWeight": 30,
  "locationWeight": 25,
  "availabilityWeight": 20,
  "ratingWeight": 15,
  "languageWeight": 5,
  "insuranceWeight": 5,
  "maxDistance": 50,
  "minRating": 4.0,
  "preferredConsultationType": "any",
  "preferredGender": "any"
}
```

## Feedback System

### Submit Feedback
```bash
POST /api/matching/feedback
Authorization: Bearer <token>

{
  "matchingResultId": 123,
  "wasHelpful": true,
  "feedbackType": "good_match",
  "feedbackText": "Found exactly what I needed",
  "matchAccuracyRating": 4.5
}
```

Feedback types:
- `good_match` - Match was accurate
- `poor_match` - Match was not relevant
- `booked` - Booked appointment with matched doctor
- `not_available` - Doctor was not available

## Testing

### Test Symptom Matching
```bash
cd apps/api
npx ts-node test-smart-matching.ts
```

### Test API Endpoint
```bash
curl -X POST http://localhost:3001/api/matching/find \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": ["cough", "fever"],
    "limit": 5
  }'
```

## Performance Optimization

### Indexes Created
- Symptom category keywords (GIN)
- Doctor expertise categories (GIN)
- Match result scores (DESC)
- Location-based queries (GIST)

### Caching
- Distance calculations cached (5-minute TTL)
- Match results stored for analytics

## Troubleshooting

### No Matches Found
- Check if doctors have expertise records
- Verify symptom keywords match categories
- Reduce filters (maxDistance, minRating)

### Low Match Scores
- Add more doctor expertise data
- Update case history records
- Verify doctor ratings are current

### Location Not Working
- Enable browser location permissions
- Check HTTPS (required for geolocation)
- Verify doctor clinic locations exist

## Next Steps

1. Add doctor expertise for existing doctors
2. Set up language capabilities
3. Configure insurance providers
4. Add case history from past appointments
5. Test with real patient searches
6. Monitor match accuracy via feedback
7. Adjust weights based on feedback data

## Support

For issues or questions:
- Check `SMART_MATCHING_COMPLETE.md` for full documentation
- Review test script output
- Verify database migrations applied
- Check API logs for errors

---

**Status:** ✅ Ready to use
**Version:** 1.0
**Last Updated:** February 24, 2026
