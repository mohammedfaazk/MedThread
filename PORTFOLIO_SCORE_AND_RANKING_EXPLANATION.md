# Portfolio Score Calculation & Top Doctors Ranking Logic

## Portfolio Score Calculation

The portfolio score is a **running score** that tracks doctor performance based on patient outcomes and feedback. It's stored in the `DoctorPerformance.portfolioScore` field.

### How Portfolio Score is Calculated:

#### 1. **Patient Feedback Impact**
When patients provide feedback through the `submitPatientFeedback` method:

```javascript
// POSITIVE OUTCOMES (+10 points)
if (status === 'CURED') {
  portfolioScore += 10
  curedPatientCount += 1
}

// NEGATIVE OUTCOMES (-5 points)  
if (status === 'CONSULT_NEW_DOCTOR') {
  portfolioScore -= 5
  consultNewDoctorCount += 1
}

// NEUTRAL OUTCOMES (no score change)
if (status === 'NOT_YET') {
  notYetCount += 1
  // No portfolio score change
}
```

#### 2. **Score Components**
- **Base Score:** Starts at 0
- **Cured Patients:** +10 points each
- **Lost Patients:** -5 points each (when they consult another doctor)
- **Ongoing Cases:** No score impact (patients still recovering)

#### 3. **Example Calculation**
```
Doctor A:
- 5 patients cured: 5 × 10 = +50 points
- 1 patient lost: 1 × (-5) = -5 points
- 2 patients still recovering: 2 × 0 = 0 points
Total Portfolio Score: 45 points
```

## Top Doctors Ranking Logic

### Primary Ranking Criteria: **Cured Patient Count**

The top doctors are ranked by `curedPatientCount` in **descending order**:

```javascript
return doctorsWithStats
  .sort((a, b) => b.curedPatientCount - a.curedPatientCount)
  .slice(0, limit);
```

### Why Cured Patient Count (Not Portfolio Score)?

The current logic prioritizes **actual patient outcomes** over the composite score:
- **Cured Patient Count:** Direct measure of successful treatments
- **Portfolio Score:** Includes penalties that might not reflect true performance

### Ranking Process:

#### 1. **Doctor Filtering**
```javascript
const where = {
  role: 'DOCTOR',
  doctorVerificationStatus: 'APPROVED'
};

// Optional filters:
if (specialty) where.specialty = specialty;
if (region) where.pincode = region;
```

#### 2. **Data Collection**
For each doctor, the system collects:
- Basic info: `id`, `username`, `specialty`, `avatar`, `pincode`
- Performance metrics: `curedPatientCount`, `conversionCount`, `portfolioScore`, `helpfulnessScore`

#### 3. **Sorting & Display**
```javascript
// Primary sort: Cured patients (highest first)
.sort((a, b) => b.curedPatientCount - a.curedPatientCount)

// Display in TopDoctorsWidget:
// - Green heart icon: curedPatientCount
// - Orange star icon: conversionCount
```

## Regional vs Global Ranking

### Regional Filtering
- **Enabled when:** User has pincode AND selects "Regional" view
- **Filter:** `where.pincode = user.pincode`
- **Result:** Only doctors in same pincode area

### Global Ranking
- **Enabled when:** User selects "Global" view OR no pincode available
- **Filter:** No pincode restriction
- **Result:** All approved doctors regardless of location

## Current Metrics Displayed

### In TopDoctorsWidget:
1. **Cured Patients** (Green Heart): `curedPatientCount`
2. **Conversions** (Orange Star): `conversionCount`

### In Doctor Profiles:
1. **Portfolio Score**: `portfolioScore`
2. **Cured Patients**: `curedPatientCount`
3. **Clinic Visits**: `clinicVisitCount`
4. **Helpfulness Score**: `helpfulnessScore`

## Performance Tracking Events

### 1. **Comment Conversions**
```javascript
// When patient clicks "Message" from doctor's comment
trackCommentConversion(action: 'message_click')
// Result: conversionCount += 1
```

### 2. **Clinic Visits**
```javascript
// When patient books appointment
trackClinicVisit(doctorId, patientId)
// Result: clinicVisitCount += 1
```

### 3. **Patient Feedback**
```javascript
// When patient provides outcome feedback
submitPatientFeedback({
  status: 'CURED' | 'NOT_YET' | 'CONSULT_NEW_DOCTOR'
})
// Result: Updates portfolioScore and counts
```

## Database Schema Summary

```sql
DoctorPerformance {
  portfolioScore        Float   @default(0)    -- Composite score
  curedPatientCount     Int     @default(0)    -- PRIMARY RANKING METRIC
  conversionCount       Int     @default(0)    -- Profile → Message clicks
  clinicVisitCount      Int     @default(0)    -- Appointment bookings
  notYetCount           Int     @default(0)    -- Patients still recovering
  consultNewDoctorCount Int     @default(0)    -- Patients who left
  helpfulnessScore      Float?                 -- 0-5 rating
}
```

## Key Insights

### 1. **Ranking Priority**
- **Primary:** Cured Patient Count (actual outcomes)
- **Secondary:** Conversion Count (engagement)
- **Not Used for Ranking:** Portfolio Score (used for display only)

### 2. **Score Philosophy**
- **Outcome-focused:** Rewards successful treatments
- **Penalty system:** Discourages patient loss
- **Engagement tracking:** Measures profile-to-message conversion

### 3. **Regional Intelligence**
- **Location-aware:** Uses pincode for regional filtering
- **User-centric:** Shows relevant local doctors first
- **Fallback:** Global view when regional data insufficient

This system prioritizes **real patient outcomes** over composite scores, ensuring that doctors who actually help patients recover are ranked highest.