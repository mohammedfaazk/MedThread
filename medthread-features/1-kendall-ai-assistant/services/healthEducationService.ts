// Health education content service for VitaVoice

export interface HealthTopic {
    id: string;
    title: string;
    category: 'prevention' | 'hygiene' | 'nutrition' | 'first_aid' | 'maternal' | 'child' | 'chronic';
    language: string;
    content: string;
    keyPoints: string[];
    videoUrl?: string;
    imageUrl?: string;
    relatedTopics?: string[];
}

// Health education content database
const HEALTH_EDUCATION_CONTENT: HealthTopic[] = [
    // Disease Prevention
    {
        id: 'malaria_prevention',
        title: 'Malaria Prevention',
        category: 'prevention',
        language: 'en',
        content: 'Malaria is a serious disease spread by mosquitoes. Prevention is key to staying healthy.',
        keyPoints: [
            'Use mosquito nets while sleeping',
            'Wear long-sleeved clothes in the evening',
            'Use mosquito repellent creams',
            'Remove standing water around your home',
            'Keep doors and windows closed at dusk',
            'Seek immediate treatment if you have fever'
        ]
    },
    {
        id: 'dengue_prevention',
        title: 'Dengue Prevention',
        category: 'prevention',
        language: 'en',
        content: 'Dengue is spread by Aedes mosquitoes that bite during the day. Prevention focuses on mosquito control.',
        keyPoints: [
            'Empty water containers weekly',
            'Cover water storage containers',
            'Clean coolers and flower vases regularly',
            'Use mosquito repellent during the day',
            'Wear protective clothing',
            'Watch for warning signs: severe stomach pain, vomiting, bleeding'
        ]
    },
    {
        id: 'tb_awareness',
        title: 'Tuberculosis (TB) Awareness',
        category: 'prevention',
        language: 'en',
        content: 'TB is a serious but curable disease. Early detection and complete treatment are essential.',
        keyPoints: [
            'Cough lasting more than 2 weeks needs check-up',
            'Cover mouth when coughing',
            'Take ALL TB medicines for full 6 months',
            'Never stop treatment early',
            'TB treatment is FREE at government centers',
            'Good nutrition helps recovery'
        ]
    },

    // Hygiene
    {
        id: 'handwashing',
        title: 'Proper Handwashing',
        category: 'hygiene',
        language: 'en',
        content: 'Handwashing is the single most effective way to prevent diseases.',
        keyPoints: [
            'Wash hands with soap for 20 seconds',
            'Wash before eating and cooking',
            'Wash after using toilet',
            'Wash after touching animals',
            'Use clean running water when possible',
            'Dry hands with clean cloth'
        ]
    },
    {
        id: 'safe_water',
        title: 'Safe Drinking Water',
        category: 'hygiene',
        language: 'en',
        content: 'Clean water prevents diarrhea and many waterborne diseases.',
        keyPoints: [
            'Boil water for 10 minutes before drinking',
            'Store water in clean, covered containers',
            'Use water purification tablets if available',
            'Never drink from open wells',
            'Clean water storage containers weekly',
            'Protect water sources from contamination'
        ]
    },

    // Nutrition
    {
        id: 'anemia_prevention',
        title: 'Preventing Anemia',
        category: 'nutrition',
        language: 'en',
        content: 'Anemia (low blood) is common but preventable with proper nutrition.',
        keyPoints: [
            'Eat iron-rich foods: green leafy vegetables, jaggery',
            'Take iron tablets during pregnancy',
            'Eat vitamin C foods with iron foods',
            'Avoid tea/coffee with meals',
            'Regular deworming for children',
            'Check for anemia during pregnancy'
        ]
    },
    {
        id: 'child_nutrition',
        title: 'Child Nutrition (0-5 years)',
        category: 'nutrition',
        language: 'en',
        content: 'Proper nutrition in first 5 years builds lifelong health.',
        keyPoints: [
            'Exclusive breastfeeding for 6 months',
            'Start complementary foods at 6 months',
            'Give mashed foods, not just liquids',
            'Include dal, vegetables, fruits daily',
            'Feed frequently - 5-6 times per day',
            'Continue breastfeeding up to 2 years'
        ]
    },

    // First Aid
    {
        id: 'snake_bite',
        title: 'Snake Bite First Aid',
        category: 'first_aid',
        language: 'en',
        content: 'Quick action can save lives in snake bite cases.',
        keyPoints: [
            'Keep person calm and still',
            'Remove jewelry and tight clothing',
            'DO NOT cut the bite or suck venom',
            'DO NOT apply ice or tourniquet',
            'Immobilize the bitten limb',
            'Rush to hospital immediately - call 108'
        ]
    },
    {
        id: 'burns_first_aid',
        title: 'Burns First Aid',
        category: 'first_aid',
        language: 'en',
        content: 'Proper first aid for burns prevents infection and scarring.',
        keyPoints: [
            'Cool burn with running water for 10 minutes',
            'DO NOT apply ice directly',
            'DO NOT apply oil, butter, or toothpaste',
            'Cover with clean cloth',
            'For severe burns, go to hospital',
            'Give plenty of water to drink'
        ]
    },

    // Maternal Health
    {
        id: 'pregnancy_danger_signs',
        title: 'Pregnancy Danger Signs',
        category: 'maternal',
        language: 'en',
        content: 'Recognize warning signs during pregnancy and seek immediate help.',
        keyPoints: [
            'Severe headache or blurred vision',
            'Heavy bleeding',
            'Severe abdominal pain',
            'High fever',
            'Baby not moving for 12 hours',
            'Swelling of face and hands',
            'GO TO HOSPITAL IMMEDIATELY if any sign appears'
        ]
    },
    {
        id: 'antenatal_care',
        title: 'Antenatal Care (ANC)',
        category: 'maternal',
        language: 'en',
        content: 'Regular check-ups during pregnancy ensure healthy mother and baby.',
        keyPoints: [
            'Register pregnancy within 12 weeks',
            'Attend at least 4 ANC check-ups',
            'Take iron and folic acid tablets daily',
            'Get 2 tetanus injections',
            'Eat nutritious food - extra meal daily',
            'Rest adequately and avoid heavy work'
        ]
    },

    // Child Health
    {
        id: 'diarrhea_management',
        title: 'Managing Child Diarrhea',
        category: 'child',
        language: 'en',
        content: 'Diarrhea can be dangerous for children due to dehydration.',
        keyPoints: [
            'Give ORS (Oral Rehydration Solution) frequently',
            'Continue breastfeeding',
            'Give zinc tablets for 14 days',
            'Continue feeding - do not stop food',
            'Watch for danger signs: no tears, dry mouth, sunken eyes',
            'Go to hospital if child is very weak or not drinking'
        ]
    },

    // Chronic Disease
    {
        id: 'diabetes_management',
        title: 'Living with Diabetes',
        category: 'chronic',
        language: 'en',
        content: 'Diabetes can be controlled with lifestyle changes and medication.',
        keyPoints: [
            'Check blood sugar regularly',
            'Take medicines as prescribed',
            'Eat regular meals - avoid skipping',
            'Reduce sugar and refined flour',
            'Walk 30 minutes daily',
            'Check feet daily for cuts or sores',
            'Get eye check-up yearly'
        ]
    },
    {
        id: 'hypertension_management',
        title: 'Managing High Blood Pressure',
        category: 'chronic',
        language: 'en',
        content: 'High BP can be controlled to prevent heart disease and stroke.',
        keyPoints: [
            'Take BP medicines regularly - never skip',
            'Reduce salt in food',
            'Avoid smoking and alcohol',
            'Exercise daily - walking is best',
            'Manage stress through yoga or meditation',
            'Check BP monthly',
            'Maintain healthy weight'
        ]
    }
];

