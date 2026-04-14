import { prisma } from '@medthread/database';
import OpenAI from 'openai';
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

interface HealthTip {
  id: string;
  title: string;
  content: string;
  category: string;
  icon: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  targetConditions?: string[];
}

export class HealthTipsService {
  private generalTips: HealthTip[] = [
    {
      id: 'tip-1',
      title: 'Stay Hydrated',
      content: 'Drink at least 8 glasses of water daily. Proper hydration helps maintain body temperature, keeps joints lubricated, and helps deliver nutrients to cells.',
      category: 'General Wellness',
      icon: '💧',
      priority: 'HIGH'
    },
    {
      id: 'tip-2',
      title: 'Regular Exercise',
      content: 'Aim for 30 minutes of moderate exercise daily. Regular physical activity can help prevent chronic diseases and improve mental health.',
      category: 'Fitness',
      icon: '🏃',
      priority: 'HIGH'
    },
    {
      id: 'tip-3',
      title: 'Quality Sleep',
      content: 'Get 7-9 hours of sleep each night. Good sleep improves brain performance, mood, and overall health.',
      category: 'Sleep',
      icon: '😴',
      priority: 'HIGH'
    },
    {
      id: 'tip-4',
      title: 'Balanced Diet',
      content: 'Eat a variety of fruits, vegetables, whole grains, and lean proteins. A balanced diet provides essential nutrients your body needs.',
      category: 'Nutrition',
      icon: '🥗',
      priority: 'MEDIUM'
    },
    {
      id: 'tip-5',
      title: 'Mental Health Check',
      content: 'Take time for mental health. Practice mindfulness, meditation, or talk to someone if you\'re feeling stressed or anxious.',
      category: 'Mental Health',
      icon: '🧠',
      priority: 'HIGH'
    },
    {
      id: 'tip-6',
      title: 'Regular Check-ups',
      content: 'Schedule annual health screenings. Early detection of health issues can lead to better outcomes.',
      category: 'Prevention',
      icon: '🏥',
      priority: 'MEDIUM'
    },
    {
      id: 'tip-7',
      title: 'Hand Hygiene',
      content: 'Wash your hands frequently with soap and water for at least 20 seconds to prevent infections.',
      category: 'Hygiene',
      icon: '🧼',
      priority: 'HIGH'
    },
    {
      id: 'tip-8',
      title: 'Limit Screen Time',
      content: 'Take regular breaks from screens. Follow the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds.',
      category: 'Eye Health',
      icon: '👁️',
      priority: 'MEDIUM'
    },
    {
      id: 'tip-9',
      title: 'Stress Management',
      content: 'Practice stress-reduction techniques like deep breathing, yoga, or spending time in nature.',
      category: 'Mental Health',
      icon: '🌿',
      priority: 'MEDIUM'
    },
    {
      id: 'tip-10',
      title: 'Social Connections',
      content: 'Maintain strong social relationships. Social connections can improve mental health and increase longevity.',
      category: 'Social Wellness',
      icon: '👥',
      priority: 'LOW'
    }
  ];

  private conditionSpecificTips: Record<string, HealthTip[]> = {
    diabetes: [
      {
        id: 'diabetes-1',
        title: 'Monitor Blood Sugar',
        content: 'Check your blood glucose levels regularly as recommended by your doctor. Keep a log to track patterns.',
        category: 'Diabetes Management',
        icon: '📊',
        priority: 'HIGH',
        targetConditions: ['diabetes']
      },
      {
        id: 'diabetes-2',
        title: 'Carbohydrate Counting',
        content: 'Learn to count carbohydrates in your meals. This helps manage blood sugar levels effectively.',
        category: 'Diabetes Nutrition',
        icon: '🍽️',
        priority: 'HIGH',
        targetConditions: ['diabetes']
      },
      {
        id: 'diabetes-3',
        title: 'Foot Care',
        content: 'Check your feet daily for cuts, blisters, or swelling. Diabetes can reduce blood flow to feet.',
        category: 'Diabetes Care',
        icon: '👣',
        priority: 'MEDIUM',
        targetConditions: ['diabetes']
      }
    ],
    hypertension: [
      {
        id: 'bp-1',
        title: 'Reduce Sodium Intake',
        content: 'Limit sodium to less than 2,300mg per day. Read food labels and avoid processed foods.',
        category: 'Blood Pressure',
        icon: '🧂',
        priority: 'HIGH',
        targetConditions: ['hypertension', 'heart disease']
      },
      {
        id: 'bp-2',
        title: 'DASH Diet',
        content: 'Follow the DASH diet: rich in fruits, vegetables, whole grains, and low-fat dairy products.',
        category: 'Blood Pressure',
        icon: '🥦',
        priority: 'HIGH',
        targetConditions: ['hypertension']
      },
      {
        id: 'bp-3',
        title: 'Monitor Blood Pressure',
        content: 'Check your blood pressure regularly at home. Keep a log to share with your doctor.',
        category: 'Blood Pressure',
        icon: '🩺',
        priority: 'HIGH',
        targetConditions: ['hypertension']
      }
    ],
    asthma: [
      {
        id: 'asthma-1',
        title: 'Avoid Triggers',
        content: 'Identify and avoid your asthma triggers like smoke, dust, pollen, or pet dander.',
        category: 'Asthma Management',
        icon: '🌬️',
        priority: 'HIGH',
        targetConditions: ['asthma']
      },
      {
        id: 'asthma-2',
        title: 'Use Inhaler Correctly',
        content: 'Learn proper inhaler technique. Ask your doctor or pharmacist to demonstrate.',
        category: 'Asthma Management',
        icon: '💨',
        priority: 'HIGH',
        targetConditions: ['asthma']
      }
    ]
  };

