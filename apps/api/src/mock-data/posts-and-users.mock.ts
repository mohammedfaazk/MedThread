// Mock data for posts and users when database is unavailable

export const mockUsers = [
  {
    id: "user-001",
    name: "Dr. Priya Sharma",
    username: "dr.priya_sharma",
    email: "priya.sharma@medthread.com",
    role: "DOCTOR",
    specialty: "Cardiologist",
    verified: true,
    isVerified: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya",
    pincode: "600001",
    city: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    experience: 15,
    qualifications: "MBBS, MD (Cardiology), DM",
    createdAt: new Date('2024-01-15'),
  },
  {
    id: "user-002",
    name: "Dr. Arjun Mehta",
    username: "dr.arjun_mehta",
    email: "arjun.mehta@medthread.com",
    role: "DOCTOR",
    specialty: "General Physician",
    verified: true,
    isVerified: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=arjun",
    pincode: "600002",
    city: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    experience: 10,
    qualifications: "MBBS, MD (General Medicine)",
    createdAt: new Date('2024-02-01'),
  },
  {
    id: "user-003",
    name: "Dr. Kavitha Nair",
    username: "dr.kavitha_nair",
    email: "kavitha.nair@medthread.com",
    role: "DOCTOR",
    specialty: "Pulmonologist",
    verified: true,
    isVerified: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=kavitha",
    pincode: "600018",
    city: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    experience: 12,
    qualifications: "MBBS, MD (Pulmonology)",
    createdAt: new Date('2024-01-20'),
  },
  {
    id: "user-004",
    name: "Navin Kumar",
    username: "navin_kumar",
    email: "navin@example.com",
    role: "PATIENT",
    verified: false,
    isVerified: false,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=navin",
    pincode: "600005",
    city: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    createdAt: new Date('2024-03-01'),
  },
  {
    id: "user-005",
    name: "Rifa Ahamed",
    username: "rifa_ahamed",
    email: "rifa@example.com",
    role: "PATIENT",
    verified: false,
    isVerified: false,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rifa",
    pincode: "600010",
    city: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    createdAt: new Date('2024-03-05'),
  },
];