class HealthEducationService {
    /**
     * Get all topics
     */
    getAllTopics(): HealthTopic[] {
        return HEALTH_EDUCATION_CONTENT;
    }

    /**
     * Get topics by category
     */
    getTopicsByCategory(category: HealthTopic['category']): HealthTopic[] {
        return HEALTH_EDUCATION_CONTENT.filter(topic => topic.category === category);
    }

    /**
     * Get topic by ID
     */
    getTopicById(id: string): HealthTopic | undefined {
        return HEALTH_EDUCATION_CONTENT.find(topic => topic.id === id);
    }

    /**
     * Search topics
     */
    searchTopics(query: string): HealthTopic[] {
        const lowerQuery = query.toLowerCase();
        return HEALTH_EDUCATION_CONTENT.filter(topic =>
            topic.title.toLowerCase().includes(lowerQuery) ||
            topic.content.toLowerCase().includes(lowerQuery) ||
            topic.keyPoints.some(point => point.toLowerCase().includes(lowerQuery))
        );
    }

    /**
     * Get related topics
     */
    getRelatedTopics(topicId: string): HealthTopic[] {
        const topic = this.getTopicById(topicId);
        if (!topic || !topic.relatedTopics) return [];

        return topic.relatedTopics
            .map(id => this.getTopicById(id))
            .filter(t => t !== undefined) as HealthTopic[];
    }

    /**
     * Get categories
     */
    getCategories(): Array<{ id: HealthTopic['category']; name: string; icon: string }> {
        return [
            { id: 'prevention', name: 'Disease Prevention', icon: '🛡️' },
            { id: 'hygiene', name: 'Hygiene & Sanitation', icon: '🧼' },
            { id: 'nutrition', name: 'Nutrition', icon: '🥗' },
            { id: 'first_aid', name: 'First Aid', icon: '🩹' },
            { id: 'maternal', name: 'Maternal Health', icon: '🤰' },
            { id: 'child', name: 'Child Health', icon: '👶' },
            { id: 'chronic', name: 'Chronic Diseases', icon: '💊' },
        ];
    }

    /**
     * Mark topic as read
     */
    markAsRead(topicId: string): void {
        const readTopics = this.getReadTopics();
        if (!readTopics.includes(topicId)) {
            readTopics.push(topicId);
            localStorage.setItem('vitavoice_read_topics', JSON.stringify(readTopics));
        }
    }

    /**
     * Get read topics
     */
    getReadTopics(): string[] {
        const saved = localStorage.getItem('vitavoice_read_topics');
        return saved ? JSON.parse(saved) : [];
    }

    /**
     * Check if topic is read
     */
    isTopicRead(topicId: string): boolean {
        return this.getReadTopics().includes(topicId);
    }
}

export const healthEducationService = new HealthEducationService();
