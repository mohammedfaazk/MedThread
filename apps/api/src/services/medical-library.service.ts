/**
 * Medical Content Library Service
 * Provides verified health articles, condition information, first aid guides
 */

export interface MedicalArticle {
  id: string;
  title: string;
  category: 'condition' | 'first-aid' | 'emergency' | 'medication' | 'prevention';
  content: string;
  symptoms?: string[];
  treatments?: string[];
  whenToSeekHelp?: string[];
  verified: boolean;
  lastUpdated: Date;
}

export class MedicalLibraryService {
  private articles: MedicalArticle[] = [
    // Common Conditions
    {
      id: 'fever-management',
      title: 'Fever: When to Worry and How to Manage',
      category: 'condition',
      content: `Fever is a temporary increase in body temperature, often due to an illness. A fever is generally considered to be 100.4°F (38°C) or higher.

**Common Causes:**
- Viral infections (flu, common cold)
- Bacterial infections
- Heat exhaustion
- Certain medications
- Vaccinations

**Home Treatment:**
- Rest and stay hydrated
- Take acetaminophen or ibuprofen (follow dosage instructions)
- Use lukewarm sponge baths
- Wear light clothing
- Keep room temperature comfortable`,
      symptoms: ['High temperature', 'Chills', 'Sweating', 'Headache', 'Muscle aches'],
      treatments: ['Rest', 'Hydration', 'Fever reducers', 'Cool compress'],
      whenToSeekHelp: [
        'Temperature above 103°F (39.4°C)',
        'Fever lasting more than 3 days',
        'Severe headache',
        'Difficulty breathing',
        'Chest pain',
        'Persistent vomiting',
        'Confusion or unusual behavior'
      ],
      verified: true,
      lastUpdated: new Date('2024-01-15')
    },
    {
      id: 'diabetes-basics',
      title: 'Understanding Diabetes: Types, Symptoms, and Management',
      category: 'condition',
      content: `Diabetes is a chronic condition that affects how your body processes blood sugar (glucose).

**Types:**
- Type 1: Body doesn't produce insulin
- Type 2: Body doesn't use insulin properly
- Gestational: Develops during pregnancy

**Management:**
- Regular blood sugar monitoring
- Healthy diet (low sugar, complex carbs)
- Regular exercise
- Medication as prescribed
- Regular check-ups`,
      symptoms: ['Increased thirst', 'Frequent urination', 'Extreme hunger', 'Unexplained weight loss', 'Fatigue', 'Blurred vision'],
      treatments: ['Insulin therapy', 'Oral medications', 'Diet management', 'Exercise', 'Blood sugar monitoring'],
      whenToSeekHelp: [
        'Blood sugar consistently above 240 mg/dL',
        'Signs of ketoacidosis (fruity breath, nausea)',
        'Severe hypoglycemia symptoms',
        'Foot wounds that won\'t heal'
      ],
      verified: true,
      lastUpdated: new Date('2024-01-10')
    },
    {
      id: 'hypertension-guide',
      title: 'High Blood Pressure: Silent Killer Prevention',
      category: 'condition',
      content: `Hypertension (high blood pressure) is when blood pressure readings are consistently 130/80 mmHg or higher.

**Risk Factors:**
- Age (risk increases with age)
- Family history
- Obesity
- Lack of physical activity
- High salt diet
- Excessive alcohol
- Stress

**Prevention & Management:**
- Maintain healthy weight
- Exercise regularly (30 min/day)
- Reduce sodium intake
- Limit alcohol
- Quit smoking
- Manage stress
- Take medications as prescribed`,
      symptoms: ['Often no symptoms', 'Headaches', 'Shortness of breath', 'Nosebleeds (severe cases)'],
      treatments: ['Lifestyle changes', 'ACE inhibitors', 'Beta blockers', 'Diuretics', 'Calcium channel blockers'],
      whenToSeekHelp: [
        'Blood pressure above 180/120',
        'Severe headache',
        'Chest pain',
        'Difficulty breathing',
        'Vision problems',
        'Blood in urine'
      ],
      verified: true,
      lastUpdated: new Date('2024-01-12')
    },

    // First Aid Guides
    {
      id: 'cpr-basics',
      title: 'CPR: Life-Saving Steps Everyone Should Know',
      category: 'first-aid',
      content: `Cardiopulmonary Resuscitation (CPR) can save a life during cardiac arrest.

**When to Perform CPR:**
- Person is unconscious
- Not breathing or only gasping
- No pulse

**Steps (Hands-Only CPR for Adults):**
1. Call emergency services (or have someone else call)
2. Place person on firm, flat surface
3. Kneel beside them
4. Place heel of one hand on center of chest
5. Place other hand on top, interlock fingers
6. Keep arms straight, position shoulders above hands
7. Push hard and fast (100-120 compressions/minute)
8. Push down at least 2 inches
9. Allow chest to return to normal position
10. Continue until help arrives or person starts breathing

**Important:**
- Don't stop compressions
- If trained, give rescue breaths (30 compressions: 2 breaths)
- Use AED if available`,
      whenToSeekHelp: ['Always call emergency services FIRST before starting CPR'],
      verified: true,
      lastUpdated: new Date('2024-01-20')
    },
    {
      id: 'choking-heimlich',
      title: 'Choking: Heimlich Maneuver Guide',
      category: 'first-aid',
      content: `The Heimlich maneuver can save someone who is choking.

**Signs of Choking:**
- Cannot speak or cry
- Difficulty breathing or noisy breathing
- Weak cough
- Skin turning blue
- Hands clutching throat

**For Adults (Conscious):**
1. Stand behind the person
2. Wrap arms around waist
3. Make a fist with one hand
4. Place fist above navel, below ribcage
5. Grasp fist with other hand
6. Give quick, upward thrusts
7. Repeat until object is expelled

**For Infants (Under 1 year):**
1. Hold infant face down on forearm
2. Support head and jaw
3. Give 5 back blows between shoulder blades
4. Turn infant face up
5. Give 5 chest thrusts
6. Repeat until object is expelled

**If Person Becomes Unconscious:**
- Call emergency services
- Begin CPR`,
      whenToSeekHelp: ['Call emergency services if choking persists', 'If person becomes unconscious'],
      verified: true,
      lastUpdated: new Date('2024-01-18')
    },
    {
      id: 'bleeding-control',
      title: 'Severe Bleeding: How to Stop and When to Seek Help',
      category: 'first-aid',
      content: `Controlling severe bleeding can prevent shock and save lives.

**Steps to Control Bleeding:**
1. **Protect Yourself:** Wear gloves if available
2. **Apply Direct Pressure:**
   - Use clean cloth or gauze
   - Press firmly on wound
   - Don't remove cloth if soaked, add more on top
3. **Elevate:** Raise injured area above heart if possible
4. **Apply Pressure to Artery:** If bleeding doesn't stop
5. **Apply Tourniquet:** Only for life-threatening limb bleeding

**Tourniquet Application:**
- Place 2-3 inches above wound
- Tighten until bleeding stops
- Note time applied
- Don't loosen once applied

**DO NOT:**
- Remove embedded objects
- Probe the wound
- Apply tourniquet over joints`,
      whenToSeekHelp: [
        'Bleeding doesn\'t stop after 10 minutes of pressure',
        'Blood spurting from wound',
        'Deep or large wound',
        'Embedded object',
        'Signs of shock (pale, cold, rapid pulse)',
        'Amputation'
      ],
      verified: true,
      lastUpdated: new Date('2024-01-19')
    },

    // Emergency Procedures
    {
      id: 'heart-attack-response',
      title: 'Heart Attack: Recognizing and Responding',
      category: 'emergency',
      content: `Quick action during a heart attack can save lives and limit heart damage.

**Warning Signs:**
- Chest discomfort (pressure, squeezing, fullness)
- Pain in arms, back, neck, jaw, or stomach
- Shortness of breath
- Cold sweat
- Nausea
- Lightheadedness

**Immediate Actions:**
1. **Call Emergency Services (Ambulance)** - Don't drive yourself
2. **Chew Aspirin:** If not allergic, chew 325mg aspirin
3. **Stay Calm:** Sit or lie down
4. **Loosen Tight Clothing**
5. **If Unconscious:** Begin CPR

**While Waiting for Help:**
- Don't leave person alone
- Keep them comfortable
- Monitor breathing and pulse
- Be ready to perform CPR

**Important:**
- Women may have different symptoms (nausea, back pain)
- Don't delay calling for help
- Time is critical - "Time is muscle"`,
      whenToSeekHelp: ['Call emergency services IMMEDIATELY if heart attack suspected'],
      verified: true,
      lastUpdated: new Date('2024-01-21')
    },
    {
      id: 'stroke-fast',
      title: 'Stroke: FAST Recognition and Response',
      category: 'emergency',
      content: `Recognizing stroke symptoms quickly can minimize brain damage.

**FAST Test:**
- **F**ace: Ask person to smile. Does one side droop?
- **A**rms: Ask to raise both arms. Does one drift down?
- **S**peech: Ask to repeat simple phrase. Is speech slurred?
- **T**ime: If any signs present, call emergency services immediately

**Other Symptoms:**
- Sudden numbness or weakness
- Sudden confusion
- Sudden trouble seeing
- Sudden trouble walking
- Sudden severe headache

**Immediate Actions:**
1. **Call Emergency Services** - Note time symptoms started
2. **Keep Person Calm and Comfortable**
3. **Don't Give Food or Drink**
4. **Note Symptoms and Time**
5. **If Unconscious:** Place in recovery position

**Critical:**
- Treatment is most effective within 3-4.5 hours
- Every minute counts
- Don't drive to hospital yourself`,
      whenToSeekHelp: ['Call emergency services IMMEDIATELY if stroke suspected'],
      verified: true,
      lastUpdated: new Date('2024-01-22')
    },

    // Medication Safety
    {
      id: 'antibiotic-use',
      title: 'Antibiotics: Proper Use and Resistance Prevention',
      category: 'medication',
      content: `Proper antibiotic use is crucial for effectiveness and preventing resistance.

**When Antibiotics Work:**
- Bacterial infections only
- NOT for viral infections (cold, flu, most sore throats)

**Proper Use:**
- Take exactly as prescribed
- Complete full course (even if feeling better)
- Take at same time each day
- Don't skip doses
- Don't share with others
- Don't save for later

**Common Side Effects:**
- Nausea
- Diarrhea
- Stomach upset
- Yeast infections

**Preventing Resistance:**
- Only use when prescribed
- Never pressure doctor for antibiotics
- Complete full course
- Don't use leftover antibiotics`,
      whenToSeekHelp: [
        'Severe allergic reaction (rash, swelling, difficulty breathing)',
        'Severe diarrhea',
        'No improvement after 2-3 days',
        'Symptoms worsen'
      ],
      verified: true,
      lastUpdated: new Date('2024-01-16')
    },
    {
      id: 'pain-medication-safety',
      title: 'Pain Medication: Safe Use of OTC Pain Relievers',
      category: 'medication',
      content: `Over-the-counter pain medications are safe when used correctly.

**Types:**
- **Acetaminophen (Tylenol):** Pain and fever
- **Ibuprofen (Advil, Motrin):** Pain, fever, inflammation
- **Aspirin:** Pain, fever, inflammation, blood thinner

**Safe Use Guidelines:**
- Read and follow label instructions
- Don't exceed maximum daily dose
- Don't combine multiple products with same ingredient
- Take with food (NSAIDs) to reduce stomach upset

**Maximum Daily Doses:**
- Acetaminophen: 3,000-4,000mg (adults)
- Ibuprofen: 1,200mg (OTC), 3,200mg (prescription)
- Aspirin: 4,000mg

**Warnings:**
- Acetaminophen: Liver damage risk with alcohol or high doses
- NSAIDs: Stomach bleeding, kidney problems, heart risks
- Aspirin: Bleeding risk, not for children with viral illness

**Drug Interactions:**
- Blood thinners
- Blood pressure medications
- Other NSAIDs`,
      whenToSeekHelp: [
        'Pain not relieved after 10 days',
        'Fever lasting more than 3 days',
        'Signs of allergic reaction',
        'Stomach pain or black stools',
        'Unusual bleeding'
      ],
      verified: true,
      lastUpdated: new Date('2024-01-17')
    }
  ];

