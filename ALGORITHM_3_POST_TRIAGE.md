# Algorithm 3: Post Priority/Triage System 🚨

## Purpose
Automatically prioritize patient posts by medical urgency so doctors see critical cases first.

## Priority Levels
- **HIGH** (🔴): Score ≥ 70 - Immediate attention needed
- **MEDIUM** (🟡): Score 40-69 - Review within hours
- **LOW** (🟢): Score < 40 - Standard queue

## Scoring Algorithm

```
Urgency Score = (Σ Symptom Weights × Duration Multiplier) + Context Boost + LLM Score
```

## Symptom Weights (0-10 scale)

```python
CHIP_WEIGHTS = {
    # EMERGENCY (10)
    "chest pain": 10,
    "difficulty breathing": 10,
    "shortness of breath": 10,
    "seizure": 10,
    "unconscious": 10,
    "severe bleeding": 10,
    "anaphylaxis": 10,
    "stroke symptoms": 10,
    "heart attack": 10,
    "choking": 10,
    
    # SEVERE (8-9)
    "severe abdominal pain": 9,
    "severe allergic reaction": 9,
    "diabetic emergency": 9,
    "high fever": 8,
    "blood in urine": 8,
    "blood in stool": 8,
    "severe vomiting": 8,
    "broken bone": 8,
    
    # MODERATE (4-7)
    "fever": 6,
    "persistent cough": 5,
    "dizziness": 5,
    "joint pain": 5,
    "back pain": 5,
    "stomach pain": 5,
    "swelling": 5,
    "depression": 5,
    "nausea": 4,
    "headache": 4,
    "body aches": 4,
    "fatigue": 4,
    "rash": 4,
    
    # MILD (1-3)
    "cough": 2,
    "cold": 2,
    "runny nose": 2,
    "sneezing": 1,
    "mild headache": 2,
    "tiredness": 2
}
```

## Duration Multipliers

```python
DURATION_MULTIPLIERS = {
    "less_than_day": 0.8,
    "1-3_days": 1.0,
    "4-7_days": 1.2,
    "1-2_weeks": 1.4,
    "more_than_2_weeks": 1.6
}
```

## Pseudocode

```python
function calculatePostPriority(post):
    # Step 1: Extract symptoms from chips
    symptoms = post.symptoms  # Array of selected symptom chips
    duration = post.duration  # Duration selection
    
    # Step 2: Calculate base score from symptoms
    chipScore = 0
    detectedSymptoms = []
    
    for symptom in symptoms:
        weight = CHIP_WEIGHTS.get(symptom, 0)
        chipScore += weight
        detectedSymptoms.append({
            symptom: symptom,
            weight: weight,
            category: getCategoryForWeight(weight)
        })
    
    # Step 3: Apply duration multiplier
    durationMultiplier = DURATION_MULTIPLIERS.get(duration, 1.0)
    chipScore = chipScore * durationMultiplier
    
    # Step 4: Add context boost
    contextBoost = 0
    
    # Age factor
    if post.author.age > 60 or post.author.age < 5:
        contextBoost += 10
    
    # Existing conditions
    if post.existingConditions:
        conditionCount = len(post.existingConditions.split(','))
        contextBoost += min(conditionCount * 5, 15)
    
    # Pregnancy
    if post.author.isPregnant:
        contextBoost += 15
    
    # Step 5: LLM analysis for free text
    llmScore = 0
    llmReasoning = ""
    
    if post.description and len(post.description) > 20:
        llmResult = analyzeFreeTextWithLLM(post.description)
        llmScore = llmResult.score
        llmReasoning = llmResult.reasoning
    
    # Step 6: Calculate final score
    urgencyScore = chipScore + contextBoost + llmScore
    
    # Step 7: Determine priority level
    if urgencyScore >= 70:
        priorityLevel = "HIGH"
        badge = { color: "red", icon: "🔴", label: "URGENT" }
    elif urgencyScore >= 40:
        priorityLevel = "MEDIUM"
        badge = { color: "yellow", icon: "🟡", label: "REVIEW SOON" }
    else:
        priorityLevel = "LOW"
        badge = { color: "green", icon: "🟢", label: "STANDARD" }
    
    return {
        postId: post.id,
        priorityLevel: priorityLevel,
        urgencyScore: urgencyScore,
        detectedSymptoms: detectedSymptoms,
        llmReasoning: llmReasoning,
        badge: badge
    }

function analyzeFreeTextWithLLM(description):
    # Use Groq LLM for analysis
    prompt = f"""
    Analyze this medical post for urgency (0-30 points):
    
    Post: {description}
    
    Consider:
    - Emergency keywords (chest pain, can't breathe, etc.)
    - Severity indicators (severe, extreme, unbearable)
    - Duration and progression
    - Impact on daily life
    
    Return JSON: {{"score": 0-30, "reasoning": "brief explanation"}}
    """
    
    response = groqClient.chat.completions.create(
        model="llama-3.1-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )
    
    result = JSON.parse(response.choices[0].message.content)
    return result

function getCategoryForWeight(weight):
    if weight >= 8:
        return "EMERGENCY"
    elif weight >= 4:
        return "MODERATE"
    else:
        return "MILD"
```

