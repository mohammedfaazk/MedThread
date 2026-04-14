# Algorithm 4: Outbreak Detection Service 🦠

## Purpose
Analyze symptom clusters geographically and temporally to detect disease outbreaks in real-time.

## Algorithm Overview

**Detection Process**:
1. Collect symptom reports from geographic regions
2. Group by location and symptom patterns
3. Match patterns to known diseases
4. Calculate growth rates
5. Determine outbreak severity
6. Generate alerts and action items

## Disease Pattern Database

```python
DISEASE_PATTERNS = {
    "Dengue": {
        "symptoms": ["fever", "joint pain", "rash", "headache", "muscle pain"],
        "minSymptomMatch": 3,
        "seasonality": ["monsoon", "post-monsoon"],
        "incubationDays": 4-7
    },
    "Malaria": {
        "symptoms": ["fever", "chills", "sweating", "headache", "nausea"],
        "minSymptomMatch": 3,
        "seasonality": ["monsoon"],
        "incubationDays": 10-15
    },
    "COVID-19": {
        "symptoms": ["fever", "cough", "difficulty breathing", "loss of taste", "fatigue"],
        "minSymptomMatch": 2,
        "seasonality": ["all"],
        "incubationDays": 2-14
    },
    "Influenza": {
        "symptoms": ["fever", "body ache", "cough", "sore throat", "fatigue"],
        "minSymptomMatch": 3,
        "seasonality": ["winter"],
        "incubationDays": 1-4
    },
    "Typhoid": {
        "symptoms": ["prolonged fever", "weakness", "stomach pain", "headache"],
        "minSymptomMatch": 2,
        "seasonality": ["summer"],
        "incubationDays": 6-30
    },
    "Cholera": {
        "symptoms": ["severe diarrhea", "dehydration", "vomiting"],
        "minSymptomMatch": 2,
        "seasonality": ["monsoon"],
        "incubationDays": 1-5
    },
    "Chikungunya": {
        "symptoms": ["fever", "severe joint pain", "muscle pain", "rash"],
        "minSymptomMatch": 3,
        "seasonality": ["monsoon"],
        "incubationDays": 3-7
    }
}
```

## Pseudocode

```python
function analyzeSymptomClusters(timeWindow):
    # Step 1: Get symptom reports from time window
    daysAgo = 7 if timeWindow == "7_DAYS" else 30
    startDate = now - timedelta(days=daysAgo)
    
    symptomReports = database.getSymptomReports(
        reportedAt >= startDate
    )
    
    # Step 2: Group by location
    clusters = {}
    for report in symptomReports:
        location = report.city or report.district or report.state
        if location not in clusters:
            clusters[location] = []
        clusters[location].append(report)
    
    # Step 3: Analyze each cluster
    for location, reports in clusters.items():
        analyzeCluster(location, reports, timeWindow)

function analyzeCluster(location, reports, timeWindow):
    # Step 1: Count symptom frequencies
    symptomFrequency = {}
    for report in reports:
        for symptom in report.symptoms:
            symptomFrequency[symptom] = symptomFrequency.get(symptom, 0) + 1
    
    # Step 2: Find symptom combinations
    symptomCombinations = {}
    for report in reports:
        combo = tuple(sorted(report.symptoms))
        symptomCombinations[combo] = symptomCombinations.get(combo, 0) + 1
    
    # Step 3: Match to known diseases
    for disease, pattern in DISEASE_PATTERNS.items():
        matchScore = calculateDiseaseMatch(
            symptomFrequency,
            pattern.symptoms,
            pattern.minSymptomMatch
        )
        
        if matchScore >= pattern.minSymptomMatch:
            # Found potential outbreak
            affectedCount = countAffectedPeople(reports, pattern.symptoms)
            
            # Step 4: Calculate growth rate
            previousPeriod = getPreviousPeriodReports(location, timeWindow)
            previousCount = countAffectedPeople(previousPeriod, pattern.symptoms)
            
            if previousCount > 0:
                growthRate = ((affectedCount - previousCount) / previousCount) * 100
            else:
                growthRate = 100  # New outbreak
            
            # Step 5: Determine severity
            severity = determineSeverity(affectedCount, growthRate)
            
            # Step 6: Check if outbreak threshold met
            if affectedCount >= 5 and (growthRate > 50 or affectedCount > 20):
                # Create outbreak alert
                createOutbreakAlert(
                    location=location,
                    disease=disease,
                    affectedCount=affectedCount,
                    growthRate=growthRate,
                    severity=severity,
                    confidence=matchScore / pattern.minSymptomMatch
                )

function calculateDiseaseMatch(symptomFreq, diseaseSymptoms, minMatch):
    matchCount = 0
    for symptom in diseaseSymptoms:
        if symptom in symptomFreq and symptomFreq[symptom] >= 3:
            matchCount += 1
    return matchCount

function determineSeverity(affectedCount, growthRate):
    if affectedCount > 50 and growthRate > 100:
        return "CRITICAL"
    elif affectedCount > 30 or growthRate > 75:
        return "HIGH"
    elif affectedCount > 15 or growthRate > 40:
        return "MEDIUM"
    else:
        return "LOW"

function countAffectedPeople(reports, diseaseSymptoms):
    affected = set()
    for report in reports:
        matchCount = 0
        for symptom in diseaseSymptoms:
            if symptom in report.symptoms:
                matchCount += 1
        
        if matchCount >= 2:  # At least 2 matching symptoms
            affected.add(report.userId)
    
    return len(affected)
```

