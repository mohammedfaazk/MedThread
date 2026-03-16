import type { ConversationContext, PatientInfo } from './types'
import { detectEmergency } from './emergencyDetector'

// Model fallback chain — tries each in order until one works
const MODELS = [
  'gemini-1.5-flash',       // Best free-tier quota (15 RPM, 1M TPM)
  'gemini-1.5-flash-8b',    // Even higher quota fallback
]
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

const SYSTEM_PROMPT = `You are Kendall, a compassionate AI health assistant for MedThread — a medical community platform.

CRITICAL RULES:
1. You are NOT a doctor and cannot diagnose. Always clarify this.
2. Ask ONE focused question at a time to understand the user's concern.
3. Use simple, friendly, empathetic language.
4. For serious symptoms, always recommend seeing a real doctor.
5. If symptoms sound like an emergency (chest pain, difficulty breathing, stroke, etc.), immediately say "This sounds like a medical emergency. Please call 911 or your local emergency number immediately."
6. Keep responses concise — 2-4 sentences max unless listing steps.
7. You can help with: symptom guidance, general health questions, medication info, diet/lifestyle tips, when to see a doctor.
8. Never prescribe specific medications or dosages.
9. Be warm and reassuring, not scary.
10. If asked about something non-health related, gently redirect to health topics.

You are here to help patients understand their health better and guide them to appropriate care.`

class KendallAIService {
  private history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = []
  private context: ConversationContext = {
    currentSymptoms: [],
    questionsAsked: [],
    assessmentStage: 'initial',
    emergencyDetected: false,
  }

  isAvailable(): boolean {
    const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
    return typeof window !== 'undefined' && navigator.onLine && key.length > 0
  }

  async chat(userMessage: string, patientInfo?: PatientInfo): Promise<string> {
    // Emergency check first — no API needed
    const emergency = detectEmergency(userMessage, this.context.currentSymptoms)
    if (emergency.isEmergency && emergency.protocol) {
      this.context.emergencyDetected = true
      const { warning, actions } = emergency.protocol
      return `${warning}\n\nImmediate steps:\n${actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}`
    }

    if (this.isAvailable()) {
      const result = await this.tryModels(userMessage, patientInfo)
      if (result) return result
    }

    // Smart rule-based fallback
    return this.getFallbackResponse(userMessage)
  }

  /** Try each model in the fallback chain, skip on 429/quota errors */
  private async tryModels(userMessage: string, patientInfo?: PatientInfo): Promise<string | null> {
    for (const model of MODELS) {
      try {
        return await this.callGemini(model, userMessage, patientInfo)
      } catch (err: any) {
        const is429 = err?.message?.includes('429') || err?.message?.includes('RESOURCE_EXHAUSTED')
        if (is429) {
          console.warn(`[Kendall] ${model} quota exceeded, trying next model...`)
          continue
        }
        // Non-quota error — log and fall through to rule-based
        console.error(`[Kendall] ${model} error:`, err?.message)
        return null
      }
    }
    console.warn('[Kendall] All models exhausted, using rule-based fallback')
    return null
  }

