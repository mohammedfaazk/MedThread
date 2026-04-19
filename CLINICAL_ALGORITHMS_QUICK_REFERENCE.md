# 🏥 Clinical Risk Algorithms - Quick Reference Card

## At a Glance

| Algorithm | Disease | Accuracy | Risk Period | Status |
|-----------|---------|----------|-------------|--------|
| **FINDRISC** | Type 2 Diabetes | 85% | 10 years | ✅ Active |
| **Framingham CVD** | Heart Disease | 82% | 10 years | ✅ Active |
| **Framingham Stroke** | Stroke | 80% | 10 years | ✅ Active |
| **JNC-8** | Hypertension | N/A | Current | ✅ Active |

---

## FINDRISC (Diabetes Risk)

### Scoring (0-26 points)
- Age 45-54: +2 | 54-64: +3 | 64+: +4
- BMI 25-30: +1 | 30+: +3
- Waist (M: 94-102cm): +3 | 102+: +4
- Waist (F: 80-88cm): +3 | 88+: +4
- Sedentary: +2
- No vegetables daily: +1
- High BP history: +2
- High glucose: +5
- Family history: +3 to +5
- Gestational diabetes: +5

### Risk Levels
- <7: 1% risk (Low)
- 7-11: 4% risk (Slightly Elevated)
- 12-14: 17% risk (Moderate)
- 15-20: 33% risk (High)
- >20: 50% risk (Very High)

### Top Interventions
1. Weight loss 5-7% → 58% ↓ risk
2. Exercise 150 min/week → 40% ↓ risk
3. Metformin (if high risk) → 31% ↓ risk

---

## Framingham CVD Risk

### Key Factors
- Age (gender-specific points)
- Total cholesterol
- HDL cholesterol (protective)
- Blood pressure
- Smoking (+8-9 points)
- Diabetes (+4-6 points)

### Risk Categories
- <5%: Low
- 5-7.5%: Borderline
- 7.5-20%: Intermediate
- >20%: High

### Top Interventions
1. Smoking cessation → 50% ↓ risk (1 year)
2. Statin therapy → 25-30% ↓ risk
3. BP control → 20% ↓ per 10 mmHg
4. Mediterranean diet → 30% ↓ risk

---

## Framingham Stroke Risk

### Major Risk Factors
- Age (0-10 points)
- Systolic BP (0-10 points)
- Hypertension meds (+2)
- Diabetes (+3)
- Smoking (+3)
- CVD history (+4)
- Atrial fibrillation (+6)
- LV hypertrophy (+5)

### Risk Levels
- ≤5 points: <5% risk
- 6-8: 7-10% risk
- 9-11: 12-18% risk
- 12-14: 22-32% risk
- ≥15: >40% risk

### Top Interventions
1. BP control <120/80 → 30-40% ↓ risk
2. Anticoagulation (AFib) → 60-70% ↓ risk
3. Statin therapy → 20-25% ↓ risk
4. Antiplatelet therapy → 15-20% ↓ risk

---

## JNC-8 Hypertension

### Blood Pressure Categories
- Normal: <120/80
- Elevated: 120-129/<80
- Stage 1: 130-139/80-89
- Stage 2: ≥140/90

### Top Interventions
1. DASH diet → 8-14 mmHg ↓
2. Sodium <2300mg → 5-6 mmHg ↓
3. Weight loss 5-10% → 5-20 mmHg ↓
4. Exercise 150 min/week → 5-8 mmHg ↓
5. Limit alcohol → 2-4 mmHg ↓

---

## Clinical Trial Evidence

### Diabetes Prevention
- **DPP**: Lifestyle 58% ↓, Metformin 31% ↓
- **PREDIMED**: Mediterranean diet 30% ↓ CVD

### Cardiovascular
- **SPRINT**: Intensive BP control 27% ↓ stroke
- **SPARCL**: Statin 20-25% ↓ stroke

### Stroke Prevention
- **AFib Anticoagulation**: 60-70% ↓ stroke
- **Aspirin**: 15-20% ↓ stroke (high risk)

---

## When to Refer to Doctor

### Immediate Referral
- Any 10-year risk >20%
- Multiple high-risk factors
- Symptoms present
- Atrial fibrillation
- Very high BP (≥180/120)

### Routine Referral
- 10-year risk 10-20%
- Family history of early disease
- Prediabetes (glucose 100-125)
- Stage 1 hypertension
- High cholesterol (>240)

---

## Data Quality Impact

### High Accuracy (Use measured values)
- ✅ Lab-tested cholesterol, glucose, HbA1c
- ✅ Measured blood pressure
- ✅ Measured waist circumference
- ✅ Exact age
- ✅ Detailed family history

### Moderate Accuracy (Self-reported OK)
- ⚠️ Self-reported height/weight
- ⚠️ Estimated activity level
- ⚠️ General family history

### Lower Accuracy (Avoid if possible)
- ❌ Age ranges instead of exact age
- ❌ Missing key variables
- ❌ Estimated blood pressure
- ❌ No lab values

---

## API Response Format

```json
{
  "riskType": "Type 2 Diabetes",
  "riskScore": 17,
  "timeframe": "10_YEAR_RISK",
  "factors": [
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
```

---

## Key References

1. **FINDRISC**: Lindström & Tuomilehto, *Diabetologia* 2003
2. **Framingham CVD**: D'Agostino et al., *Circulation* 2008
3. **Framingham Stroke**: Wolf et al., *Stroke* 1991
4. **JNC-8**: James et al., *JAMA* 2014
5. **DPP**: Knowler et al., *N Engl J Med* 2002

---

**Version**: 2.0 (Clinically Validated)
**Last Updated**: April 19, 2026

