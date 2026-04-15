# Post Priority Keywords Guide

This guide shows you what keywords to use in your posts to trigger different priority levels.

## 🔴 HIGH Priority (Urgent/Emergency)
**Score: 8-10** - These posts appear at the top with red badges

### Emergency Keywords:
- chest pain
- difficulty breathing / shortness of breath / can't breathe
- heart attack / cardiac arrest / myocardial infarction
- stroke / stroke symptoms
- seizure
- unconscious / unresponsive / loss of consciousness
- severe bleeding
- choking / not breathing
- anaphylaxis / severe allergic reaction / anaphylactic
- severe abdominal pain
- crushing chest pain / severe chest pressure / radiating pain
- diabetic emergency
- severe asthma / severe injury / severe burns
- suicidal thoughts / suicide / self harm / overdose
- poisoning
- high fever (with other symptoms)
- blood in urine / blood in stool
- severe vomiting
- broken bone / fracture / major trauma
- difficulty swallowing
- emergency / critical / life threatening

### Example HIGH Priority Post:
```
Title: "Experiencing severe chest pain and shortness of breath"
Content: "I've been having crushing chest pain for the last 30 minutes. 
The pain is radiating to my left arm and I'm having difficulty breathing. 
Should I go to the ER?"
```

---

## 🟡 MEDIUM Priority (Needs Attention)
**Score: 4-7** - These posts appear in the middle with yellow badges

### Common Keywords:
- fever (without severe symptoms)
- persistent cough / chronic cough
- dizziness
- joint pain / back pain / muscle pain
- stomach pain / abdominal pain
- headache (not severe)
- nausea / vomiting
- body aches / fatigue
- rash / skin rash
- diarrhea / constipation
- insomnia / sleep problems
- anxiety / depression
- swelling
- weight loss / weight gain
- urinary problems
- memory problems
- sore throat
- ear pain / eye pain
- loss of appetite / chills
- infection / bleeding
- worsening symptoms / getting worse
- persistent pain / chronic pain

### Example MEDIUM Priority Post:
```
Title: "Persistent fever and body aches for 5 days"
Content: "I've had a fever of 101°F for the past 5 days along with body aches 
and fatigue. I've been taking over-the-counter medication but it's not helping. 
Should I see a doctor?"
```

---

## 🟢 LOW Priority (Routine/Wellness)
**Score: 1-3** - These posts appear at the bottom with green badges

### Wellness Keywords:
- cold / common cold
- cough (mild)
- runny nose / sneezing
- mild headache
- tiredness / stress
- dry skin
- seasonal allergies
- vitamin / supplement
- diet / nutrition
- exercise / fitness
- sleep hygiene / wellness
- lifestyle / prevention
- minor ache

### Example LOW Priority Post:
```
Title: "Best vitamins for energy?"
Content: "I've been feeling a bit tired lately and wondering what vitamins 
or supplements might help boost my energy levels. Any recommendations?"
```

---

## 💡 Tips for Priority Detection

1. **Multiple Symptoms = Higher Priority**
   - "fever + chest pain" → HIGH
   - "fever + cough" → MEDIUM
   - "mild headache" → LOW

2. **Duration Matters**
   - Symptoms lasting 2+ weeks get a priority boost
   - Sudden onset of severe symptoms → HIGH

3. **Age & Conditions Boost Priority**
   - Age 60+ or under 5 years old → +2 points
   - Existing conditions (diabetes, heart disease, asthma) → +2 points

4. **Severity Words Matter**
   - "severe" + any symptom → Higher priority
   - "mild" + any symptom → Lower priority
   - "chronic" or "persistent" → Medium priority

5. **Negation is Detected**
   - "no chest pain" → Won't trigger HIGH priority
   - The AI understands context

---

## 🎯 Quick Reference Table

| Priority | Score Range | Badge | Typical Response Time |
|----------|-------------|-------|----------------------|
| 🔴 HIGH | 8-10 | Red | Immediate (minutes) |
| 🟡 MEDIUM | 4-7 | Yellow | Within hours |
| 🟢 LOW | 1-3 | Green | Within days |

---

## 🧪 Testing Priority Levels

### Test HIGH Priority:
Create a post with: "severe chest pain and difficulty breathing"

### Test MEDIUM Priority:
Create a post with: "persistent fever and body aches for 5 days"

### Test LOW Priority:
Create a post with: "looking for vitamin recommendations for energy"

---

## 📊 How It Works

The system uses:
1. **Keyword Matching** - Scans your post for medical keywords
2. **Weight Scoring** - Each keyword has a weight (1-10)
3. **Duration Multiplier** - Longer symptoms get higher scores
4. **Context Boost** - Age and existing conditions add points
5. **AI Analysis** - Groq LLM analyzes free-text for additional context

Your post's final score determines its priority level and position in the feed.