  private async callGemini(model: string, userMessage: string, patientInfo?: PatientInfo): Promise<string> {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''

    let systemPrompt = SYSTEM_PROMPT
    if (patientInfo) {
      systemPrompt += `\n\nPATIENT CONTEXT:\n- Age: ${patientInfo.age}, Gender: ${patientInfo.gender}`
      if (patientInfo.chronicConditions.length)
        systemPrompt += `\n- Chronic conditions: ${patientInfo.chronicConditions.join(', ')}`
      if (patientInfo.allergies.length)
        systemPrompt += `\n- Allergies: ${patientInfo.allergies.join(', ')}`
      if (patientInfo.isPregnant) systemPrompt += `\n- PREGNANT — be extra cautious`
    }

    this.history.push({ role: 'user', parts: [{ text: userMessage }] })

    const body = {
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood. I am Kendall, your health assistant. How can I help you today?' }] },
        ...this.history,
      ],
      generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 512 },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      ],
    }

    const res = await fetch(`${BASE_URL}/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`${res.status}: ${errText}`)
    }

    const data = await res.json()
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm sorry, I couldn't process that. Could you rephrase your question?"

    this.history.push({ role: 'model', parts: [{ text }] })
    return text
  }

  /** Expanded rule-based fallback — covers common health topics */
  private getFallbackResponse(userMessage: string): string {
    const lower = userMessage.toLowerCase()

    // Greetings
    if (/^(hi|hello|hey|good\s*(morning|afternoon|evening)|howdy)/.test(lower))
      return "Hello! I'm Kendall, your health assistant 👋 I can help with symptom guidance, general health questions, and advice on when to see a doctor. What's on your mind?"

    // Fever
    if (lower.includes('fever') || lower.includes('high temperature') || lower.includes('chills'))
      return "For fever, rest and stay well-hydrated. Paracetamol (acetaminophen) can help bring it down. See a doctor if your fever exceeds 103°F (39.5°C), lasts more than 3 days, or is accompanied by a stiff neck or rash. How long have you had it?"

    // Headache
    if (lower.includes('headache') || lower.includes('head pain') || lower.includes('migraine'))
      return "Headaches are often caused by dehydration, stress, or tension. Try drinking water, resting in a quiet dark room, and a gentle neck stretch. If it's sudden and severe (\"thunderclap\"), or comes with vision changes or vomiting, seek care immediately. Is this a new type of headache for you?"

    // Cough / cold / flu
    if (lower.includes('cough') || lower.includes('cold') || lower.includes('flu') || lower.includes('runny nose') || lower.includes('sore throat'))
      return "For cold and flu symptoms, rest, stay hydrated, and try warm liquids like honey-ginger tea. Steam inhalation can ease congestion. See a doctor if you have difficulty breathing, symptoms worsen after 7 days, or you develop a high fever. Any other symptoms alongside this?"

    // Stomach / digestion
    if (lower.includes('stomach') || lower.includes('nausea') || lower.includes('vomit') || lower.includes('diarrhea') || lower.includes('bloat'))
      return "For stomach issues, try the BRAT diet (bananas, rice, applesauce, toast) and sip water or an electrolyte drink frequently. Avoid dairy and fatty foods temporarily. Seek care if vomiting persists over 24 hours, you see blood, or you're severely dehydrated. When did this start?"

    // Pain (general)
    if (lower.includes('pain') || lower.includes('ache') || lower.includes('sore') || lower.includes('hurt'))
      return "I'm sorry you're in pain. To help better, can you tell me: where exactly is the pain, how severe is it on a scale of 1–10, and how long have you had it?"

    // Fatigue / tiredness
    if (lower.includes('tired') || lower.includes('fatigue') || lower.includes('exhausted') || lower.includes('no energy'))
      return "Fatigue can stem from poor sleep, dehydration, stress, or underlying conditions like anemia or thyroid issues. Try improving sleep hygiene, staying hydrated, and eating balanced meals. If it's persistent (more than 2 weeks) or severe, a blood test from your doctor can help identify the cause."

    // Anxiety / stress / mental health
    if (lower.includes('anxious') || lower.includes('anxiety') || lower.includes('stress') || lower.includes('panic') || lower.includes('worried'))
      return "It's completely valid to feel anxious or stressed. Deep breathing (4 counts in, hold 4, out 4) can help in the moment. Regular exercise, sleep, and limiting caffeine also make a big difference. If anxiety is affecting your daily life, speaking with a mental health professional is a great step."

    // Sleep
    if (lower.includes('sleep') || lower.includes('insomnia') || lower.includes('can\'t sleep'))
      return "For better sleep, try keeping a consistent bedtime, avoiding screens 1 hour before bed, and keeping your room cool and dark. Avoid caffeine after 2pm. If insomnia persists for weeks, it's worth discussing with a doctor as it can affect overall health."

    // Diet / nutrition
    if (lower.includes('diet') || lower.includes('nutrition') || lower.includes('weight') || lower.includes('eating'))
      return "A balanced diet rich in vegetables, lean proteins, whole grains, and healthy fats is key to good health. Staying hydrated (8 glasses of water/day) is equally important. Would you like tips on a specific health goal like energy, weight, or digestion?"

    // Medication questions
    if (lower.includes('medication') || lower.includes('medicine') || lower.includes('drug') || lower.includes('tablet') || lower.includes('pill'))
      return "I can share general information about medications, but I can't recommend specific dosages — that requires a doctor or pharmacist who knows your full medical history. What would you like to know?"

    // Blood pressure
    if (lower.includes('blood pressure') || lower.includes('hypertension') || lower.includes('bp'))
      return "Normal blood pressure is around 120/80 mmHg. High BP (hypertension) often has no symptoms but increases risk of heart disease and stroke. Reducing salt, exercising regularly, and managing stress can help. If you're consistently above 130/80, please see a doctor."

    // Diabetes / blood sugar
    if (lower.includes('diabetes') || lower.includes('blood sugar') || lower.includes('glucose'))
      return "Managing blood sugar involves a balanced diet (low refined carbs), regular exercise, and monitoring. Symptoms of high blood sugar include excessive thirst, frequent urination, and fatigue. If you suspect diabetes or have a family history, a fasting blood glucose test is a good starting point."

    // Default
    return "I'm here to help with your health questions. Could you describe what you're experiencing in a bit more detail? For example, what symptoms you have, how long they've lasted, and their severity — that helps me give you more useful guidance."
  }

  reset(): void {
    this.history = []
    this.context = {
      currentSymptoms: [],
      questionsAsked: [],
      assessmentStage: 'initial',
      emergencyDetected: false,
    }
  }

  getContext(): ConversationContext {
    return this.context
  }
}

export const kendallAI = new KendallAIService()
