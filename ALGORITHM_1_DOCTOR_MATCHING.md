# Algorithm 1: Smart Doctor Matching 🎯

## Purpose
Match patients with doctors based on **PROVEN success rates** for specific conditions, not just specialty.

## Scoring System (0-100 points)

```
Total Match Score = Specialization(30) + Success Rate(25) + 
                    Response Time(15) + Satisfaction(15) + 
                    Availability(10) + Language(5)
```

## Pseudocode

```python
function findBestDoctorMatches(patientId, criteria):
    # Step 1: Get patient medical history
    patient = database.getUser(patientId)
    
    # Step 2: Filter doctors by basic criteria
    doctors = database.getDoctors(
        role = "DOCTOR",
        verificationStatus = "APPROVED",
        location = criteria.location,
        notSuspended = true
    )
    
    # Step 3: Calculate match score for each doctor
    matches = []
    for doctor in doctors:
        score = 0
        reasons = []
        
        # A. Specialization Match (30 points max)
        specialization = database.getDoctorSpecialization(
            doctorId = doctor.id,
            condition = criteria.condition
        )
        if specialization and specialization.patientCount > 0:
            score += min(30, 15 + (specialization.patientCount / 10) * 15)
            reasons.append(f"Treated {specialization.patientCount} patients with {criteria.condition}")
        else:
            score += 15  # Basic specialty match
            
        # B. Success Rate (25 points max)
        cureRate = (doctor.curedPatientCount / doctor.totalPatientsHelped) * 100
        if cureRate > 80:
            score += 25
            reasons.append(f"{cureRate}% cure rate")
        elif cureRate > 60:
            score += 20
        elif cureRate > 40:
            score += 15
        else:
            score += 10
                
        # C. Response Time (15 points max)
        avgResponseHours = doctor.avgReplyTimeHours
        if avgResponseHours < 1:
            score += 15
            reasons.append(f"Responds in {avgResponseHours * 60} minutes")
        elif avgResponseHours < 4:
            score += 12
        elif avgResponseHours < 24:
            score += 8
        else:
            score += 3
            
        # D. Patient Satisfaction (15 points max)
        helpfulnessScore = doctor.helpfulnessScore  # 0-5 rating
        score += (helpfulnessScore / 5) * 15
        reasons.append(f"{helpfulnessScore}/5 rating")
        
        # E. Availability (10 points max)
        nextSlot = doctor.nextAvailableSlot
        if nextSlot:
            hoursUntil = (nextSlot.startTime - now) / 3600
            if hoursUntil < 2:
                score += 10
                reasons.append("Available now")
            elif hoursUntil < 24:
                score += 8
            elif hoursUntil < 72:
                score += 6
            else:
                score += 3
                
        # F. Language Match (5 points max)
        if criteria.language in doctor.languages:
            score += 5
            reasons.append(f"Speaks {criteria.language}")
            
        # Only include if score > 30
        if score > 30:
            matches.append({
                doctor: doctor,
                matchScore: score,
                reasons: reasons
            })
    
    # Step 4: Sort and return top 10
    matches.sort(key=lambda x: x.matchScore, reverse=True)
    return matches[:10]
```

## Implementation in MedThread

**File**: `apps/api/src/services/smart-doctor-matching.service.ts`

```typescript
async findBestMatches(patientId: string, criteria: MatchCriteria): Promise<DoctorMatch[]> {
  // Get patient data
  const patient = await prisma.user.findUnique({
    where: { id: patientId },
    include: { healthProfile: true, patientHealthProfile: true }
  });

  // Get verified doctors
  const doctors = await prisma.user.findMany({
    where: {
      role: 'DOCTOR',
      doctorVerificationStatus: 'APPROVED',
      isSuspended: false
    },
    include: {
      doctorPerformance: true,
      doctorActivityMetrics: true,
      availabilities: { where: { isBooked: false, startTime: { gte: new Date() } } }
    }
  });

  // Calculate scores
  const matches: DoctorMatch[] = [];
  for (const doctor of doctors) {
    const matchResult = await this.calculateMatchScore(doctor, criteria, patient);
    if (matchResult.matchScore > 30) {
      matches.push(matchResult);
    }
  }

  // Sort and return top 10
  matches.sort((a, b) => b.matchScore - a.matchScore);
  return matches.slice(0, 10);
}
```

## Database Schema

```prisma
model DoctorSpecialization {
  id            String
  doctorId      String
  condition     String
  patientCount  Int      // Total patients treated
  curedCount    Int      // Patients cured
  improvedCount Int      // Patients improved
  successRate   Float    // (cured + improved) / total
  
  @@unique([doctorId, condition])
}

model DoctorPerformance {
  doctorId              String @unique
  totalPatientsHelped   Int
  curedPatientCount     Int
  improvedPatientCount  Int
  helpfulnessScore      Float  // 0-5 rating
  totalRatings          Int
}

model DoctorActivityMetrics {
  doctorId          String @unique
  avgReplyTimeHours Float
  totalReplies      Int
  activeThreads     Int
}
```

## Example Output

```json
{
  "doctorId": "doc123",
  "matchScore": 87,
  "doctor": {
    "name": "Dr. Sharma",
    "specialty": "Cardiology",
    "yearsOfExperience": 15
  },
  "reasons": [
    "Treated 45 patients with Heart Disease (92% success rate)",
    "Responds in 25 minutes on average",
    "4.8/5 patient rating from 120 reviews",
    "Available today"
  ],
  "estimatedResponseTime": 0.42
}
```

## Key Innovation
First platform to track and match by **condition-specific success rates**, not just general specialty.