export const mockPosts = [
  // =================== HIGH PRIORITY ===================
  {
    id: "post-001",
    title: "Severe chest pain radiating to left arm — need urgent advice",
    content: "I've been experiencing severe chest pain that radiates to my left arm and jaw for the past 2 hours. I'm also feeling short of breath and sweating heavily. I have a history of high blood pressure. Is this a cardiac event? Should I go to the ER immediately?",
    authorId: "user-004",
    author: mockUsers[3],
    communityId: "heart_health",
    community: {
      id: "heart_health",
      name: "Heart Health",
      icon: "❤️",
    },
    upvotes: 24,
    downvotes: 0,
    score: 24,
    tags: ["chest-pain", "emergency", "cardiac", "urgent"],
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    _count: {
      comments: 2,
    },
    priority: {
      priorityLevel: "HIGH",
      urgencyScore: 95,
      detectedSymptoms: [
        { symptom: "chest pain", weight: 10, category: "HIGH" },
        { symptom: "radiating pain", weight: 9, category: "HIGH" },
        { symptom: "shortness of breath", weight: 10, category: "HIGH" }
      ]
    },
    priorityReason: "Chest pain with radiation, shortness of breath, and sweating are classic cardiac emergency symptoms",
  },
  {
    id: "post-002",
    title: "Child (age 4) unresponsive after high fever — 104°F for 6 hours",
    content: "My 4-year-old daughter has had a fever of 104°F for the last 6 hours. She's become very lethargic and I can barely wake her. She had one episode where her body went stiff. We gave paracetamol 3 hours ago but it hasn't reduced. Very scared.",
    authorId: "user-005",
    author: mockUsers[4],
    communityId: "pediatric_care",
    community: {
      id: "pediatric_care",
      name: "Pediatric Care",
      icon: "👶",
    },
    upvotes: 31,
    downvotes: 0,
    score: 31,
    tags: ["fever", "pediatric", "emergency", "seizure"],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    _count: {
      comments: 1,
    },
    priority: {
      priorityLevel: "HIGH",
      urgencyScore: 91,
      detectedSymptoms: [
        { symptom: "high fever", weight: 8, category: "HIGH" },
        { symptom: "seizure", weight: 10, category: "HIGH" },
        { symptom: "unresponsive", weight: 10, category: "HIGH" }
      ]
    },
    priorityReason: "Febrile seizure symptoms in a child under 5 with prolonged high fever requiring emergency care",
  },
  {
    id: "post-003",
    title: "Sudden loss of vision in right eye + severe headache",
    content: "About 3 hours ago I suddenly lost partial vision in my right eye. It came back after 20 minutes but now I have a thunderclap headache — worst headache of my life. I'm 52, diabetic, and smoke occasionally. No head injury.",
    authorId: "user-004",
    author: mockUsers[3],
    communityId: "neurology",
    community: {
      id: "neurology",
      name: "Neurology",
      icon: "🧠",
    },
    upvotes: 19,
    downvotes: 0,
    score: 19,
    tags: ["vision-loss", "headache", "stroke", "emergency"],
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    _count: {
      comments: 1,
    },
    priority: {
      priorityLevel: "HIGH",
      urgencyScore: 88,
      detectedSymptoms: [
        { symptom: "vision loss", weight: 9, category: "HIGH" },
        { symptom: "severe headache", weight: 9, category: "HIGH" },
        { symptom: "stroke", weight: 10, category: "HIGH" }
      ]
    },
    priorityReason: "Transient vision loss combined with thunderclap headache in a diabetic patient are stroke warning signs",
  },

  // =================== MEDIUM PRIORITY ===================
  {
    id: "post-004",
    title: "Persistent dry cough for 3 weeks — not improving with medication",
    content: "I've had a dry cough for almost 3 weeks now. Started after a mild cold but the cold resolved. The cough is worse at night and when I exercise. No fever currently but I do feel a slight wheeze sometimes. I've tried OTC cough syrups — no improvement. I'm 34, non-smoker.",
    authorId: "user-005",
    author: mockUsers[4],
    communityId: "respiratory_health",
    community: {
      id: "respiratory_health",
      name: "Respiratory Health",
      icon: "🫁",
    },
    upvotes: 15,
    downvotes: 1,
    score: 14,
    tags: ["cough", "respiratory", "chronic"],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    _count: {
      comments: 2,
    },
    priority: {
      priorityLevel: "MEDIUM",
      urgencyScore: 62,
      detectedSymptoms: [
        { symptom: "persistent cough", weight: 5, category: "MEDIUM" },
        { symptom: "wheeze", weight: 6, category: "MEDIUM" }
      ]
    },
    priorityReason: "Persistent cough over 3 weeks with wheeze suggests possible asthma or post-viral bronchospasm needing evaluation",
  },
  {
    id: "post-005",
    title: "Blood sugar readings inconsistent — ranging 180–280 throughout the day",
    content: "I'm a Type 2 diabetic on Metformin 500mg twice daily. My fasting sugars this week have been 180–210 and post-meal reaching 260–280. My diet hasn't changed drastically. I had a mild infection last week (URI). Could the infection be causing this spike? Should I adjust my dose?",
    authorId: "user-004",
    author: mockUsers[3],
    communityId: "diabetes_support",
    community: {
      id: "diabetes_support",
      name: "Diabetes Support",
      icon: "🩺",
    },
    upvotes: 22,
    downvotes: 1,
    score: 21,
    tags: ["diabetes", "blood-sugar", "medication"],
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    _count: {
      comments: 1,
    },
    priority: {
      priorityLevel: "MEDIUM",
      urgencyScore: 58,
      detectedSymptoms: [
        { symptom: "diabetes", weight: 5, category: "MEDIUM" },
        { symptom: "unstable blood sugar", weight: 6, category: "MEDIUM" }
      ]
    },
    priorityReason: "Uncontrolled blood sugar in a diabetic patient with recent infection requires medical review",
  },
  {
    id: "post-006",
    title: "Recurring migraine — 3 episodes this week, aura before each",
    content: "I've been getting migraines with aura since my 20s but lately they've become much more frequent — 3 this week alone. Each starts with visual disturbances (zigzag lines), then one-sided head pain, nausea. I'm on oral contraceptives. Duration about 4–6 hours each episode.",
    authorId: "user-005",
    author: mockUsers[4],
    communityId: "neurology",
    community: {
      id: "neurology",
      name: "Neurology",
      icon: "🧠",
    },
    upvotes: 18,
    downvotes: 0,
    score: 18,
    tags: ["migraine", "headache", "chronic"],
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    _count: {
      comments: 1,
    },
    priority: {
      priorityLevel: "MEDIUM",
      urgencyScore: 54,
      detectedSymptoms: [
        { symptom: "migraine", weight: 5, category: "MEDIUM" },
        { symptom: "recurring", weight: 5, category: "MEDIUM" }
      ]
    },
    priorityReason: "Migraine with aura increasing in frequency in a patient on OCP requires neurological evaluation for stroke risk",
  },

  // =================== LOW PRIORITY ===================
  {
    id: "post-007",
    title: "Best diet plan for managing cholesterol naturally?",
    content: "My recent lipid panel showed LDL at 142 mg/dL and total cholesterol at 215 mg/dL. My doctor said it's borderline high and suggested dietary changes before considering medication. I'm 38, moderately active, no other conditions. Looking for practical dietary advice for an Indian diet.",
    authorId: "user-004",
    author: mockUsers[3],
    communityId: "nutrition_health",
    community: {
      id: "nutrition_health",
      name: "Nutrition & Health",
      icon: "🥗",
    },
    upvotes: 34,
    downvotes: 2,
    score: 32,
    tags: ["cholesterol", "diet", "nutrition"],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    _count: {
      comments: 1,
    },
    priority: {
      priorityLevel: "LOW",
      urgencyScore: 28,
      detectedSymptoms: [
        { symptom: "cholesterol", weight: 3, category: "LOW" }
      ]
    },
    priorityReason: "Borderline cholesterol managed with lifestyle changes — non-urgent dietary guidance needed",
  },
  {
    id: "post-008",
    title: "How often should a healthy 30-year-old get a full body checkup?",
    content: "I'm 30, no chronic conditions, non-smoker, moderately active. My last health checkup was 3 years ago and everything was normal. How frequently should I be getting routine blood work done? What panels are most important at this age?",
    authorId: "user-005",
    author: mockUsers[4],
    communityId: "preventive_care",
    community: {
      id: "preventive_care",
      name: "Preventive Care",
      icon: "🏥",
    },
    upvotes: 41,
    downvotes: 1,
    score: 40,
    tags: ["checkup", "preventive", "wellness"],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    _count: {
      comments: 1,
    },
    priority: {
      priorityLevel: "LOW",
      urgencyScore: 15,
      detectedSymptoms: []
    },
    priorityReason: "Routine preventive health inquiry — no active symptoms",
  },
  {
    id: "post-009",
    title: "Vitamin D deficiency — best supplement dosage and timing?",
    content: "Blood test showed Vitamin D at 18 ng/mL (deficient range). My doctor prescribed 60,000 IU weekly. Is this safe? How long until levels normalize? Should I take it with a specific meal? Any side effects to watch for?",
    authorId: "user-004",
    author: mockUsers[3],
    communityId: "general_wellness",
    community: {
      id: "general_wellness",
      name: "General Wellness",
      icon: "💊",
    },
    upvotes: 28,
    downvotes: 1,
    score: 27,
    tags: ["vitamin-d", "supplements", "deficiency"],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    _count: {
      comments: 1,
    },
    priority: {
      priorityLevel: "LOW",
      urgencyScore: 12,
      detectedSymptoms: [
        { symptom: "vitamin deficiency", weight: 1, category: "LOW" }
      ]
    },
    priorityReason: "Routine nutritional deficiency query — no acute symptoms",
  },
  {
    id: "post-010",
    title: "Is it normal to feel tired after starting a new workout routine?",
    content: "Started going to the gym 2 weeks ago after being sedentary for about a year. I'm doing 45-minute sessions 4x per week — mix of cardio and weights. I feel really fatigued 1–2 hours after every session and sleep more than usual. Is this normal adaptation or should I be concerned?",
    authorId: "user-005",
    author: mockUsers[4],
    communityId: "fitness_health",
    community: {
      id: "fitness_health",
      name: "Fitness & Health",
      icon: "💪",
    },
    upvotes: 52,
    downvotes: 1,
    score: 51,
    tags: ["fitness", "exercise", "fatigue"],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    _count: {
      comments: 1,
    },
    priority: {
      priorityLevel: "LOW",
      urgencyScore: 8,
      detectedSymptoms: []
    },
    priorityReason: "Normal exercise adaptation query with no red flag symptoms",
  },
];

