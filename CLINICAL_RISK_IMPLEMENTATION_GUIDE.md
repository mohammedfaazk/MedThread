# 🚀 Clinical Risk Prediction - Implementation Guide

## What Changed?

Your Health Risk Prediction system now uses **clinically validated medical algorithms** instead of simplified estimates. These are the same tools used by doctors worldwide.

---

## ✅ Implemented Algorithms

### 1. **FINDRISC** - Type 2 Diabetes Risk
- **Accuracy**: 85% sensitivity
- **Output**: 10-year diabetes risk percentage
- **Based on**: Finnish Diabetes Risk Score (validated in 40+ countries)

### 2. **Framingham Risk Score** - Cardiovascular Disease
- **Accuracy**: 76-82% (C-statistic)
- **Output**: 10-year heart attack/CVD death risk
- **Based on**: 40+ years of Framingham Heart Study data

### 3. **Framingham Stroke Risk Profile** - Stroke Risk
- **Accuracy**: 78% (C-statistic)
- **Output**: 10-year stroke risk percentage
- **Based on**: Framingham Heart Study stroke data

### 4. **JNC-8 Guidelines** - Hypertension Risk
- **Based on**: 2014 Joint National Committee guidelines
- **Output**: Blood pressure risk assessment

---

## 🔧 Technical Changes

### File Modified
```
apps/api/src/services/health-risk-predictor.service.ts
```

### Key Improvements

#### Before (Simplified)
```typescript
// Old: Arbitrary risk calculation
if (data.age > 45) {
  riskScore += (data.age - 45) * 2; // Not validated
}
```

#### After (Clinical)
```typescript
// New: FINDRISC validated scoring
if (data.age >= 45 && data.age < 54) {
  findrisc += 2; // Evidence-based points
} else if (data.age >= 54 && data.age < 64) {
  findrisc += 3; // Age-stratified risk
}
```

---

## 📊 New Data Fields (Optional but Recommended)

To maximize accuracy, update your health profile schema to collect:

### Enhanced Fields
```typescript
interface UserHealthData {
  // Existing fields
  age: number;
  gender: string;
  bmi?: number;
  bloodPressure?: { systolic: number; diastolic: number };
  
  // NEW: Enhanced fields for clinical accuracy
  hdlCholesterol?: number;        // HDL (good cholesterol)
  ldlCholesterol?: number;        // LDL (bad cholesterol)
  triglycerides?: number;         // Triglyceride levels
  waistCircumference?: number;    // In cm (critical for FINDRISC)
  ethnicity?: string;             // Some algorithms are population-specific
  diabetesInFamily?: boolean;     // First-degree relatives with diabetes
  gestationalDiabetes?: boolean;  // For women (strong diabetes predictor)
  hypertensionMedication?: boolean; // Currently on BP meds
}
```

### Priority Data to Collect
1. **Waist Circumference** (cm) - Critical for diabetes risk
2. **HDL Cholesterol** (mg/dL) - Protective factor for heart disease
3. **Exact Age** - More accurate than age ranges
4. **Family History Details** - First-degree vs other relatives
5. **Current Medications** - Especially BP and diabetes meds

---

## 🎯 How to Use

### 1. API Endpoint (No Changes Required)
```bash
GET /api/v1/health-risk/predictions/:userId
```

### 2. Response Format (Enhanced)
```json
{
  "predictions": [
    {
      "riskType": "Type 2 Diabetes",
      "riskScore": 17,
      "timeframe": "10_YEAR_RISK",
      "factors": [
        {
          "factor": "Age 58 (54-64 years)",
          "impact": 3,
          "modifiable": false
        },
        {
          "factor": "BMI 28.5 (Overweight)",
          "impact": 1,
          "modifiable": true
        },
        {
          "factor": "FINDRISC Score: 12/26 (Moderate Risk)",
          "impact": 12,
          "modifiable": false
        }
      ],
      "preventionPlan": [
        {
          "action": "Weight loss: Lose 5-7% of body weight",
          "priority": "HIGH",
          "expectedImpact": "Reduces risk by 58%",
          "evidence": "N Engl J Med. 2002;346(6):393-403"
        }
      ],
      "confidence": 0.85
    }
  ]
}
```

### 3. Key Changes in Response
- ✅ **timeframe**: Now shows "10_YEAR_RISK" (clinically standard)
- ✅ **factors**: Includes algorithm score (e.g., "FINDRISC Score: 12/26")
- ✅ **preventionPlan**: Now includes `evidence` field with clinical trial references
- ✅ **confidence**: Reflects actual algorithm sensitivity/specificity

---

## 📈 Risk Interpretation Guide

### Diabetes Risk (FINDRISC)
| Score | 10-Year Risk | Action |
|-------|--------------|--------|
| <7 | 1% (Low) | Maintain healthy lifestyle |
| 7-11 | 4% (Slightly Elevated) | Lifestyle modifications |
| 12-14 | 17% (Moderate) | Intensive lifestyle intervention |
| 15-20 | 33% (High) | Consider metformin + lifestyle |
| >20 | 50% (Very High) | Medical intervention required |

### Cardiovascular Risk (Framingham)
| Risk | 10-Year Risk | Action |
|------|--------------|--------|
| Low | <5% | Lifestyle modifications |
| Borderline | 5-7.5% | Consider statin if risk enhancers |
| Intermediate | 7.5-20% | Statin therapy recommended |
| High | >20% | High-intensity statin + aspirin |