  /**
   * Get daily health tip for user based on their profile
   */
  async getDailyTipForUser(userId: string): Promise<HealthTip> {
    try {
      // Get user's health profile
      const healthProfile = await prisma.healthProfile.findUnique({
        where: { userId }
      });

      // If user has specific conditions, prioritize condition-specific tips
      if (healthProfile?.preExistingConditions) {
        const conditions = healthProfile.preExistingConditions as any[];
        
        for (const condition of conditions) {
          const conditionKey = condition.toLowerCase();
          if (this.conditionSpecificTips[conditionKey]) {
            const tips = this.conditionSpecificTips[conditionKey];
            return tips[Math.floor(Math.random() * tips.length)];
          }
        }
      }

      // Return random general tip
      return this.generalTips[Math.floor(Math.random() * this.generalTips.length)];
    } catch (error) {
      console.error('[HealthTips] Error getting daily tip:', error);
      return this.generalTips[0]; // Return default tip
    }
  }

  /**
   * Get personalized health tips using AI
   */
  async getPersonalizedTips(userId: string, count: number = 3): Promise<HealthTip[]> {
    try {
      const healthProfile = await prisma.healthProfile.findUnique({
        where: { userId }
      });

      if (!healthProfile || !openai) {
        // Return general tips if no profile or AI
        return this.generalTips.slice(0, count);
      }

      const conditions = (healthProfile.preExistingConditions as any[]) || [];
      const medications = (healthProfile.currentMedications as any[]) || [];

      const prompt = `Generate ${count} personalized health tips for a patient with:
- Conditions: ${conditions.join(', ') || 'None'}
- Medications: ${medications.join(', ') || 'None'}
- Age: ${healthProfile.age || 'Unknown'}
- Gender: ${healthProfile.biologicalSex || 'Unknown'}

Format each tip as JSON with: title, content, category, priority (HIGH/MEDIUM/LOW)
Keep tips practical, actionable, and under 150 characters for content.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a healthcare advisor providing personalized health tips.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const aiTips = JSON.parse(response.choices[0].message.content || '[]');
      
      return aiTips.map((tip: any, index: number) => ({
        id: `ai-tip-${Date.now()}-${index}`,
        title: tip.title,
        content: tip.content,
        category: tip.category,
        icon: '💡',
        priority: tip.priority || 'MEDIUM'
      }));
    } catch (error) {
      console.error('[HealthTips] Error getting AI tips:', error);
      return this.generalTips.slice(0, count);
    }
  }

  /**
   * Get medication reminders for user
   */
  async getMedicationReminders(userId: string): Promise<any[]> {
    try {
      const healthProfile = await prisma.healthProfile.findUnique({
        where: { userId }
      });

      if (!healthProfile?.currentMedications) {
        return [];
      }

      const medications = healthProfile.currentMedications as any[];
      
      return medications.map((med: any) => ({
        id: `med-${Date.now()}-${med.name}`,
        medication: med.name || med,
        dosage: med.dosage || 'As prescribed',
        time: med.time || 'Morning',
        reminder: `Time to take your ${med.name || med}`,
        icon: '💊'
      }));
    } catch (error) {
      console.error('[HealthTips] Error getting medication reminders:', error);
      return [];
    }
  }

  /**
   * Get all tips by category
   */
  getTipsByCategory(category: string): HealthTip[] {
    return this.generalTips.filter(tip => tip.category === category);
  }

  /**
   * Get tips by priority
   */
  getTipsByPriority(priority: 'HIGH' | 'MEDIUM' | 'LOW'): HealthTip[] {
    return this.generalTips.filter(tip => tip.priority === priority);
  }

  /**
   * Search tips by keyword
   */
  searchTips(keyword: string): HealthTip[] {
    const lowerKeyword = keyword.toLowerCase();
    return this.generalTips.filter(tip => 
      tip.title.toLowerCase().includes(lowerKeyword) ||
      tip.content.toLowerCase().includes(lowerKeyword) ||
      tip.category.toLowerCase().includes(lowerKeyword)
    );
  }
}

export const healthTipsService = new HealthTipsService();
