# Algorithm 2: Health Risk Predictor 🔮

## Purpose
Predict health risks **6-12 months in advance** using metabolic calculations and risk factor analysis.

## Diseases Predicted
1. Type 2 Diabetes
2. Heart Disease
3. Hypertension
4. Stroke

## Diabetes Risk Prediction Algorithm

### Pseudocode

```python
function predictDiabetesRisk(healthData):
    riskScore = 0
    factors = []
    
    # 1. Age Factor (max 20 points)
    if healthData.age > 45:
        ageRisk = min((healthData.age - 45) * 2, 20)
        riskScore += ageRisk
        factors.append({
            factor: f"Age {healthData.age}",
            impact: ageRisk,
            modifiable: false
        })
    
    # 2. BMI Factor (max 25 points)
    if healthData.bmi > 25:
        if healthData.bmi > 30:
            bmiRisk = 25  # Obese
        elif healthData.bmi > 27:
            bmiRisk = 20  # Overweight
        else:
            bmiRisk = 15  # Slightly overweight
        
        riskScore += bmiRisk
        factors.append({
            factor: f"BMI {healthData.bmi}",
            impact: bmiRisk,
            modifiable: true
        })
    
    # 3. Blood Sugar Factor (max 30 points)
    if healthData.bloodSugar:
        if healthData.bloodSugar > 125:  # Prediabetic
            sugarRisk = 30
        elif healthData.bloodSugar > 100:  # Elevated
            sugarRisk = 20
        else:
            sugarRisk = 0
        
        if sugarRisk > 0:
            riskScore += sugarRisk
            factors.append({
                factor: f"Blood sugar {healthData.bloodSugar} mg/dL",
                impact: sugarRisk,
                modifiable: true
            })
    
    # 4. Family History (max 15 points)
    if "diabetes" in healthData.familyHistory:
        riskScore += 15
        factors.append({
            factor: "Family history of diabetes",
            impact: 15,
            modifiable: false
        })
    
    # 5. Activity Level (max 10 points)
    if healthData.activityLevel == "sedentary":
        riskScore += 10
        factors.append({
            factor: "Sedentary lifestyle",
            impact: 10,
            modifiable: true
        })
    
    # 6. Generate Prevention Plan
    preventionPlan = []
    
    if healthData.bmi > 25:
        preventionPlan.append({
            action: "Lose 5-10% of body weight",
            priority: "HIGH",
            expectedImpact: "Reduces risk by 58%"
        })
    
    if healthData.activityLevel == "sedentary":
        preventionPlan.append({
            action: "Exercise 150 minutes per week",
            priority: "HIGH",
            expectedImpact: "Reduces risk by 30-40%"
        })
    
    if healthData.bloodSugar > 100:
        preventionPlan.append({
            action: "Reduce sugar and refined carbs",
            priority: "HIGH",
            expectedImpact: "Can normalize blood sugar"
        })
    
    return {
        riskType: "Type 2 Diabetes",
        riskScore: riskScore,
        timeframe: "6-12 months",
        factors: factors,
        preventionPlan: preventionPlan,
        confidence: 0.78
    }
```

## Heart Disease Risk Prediction

### Pseudocode

```python
function predictHeartDiseaseRisk(healthData):
    riskScore = 0
    factors = []
    
    # 1. Blood Pressure Factor (max 30 points)
    if healthData.bloodPressure:
        systolic = healthData.bloodPressure.systolic
        diastolic = healthData.bloodPressure.diastolic
        
        if systolic > 140 or diastolic > 90:  # Hypertension
            riskScore += 30
            factors.append({
                factor: f"High BP {systolic}/{diastolic}",
                impact: 30,
                modifiable: true
            })
        elif systolic > 130 or diastolic > 85:  # Elevated
            riskScore += 20
            factors.append({
                factor: f"Elevated BP {systolic}/{diastolic}",
                impact: 20,
                modifiable: true
            })
    
    # 2. Cholesterol Factor (max 25 points)
    if healthData.cholesterol:
        if healthData.cholesterol > 240:  # High
            cholRisk = 25
        elif healthData.cholesterol > 200:  # Borderline
            cholRisk = 15
        else:
            cholRisk = 0
        
        if cholRisk > 0:
            riskScore += cholRisk
            factors.append({
                factor: f"Cholesterol {healthData.cholesterol} mg/dL",
                impact: cholRisk,
                modifiable: true
            })
    
    # 3. Smoking Factor (max 25 points)
    if healthData.smokingStatus == "current":
        riskScore += 25
        factors.append({
            factor: "Current smoker",
            impact: 25,
            modifiable: true
        })
    elif healthData.smokingStatus == "former":
        riskScore += 10
        factors.append({
            factor: "Former smoker",
            impact: 10,
            modifiable: false
        })
    
    # 4. Age and Gender Factor (max 15 points)
    if healthData.gender == "male" and healthData.age > 45:
        riskScore += 15
        factors.append({
            factor: "Male over 45",
            impact: 15,
            modifiable: false
        })
    elif healthData.gender == "female" and healthData.age > 55:
        riskScore += 15
        factors.append({
            factor: "Female over 55",
            impact: 15,
            modifiable: false
        })
    
    # 5. Family History (max 15 points)
    if "heart disease" in healthData.familyHistory:
        riskScore += 15
        factors.append({
            factor: "Family history of heart disease",
            impact: 15,
            modifiable: false
        })
    
    # 6. BMI Factor (max 10 points)
    if healthData.bmi > 30:
        riskScore += 10
        factors.append({
            factor: f"BMI {healthData.bmi} (obese)",
            impact: 10,
            modifiable: true
        })
    
    # Generate Prevention Plan
    preventionPlan = []
    
    if healthData.smokingStatus == "current":
        preventionPlan.append({
            action: "Quit smoking immediately",
            priority: "HIGH",
            expectedImpact: "Reduces risk by 50% within 1 year"
        })
    
    if healthData.bloodPressure.systolic > 130:
        preventionPlan.append({
            action: "Lower blood pressure through diet and exercise",
            priority: "HIGH",
            expectedImpact: "Each 10mmHg reduction = 20% lower risk"
        })
    
    if healthData.cholesterol > 200:
        preventionPlan.append({
            action: "Reduce LDL cholesterol below 100 mg/dL",
            priority: "HIGH",
            expectedImpact: "30% risk reduction"
        })
    
    return {
        riskType: "Heart Disease",
        riskScore: riskScore,
        timeframe: "6-12 months",
        factors: factors,
        preventionPlan: preventionPlan,
        confidence: 0.75
    }
```