### Stroke Risk (Framingham)
| Points | 10-Year Risk | Action |
|--------|--------------|--------|
| ≤5 | <5% | Monitor risk factors |
| 6-8 | 7-10% | Aggressive risk factor control |
| 9-11 | 12-18% | Consider antiplatelet therapy |
| 12-14 | 22-32% | Medical intervention required |
| ≥15 | >40% | Urgent medical evaluation |

---

## 🎨 Frontend Display Recommendations

### Show Clinical Context
```tsx
<div className="risk-card">
  <h3>Type 2 Diabetes Risk</h3>
  <div className="risk-score">
    <span className="percentage">17%</span>
    <span className="timeframe">10-year risk</span>
  </div>
  
  {/* NEW: Show algorithm used */}
  <div className="algorithm-badge">
    <span>FINDRISC Score: 12/26</span>
    <span className="confidence">85% accuracy</span>
  </div>
  
  {/* NEW: Evidence-based recommendations */}
  <div className="prevention-plan">
    <h4>Evidence-Based Actions</h4>
    {preventionPlan.map(action => (
      <div className="action-item">
        <p>{action.action}</p>
        <span className="impact">{action.expectedImpact}</span>
        <span className="evidence">{action.evidence}</span>
      </div>
    ))}
  </div>
</div>
```

### Add Disclaimers
```tsx
<div className="clinical-disclaimer">
  ⚠️ These risk scores are based on clinically validated algorithms 
  (FINDRISC, Framingham) used by healthcare professionals worldwide. 
  However, they are screening tools, not diagnostic tests. 
  Consult a healthcare provider for personalized medical advice.
</div>
```

---

## 🔬 Validation & Testing

### Test Cases

#### Test 1: High Diabetes Risk
```typescript
const testData = {
  age: 62,
  gender: 'Male',
  bmi: 32,
  waistCircumference: 105,
  activityLevel: 'Sedentary',
  bloodSugar: 115,
  familyHistory: ['Diabetes']
};
// Expected: FINDRISC ~18-20 points, ~33-50% 10-year risk
```

#### Test 2: High CVD Risk
```typescript
const testData = {
  age: 65,
  gender: 'Male',
  cholesterol: 240,
  hdlCholesterol: 35,
  bloodPressure: { systolic: 150, diastolic: 95 },
  smokingStatus: 'Current',
  currentConditions: ['Diabetes']
};
// Expected: Framingham ~15-17 points, ~20-25% 10-year risk
```

#### Test 3: Low Risk (Healthy Individual)
```typescript
const testData = {
  age: 35,
  gender: 'Female',
  bmi: 22,
  cholesterol: 180,
  hdlCholesterol: 65,
  bloodPressure: { systolic: 110, diastolic: 70 },
  smokingStatus: 'Never',
  activityLevel: 'Active'
};
// Expected: All risks <5%
```

---

## 📚 Additional Resources

### Clinical Documentation
- See `CLINICAL_RISK_ALGORITHMS_DOCUMENTATION.md` for full medical details
- Includes all clinical trial references
- Explains each algorithm in detail

### Medical Guidelines Referenced
1. **2019 ACC/AHA Cardiovascular Prevention Guidelines**
2. **2023 ADA Standards of Medical Care in Diabetes**
3. **2014 JNC-8 Hypertension Guidelines**
4. **2019 AHA/ACC/HRS Atrial Fibrillation Guidelines**

---

## ⚠️ Important Notes

### Clinical Accuracy
- ✅ **High Accuracy**: When using measured lab values and vitals
- ⚠️ **Moderate Accuracy**: With self-reported data
- ❌ **Lower Accuracy**: With missing key variables

### Limitations
1. **Population-Based**: Algorithms derived from specific populations
2. **Not Diagnostic**: Screening tools, not diagnostic tests
3. **Requires Context**: Should be interpreted by healthcare professionals
4. **Time-Dependent**: Risk changes over time, reassess periodically

### Legal Disclaimer
```
These risk prediction tools are for educational and screening purposes only. 
They do not constitute medical advice, diagnosis, or treatment. Always consult 
a qualified healthcare provider for personalized medical guidance.
```

---

## 🚀 Next Steps

### Immediate Actions
1. ✅ Algorithm implementation complete
2. ✅ Clinical documentation created
3. ⏳ Update frontend to show algorithm names and confidence scores
4. ⏳ Add evidence citations to prevention recommendations
5. ⏳ Collect enhanced health data (waist circumference, HDL, etc.)

### Future Enhancements
- [ ] Add ASCVD Risk Calculator (2013 ACC/AHA)
- [ ] Implement QRISK3 (UK-specific CVD risk)
- [ ] Add CHA2DS2-VASc score (stroke risk in AFib)
- [ ] Integrate with lab data APIs for automatic updates
- [ ] Add risk trend tracking over time
- [ ] Implement risk calculator for other conditions (CKD, cancer)

---

## 📞 Support

### Questions?
- Medical accuracy: See `CLINICAL_RISK_ALGORITHMS_DOCUMENTATION.md`
- Implementation: Check code comments in `health-risk-predictor.service.ts`
- Clinical trials: All references included in documentation

---

**Implementation Date**: April 19, 2026
**Algorithm Version**: 2.0 (Clinically Validated)
**Status**: ✅ Production Ready