  /**
   * Get all articles
   */
  getAllArticles(): MedicalArticle[] {
    return this.articles;
  }

  /**
   * Get article by ID
   */
  getArticleById(id: string): MedicalArticle | undefined {
    return this.articles.find(article => article.id === id);
  }

  /**
   * Get articles by category
   */
  getArticlesByCategory(category: MedicalArticle['category']): MedicalArticle[] {
    return this.articles.filter(article => article.category === category);
  }

  /**
   * Search articles
   */
  searchArticles(query: string): MedicalArticle[] {
    const lowerQuery = query.toLowerCase();
    return this.articles.filter(article =>
      article.title.toLowerCase().includes(lowerQuery) ||
      article.content.toLowerCase().includes(lowerQuery) ||
      article.symptoms?.some(s => s.toLowerCase().includes(lowerQuery)) ||
      article.treatments?.some(t => t.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get first aid guides
   */
  getFirstAidGuides(): MedicalArticle[] {
    return this.getArticlesByCategory('first-aid');
  }

  /**
   * Get emergency procedures
   */
  getEmergencyProcedures(): MedicalArticle[] {
    return this.getArticlesByCategory('emergency');
  }

  /**
   * Get condition information
   */
  getConditionInfo(condition: string): MedicalArticle | undefined {
    return this.articles.find(article =>
      article.category === 'condition' &&
      article.title.toLowerCase().includes(condition.toLowerCase())
    );
  }
}

export const medicalLibraryService = new MedicalLibraryService();