## Implementation in MedThread

**File**: `apps/api/src/services/health-risk-predictor.service.ts`

```typescript
async predictHealthRisks(userId: string): Promise<RiskPrediction[]> {
  // Get user health data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      healthProfile: true,
      patientHealthProfile: true,
      symptomReports: { orderBy: { reportedAt: 'desc' }, take: 10 }
    }
  });

  const healthData = this.extractHealthData(user);
  const predictions: RiskPrediction[] = [];

  // Predict various risks
  predictions.push(await this.predictDiabetesRisk(healthData));
  predictions.push(await this.predictHeartDiseaseRisk(healthData));
  predictions.push(await this.predictHypertensionRisk(healthData));
  predictions.push(await this.predictStrokeRisk(healthData));

  // Save predictions
  for (const prediction of predictions) {
    await this.savePrediction(userId, prediction);
  }

  return predictions.filter(p => p.riskScore > 20);
}

private async predictDiabetesRisk(data: UserHealthData): Promise<RiskPrediction> {
  let riskScore = 0;
  const factors: any[] = [];

  // Age factor
  if (data.age > 45) {
    const ageRisk = Math.min((data.age - 45) * 2, 20);
    riskScore += ageRisk;
    factors.push({ factor: `Age ${data.age}`, impact: ageRisk, modifiable: false });
  }

  // BMI factor
  if (data.bmi && data.bmi > 25) {
    let bmiRisk = data.bmi > 30 ? 25 : data.bmi > 27 ? 20 : 15;
    riskScore += bmiRisk;
    factors.push({ factor: `BMI ${data.bmi}`, impact: bmiRisk, modifiable: true });
  }

  // Blood sugar factor
  if (data.bloodSugar) {
    let sugarRisk = data.bloodSugar > 125 ? 30 : data.bloodSugar > 100 ? 20 : 0;
    if (sugarRisk > 0) {
      riskScore += sugarRisk;
      factors.push({ factor: `Blood sugar ${data.bloodSugar}`, impact: sugarRisk, modifiable: true });
    }
  }

  return {
    riskType: 'Type 2 Diabetes',
    riskScore,
    timeframe: '6-12 months',
    factors,
    preventionPlan: this.generatePreventionPlan(factors, data),
    confidence: 0.78
  };
}
```

## Database Schema

```prisma
model HealthRiskPrediction {
  id              String   @id @default(cuid())
  userId          String
  riskType        String
  riskScore       Int
  timeframe       String
  factors         Json
  preventionPlan  Json
  confidence      Float
  predictedAt     DateTime @default(now())
  isActive        Boolean  @default(true)
  
  user User @relation(fields: [userId], references: [id])
}
```

## Example Output

```json
{
  "riskType": "Type 2 Diabetes",
  "riskScore": 75,
  "timeframe": "6-12 months",
  "factors": [
    { "factor": "Age 52", "impact": 14, "modifiable": false },
    { "factor": "BMI 31.2 (obese)", "impact": 25, "modifiable": true },
    { "factor": "Blood sugar 118 mg/dL", "impact": 20, "modifiable": true },
    { "factor": "Family history", "impact": 15, "modifiable": false },
    { "factor": "Sedentary lifestyle", "impact": 10, "modifiable": true }
  ],
  "preventionPlan": [
    {
      "action": "Lose 5-10% of body weight",
      "priority": "HIGH",
      "expectedImpact": "Reduces risk by 58%"
    },
    {
      "action": "Exercise 150 minutes per week",
      "priority": "HIGH",
      "expectedImpact": "Reduces risk by 30-40%"
    }
  ],
  "confidence": 0.78
}
```