// Mock comments stored separately for easy access
export const mockComments: Record<string, any[]> = {
  "post-001": [
    {
      id: "c-001-1",
      postId: "post-001",
      content: "This sounds like a possible heart attack. Please call emergency services (112) IMMEDIATELY or have someone drive you to the nearest ER. Do not wait. If you have aspirin available and are not allergic, chew one 325mg tablet now.",
      authorId: "user-001",
      author: mockUsers[0],
      createdAt: new Date(Date.now() - 50 * 60 * 1000),
      upvotes: 18,
      downvotes: 0,
    },
    {
      id: "c-001-2",
      postId: "post-001",
      content: "Agreed with Dr. Priya. Do NOT drive yourself. These symptoms together — chest pain, left arm radiation, sweating — are textbook MI symptoms. Time is critical. Go now.",
      authorId: "user-002",
      author: mockUsers[1],
      createdAt: new Date(Date.now() - 45 * 60 * 1000),
      upvotes: 15,
      downvotes: 0,
    }
  ],
  "post-002": [
    {
      id: "c-002-1",
      postId: "post-002",
      content: "This is a medical emergency. The body stiffness episode sounds like a febrile seizure. Take her to the ER RIGHT NOW. While going: keep her on her side, don't put anything in her mouth. Don't wait to see if fever breaks.",
      authorId: "user-002",
      author: mockUsers[1],
      createdAt: new Date(Date.now() - 1.8 * 60 * 60 * 1000),
      upvotes: 25,
      downvotes: 0,
    }
  ],
  "post-003": [
    {
      id: "c-003-1",
      postId: "post-003",
      content: "These are TIA (mini-stroke) warning signs. The transient vision loss and sudden severe headache together are serious red flags, especially with your diabetes history. Please go to emergency immediately. Every minute matters for stroke outcomes.",
      authorId: "user-001",
      author: mockUsers[0],
      createdAt: new Date(Date.now() - 2.8 * 60 * 60 * 1000),
      upvotes: 16,
      downvotes: 0,
    }
  ],
  "post-004": [
    {
      id: "c-004-1",
      postId: "post-004",
      content: "A cough lasting more than 3 weeks with night worsening and wheeze is a classic presentation of cough-variant asthma or post-infectious bronchial hyperreactivity. I'd recommend getting a spirometry test and seeing a pulmonologist. OTC cough syrups won't help here.",
      authorId: "user-003",
      author: mockUsers[2],
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      upvotes: 12,
      downvotes: 0,
    },
    {
      id: "c-004-2",
      postId: "post-004",
      content: "Also worth checking if you're on any ACE inhibitors for blood pressure — they commonly cause a dry persistent cough as a side effect.",
      authorId: "user-002",
      author: mockUsers[1],
      createdAt: new Date(Date.now() - 4.5 * 60 * 60 * 1000),
      upvotes: 8,
      downvotes: 0,
    }
  ],
  "post-005": [
    {
      id: "c-005-1",
      postId: "post-005",
      content: "Yes, infections commonly cause temporary insulin resistance and blood sugar spikes — this is stress hyperglycemia. However, readings of 260–280 post-meal are too high to ignore. Do NOT self-adjust Metformin dose. Please consult your diabetologist for a temporary medication adjustment and monitor every 4 hours.",
      authorId: "user-002",
      author: mockUsers[1],
      createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000),
      upvotes: 18,
      downvotes: 0,
    }
  ],
  "post-006": [
    {
      id: "c-006-1",
      postId: "post-006",
      content: "Important note: migraine with aura combined with oral contraceptives significantly increases stroke risk. This combination needs to be reviewed by your neurologist and gynecologist. Also, 3 episodes in one week qualifies as chronic migraine — prophylactic treatment should be discussed.",
      authorId: "user-001",
      author: mockUsers[0],
      createdAt: new Date(Date.now() - 11 * 60 * 60 * 1000),
      upvotes: 14,
      downvotes: 0,
    }
  ],
  "post-007": [
    {
      id: "c-007-1",
      postId: "post-007",
      content: "For an Indian diet: reduce refined carbs and fried foods, increase soluble fiber (oats, methi, psyllium husk), use cold-pressed oils sparingly, add omega-3 rich foods (flaxseeds, walnuts, fatty fish if non-veg). Aim for 30 mins brisk walking daily. At LDL 142, dietary changes can bring it down by 15–25% in 3 months.",
      authorId: "user-002",
      author: mockUsers[1],
      createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000),
      upvotes: 28,
      downvotes: 0,
    }
  ],
  "post-008": [
    {
      id: "c-008-1",
      postId: "post-008",
      content: "At 30 with no conditions: annual checkup is ideal but every 2 years is acceptable if healthy. Key panels: CBC, fasting glucose, lipid profile, thyroid (TSH), liver function, kidney function, Vitamin B12 and D (especially if vegetarian). Also: BP and BMI every visit. Add HbA1c if there's family diabetes history.",
      authorId: "user-003",
      author: mockUsers[2],
      createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
      upvotes: 35,
      downvotes: 0,
    }
  ],
  "post-009": [
    {
      id: "c-009-1",
      postId: "post-009",
      content: "60,000 IU weekly is a standard loading dose in India for deficiency — completely safe for 8–12 weeks. Always take it with a fat-containing meal (milk, nuts, avocado) as Vitamin D is fat-soluble. Levels usually normalize in 2–3 months. Recheck after 3 months. Toxicity is rare at this dose but watch for excessive thirst, frequent urination, or nausea.",
      authorId: "user-002",
      author: mockUsers[1],
      createdAt: new Date(Date.now() - 2.8 * 24 * 60 * 60 * 1000),
      upvotes: 22,
      downvotes: 0,
    }
  ],
  "post-010": [
    {
      id: "c-010-1",
      postId: "post-010",
      content: "Completely normal — this is called DOMS (Delayed Onset Muscle Soreness) combined with general adaptation fatigue. Your body is recalibrating energy systems it hasn't used in a year. Typical adaptation takes 3–4 weeks. Make sure you're getting adequate protein (0.8–1g per kg body weight), sleeping 7–8 hours, and hydrating well. If fatigue persists beyond 4 weeks, check iron and B12 levels.",
      authorId: "user-003",
      author: mockUsers[2],
      createdAt: new Date(Date.now() - 3.5 * 24 * 60 * 60 * 1000),
      upvotes: 45,
      downvotes: 0,
    }
  ],
};

export const mockVerifiedDoctors = mockUsers.filter(u => u.role === 'DOCTOR' && u.verified);