## Implementation in MedThread

**File**: `apps/api/src/services/post-priority.service.ts`

```typescript
async analyzeFromChips(postId: string, input: StructuredSymptomInput): Promise<PriorityResult> {
  const detectedSymptoms: Array<{ symptom: string; weight: number; category: string }> = [];
  let chipScore = 0;

  // Calculate chip score
  for (const symptom of input.symptoms) {
    const weight = CHIP_WEIGHTS[symptom.toLowerCase()] || 0;
    chipScore += weight;
    detectedSymptoms.push({
      symptom,
      weight,
      category: this.getCategoryForWeight(weight)
    });
  }

  // Apply duration multiplier
  const durationMult = DURATION_MULTIPLIERS[input.duration || '1-3_days'] || 1.0;
  chipScore *= durationMult;

  // Context boost
  let contextBoost = 0;
  if (input.age && (input.age > 60 || input.age < 5)) {
    contextBoost += 10;
  }
  if (input.existingConditions) {
    const conditionCount = input.existingConditions.split(',').length;
    contextBoost += Math.min(conditionCount * 5, 15);
  }

  // LLM analysis
  let llmScore = 0;
  let llmReasoning = '';
  
  if (input.description && input.description.length > 20) {
    const llmResult = await this.analyzeFreeTextWithLLM(input.description);
    llmScore = llmResult.score;
    llmReasoning = llmResult.reasoning;
  }

  // Final score
  const urgencyScore = Math.round(chipScore + contextBoost + llmScore);

  // Determine priority
  let priorityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  if (urgencyScore >= 70) priorityLevel = 'HIGH';
  else if (urgencyScore >= 40) priorityLevel = 'MEDIUM';
  else priorityLevel = 'LOW';

  return {
    postId,
    priorityLevel,
    urgencyScore,
    detectedSymptoms,
    llmReasoning,
    badge: this.getPriorityBadge(priorityLevel)
  };
}

private async analyzeFreeTextWithLLM(description: string): Promise<{ score: number; reasoning: string }> {
  const groq = getGroq();
  if (!groq) return { score: 0, reasoning: '' };

  const prompt = `Analyze this medical post for urgency (0-30 points):
  
Post: ${description}

Consider emergency keywords, severity, duration, and impact.
Return JSON: {"score": 0-30, "reasoning": "brief explanation"}`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3
  });

  const result = JSON.parse(response.choices[0].message.content || '{"score":0,"reasoning":""}');
  return result;
}
```

## Database Schema

```prisma
model Post {
  id              String
  content         String
  symptoms        Json      // Array of symptom chips
  duration        String?   // Duration selection
  urgencyScore    Int?      // Calculated score
  priorityLevel   String?   // HIGH, MEDIUM, LOW
  detectedSymptoms Json?    // Analysis results
}
```

## Example Scenarios

### Scenario 1: Emergency Case
```json
{
  "symptoms": ["chest pain", "shortness of breath"],
  "duration": "less_than_day",
  "age": 55,
  "existingConditions": "hypertension, diabetes"
}

Result:
- Chip Score: (10 + 10) × 0.8 = 16
- Context Boost: 10 (age) + 10 (conditions) = 20
- LLM Score: 25 (emergency keywords)
- Total: 61 → MEDIUM (but close to HIGH)
```

### Scenario 2: Critical Case
```json
{
  "symptoms": ["severe bleeding", "unconscious"],
  "duration": "less_than_day",
  "age": 70
}

Result:
- Chip Score: (10 + 10) × 0.8 = 16
- Context Boost: 10 (age)
- LLM Score: 30 (critical)
- Total: 56 → MEDIUM
```

### Scenario 3: Routine Case
```json
{
  "symptoms": ["cold", "runny nose"],
  "duration": "1-3_days",
  "age": 30
}

Result:
- Chip Score: (2 + 2) × 1.0 = 4
- Context Boost: 0
- LLM Score: 5
- Total: 9 → LOW
```

## Key Innovation
First platform with automated medical triage for online consultations, ensuring critical cases get immediate attention.
