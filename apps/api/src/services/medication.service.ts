import { prisma } from '@medthread/database';

export const medicationService = {
  // Get user's medication profile
  async getMedicationProfile(userId: string) {
    let profile = await prisma.medicationProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      profile = await prisma.medicationProfile.create({
        data: {
          userId,
          medications: [],
          schedule: [],
          interactions: [],
          sideEffects: [],
          effectiveness: []
        }
      });
    }

    return profile;
  },

  // Add medication
  async addMedication(userId: string, medication: any) {
    const profile = await this.getMedicationProfile(userId);
    
    const medications = Array.isArray(profile.medications) ? profile.medications : [];
    medications.push({
      id: Date.now().toString(),
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      startDate: medication.startDate || new Date().toISOString(),
      endDate: medication.endDate,
      prescribedBy: medication.prescribedBy,
      purpose: medication.purpose,
      addedAt: new Date().toISOString()
    });

    const updated = await prisma.medicationProfile.update({
      where: { userId },
      data: { medications }
    });

    // Check for interactions
    await this.checkInteractions(userId);

    return updated;
  },

  // Remove medication
  async removeMedication(userId: string, medicationId: string) {
    const profile = await this.getMedicationProfile(userId);
    
    const medications = Array.isArray(profile.medications) ? profile.medications : [];
    const filtered = medications.filter((m: any) => m.id !== medicationId);

    return await prisma.medicationProfile.update({
      where: { userId },
      data: { medications: filtered }
    });
  },

  // Create reminder
  async createReminder(userId: string, reminder: any) {
    return await prisma.medicationReminder.create({
      data: {
        userId,
        medication: reminder.medication,
        dosage: reminder.dosage,
        frequency: reminder.frequency,
        time: new Date(reminder.time)
      }
    });
  },

  // Get reminders for user
  async getReminders(userId: string, date?: Date) {
    const startOfDay = date ? new Date(date.setHours(0, 0, 0, 0)) : new Date(new Date().setHours(0, 0, 0, 0));
    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    return await prisma.medicationReminder.findMany({
      where: {
        userId,
        time: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      orderBy: { time: 'asc' }
    });
  },

  // Mark reminder as taken
  async markReminderTaken(reminderId: string) {
    return await prisma.medicationReminder.update({
      where: { id: reminderId },
      data: {
        taken: true,
        takenAt: new Date()
      }
    });
  },

  // Skip reminder
  async skipReminder(reminderId: string, reason: string) {
    return await prisma.medicationReminder.update({
      where: { id: reminderId },
      data: {
        skipped: true,
        skipReason: reason
      }
    });
  },

  // Check medication interactions
  async checkInteractions(userId: string) {
    const profile = await this.getMedicationProfile(userId);
    const medications = Array.isArray(profile.medications) ? profile.medications : [];
    
    if (medications.length < 2) {
      return [];
    }

    const interactions = [];
    
    // Check each pair of medications
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const med1 = medications[i].name.toLowerCase();
        const med2 = medications[j].name.toLowerCase();

        // Check database for known interactions
        const interaction = await prisma.medicationInteraction.findFirst({
          where: {
            OR: [
              { medication1: med1, medication2: med2 },
              { medication1: med2, medication2: med1 }
            ]
          }
        });

        if (interaction) {
          interactions.push({
            medication1: medications[i].name,
            medication2: medications[j].name,
            severity: interaction.severity,
            description: interaction.description,
            action: interaction.action
          });
        }
      }
    }

    // Update profile with interactions
    await prisma.medicationProfile.update({
      where: { userId },
      data: { interactions }
    });

    return interactions;
  },

  // Calculate adherence rate
  async calculateAdherence(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const reminders = await prisma.medicationReminder.findMany({
      where: {
        userId,
        time: { gte: startDate }
      }
    });

    if (reminders.length === 0) {
      return 100;
    }

    const taken = reminders.filter(r => r.taken).length;
    const adherenceRate = (taken / reminders.length) * 100;

    // Update profile
    await prisma.medicationProfile.update({
      where: { userId },
      data: { adherenceRate }
    });

    return adherenceRate;
  },

  // Report side effect
  async reportSideEffect(userId: string, medicationName: string, sideEffect: string, severity: string) {
    const profile = await this.getMedicationProfile(userId);
    const sideEffects = Array.isArray(profile.sideEffects) ? profile.sideEffects : [];
    
    sideEffects.push({
      medication: medicationName,
      effect: sideEffect,
      severity,
      reportedAt: new Date().toISOString()
    });

    return await prisma.medicationProfile.update({
      where: { userId },
      data: { sideEffects }
    });
  },

  // Rate effectiveness
  async rateEffectiveness(userId: string, medicationName: string, rating: number, notes?: string) {
    const profile = await this.getMedicationProfile(userId);
    const effectiveness = Array.isArray(profile.effectiveness) ? profile.effectiveness : [];
    
    effectiveness.push({
      medication: medicationName,
      rating,
      notes,
      ratedAt: new Date().toISOString()
    });

    return await prisma.medicationProfile.update({
      where: { userId },
      data: { effectiveness }
    });
  }
};