## Implementation in MedThread

**File**: `apps/api/src/services/outbreak-detection.service.ts`

```typescript
async analyzeSymptomClusters(timeWindow: '7_DAYS' | '30_DAYS' = '7_DAYS'): Promise<void> {
  const daysAgo = timeWindow === '7_DAYS' ? 7 : 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysAgo);

  // Get symptom reports
  const symptomReports = await prisma.symptomReport.findMany({
    where: { reportedAt: { gte: startDate } },
    select: {
      symptoms: true,
      location: true,
      city: true,
      district: true,
      state: true,
      severity: true,
      reportedAt: true
    }
  });

  // Group by location
  const clusters = this.groupSymptomsByLocation(symptomReports);

  // Analyze each cluster
  for (const [location, data] of Object.entries(clusters)) {
    await this.analyzeCluster(location, data, timeWindow);
  }
}

private async analyzeCluster(location: string, reports: any[], timeWindow: string): Promise<void> {
  // Count symptom frequencies
  const symptomFrequency = new Map<string, number>();
  
  for (const report of reports) {
    const symptoms = Array.isArray(report.symptoms) ? report.symptoms : [];
    for (const symptom of symptoms) {
      symptomFrequency.set(symptom, (symptomFrequency.get(symptom) || 0) + 1);
    }
  }

  // Match to known diseases
  const diseasePatterns = {
    'Dengue': ['fever', 'joint pain', 'rash', 'headache'],
    'Malaria': ['fever', 'chills', 'sweating', 'headache'],
    'COVID-19': ['fever', 'cough', 'difficulty breathing', 'loss of taste'],
    'Influenza': ['fever', 'body ache', 'cough', 'sore throat']
  };

  for (const [disease, symptoms] of Object.entries(diseasePatterns)) {
    const matchCount = symptoms.filter(s => 
      (symptomFrequency.get(s) || 0) >= 3
    ).length;

    if (matchCount >= 2) {
      // Calculate affected count
      const affectedCount = this.countAffectedPeople(reports, symptoms);

      // Get previous period data
      const previousReports = await this.getPreviousPeriodReports(location, timeWindow);
      const previousCount = this.countAffectedPeople(previousReports, symptoms);

      // Calculate growth rate
      const growthRate = previousCount > 0 
        ? ((affectedCount - previousCount) / previousCount) * 100 
        : 100;

      // Determine severity
      const severity = this.determineSeverity(affectedCount, growthRate);

      // Create alert if threshold met
      if (affectedCount >= 5 && (growthRate > 50 || affectedCount > 20)) {
        await this.createOutbreakAlert({
          location,
          disease,
          affectedCount,
          growthRate,
          severity,
          confidence: matchCount / symptoms.length
        });
      }
    }
  }
}

private determineSeverity(affectedCount: number, growthRate: number): string {
  if (affectedCount > 50 && growthRate > 100) return 'CRITICAL';
  if (affectedCount > 30 || growthRate > 75) return 'HIGH';
  if (affectedCount > 15 || growthRate > 40) return 'MEDIUM';
  return 'LOW';
}
```

## Database Schema

```prisma
model OutbreakAlert {
  id            String
  location      String
  disease       String
  affectedCount Int
  growthRate    Float
  severity      String    // CRITICAL, HIGH, MEDIUM, LOW
  confidence    Float
  status        String    // ACTIVE, RESOLVED, MONITORING
  detectedAt    DateTime
  actionItems   Json
}

model SymptomReport {
  id          String
  userId      String
  symptoms    Json      // Array of symptoms
  location    String
  city        String?
  district    String?
  state       String?
  pincode     String?
  severity    String?
  reportedAt  DateTime
}
```

## Example Output

```json
{
  "location": "Mumbai",
  "disease": "Dengue",
  "affectedCount": 45,
  "growthRate": 125.5,
  "severity": "HIGH",
  "confidence": 0.85,
  "alertMessage": "Dengue outbreak detected in Mumbai",
  "actionItems": [
    "Increase mosquito control measures",
    "Public awareness campaign",
    "Stock up on IV fluids and platelet units",
    "Monitor for severe cases"
  ],
  "detectedAt": "2026-03-27T15:30:00Z"
}
```

## Key Innovation
First patient-driven outbreak detection system that identifies epidemics weeks before government reports.
