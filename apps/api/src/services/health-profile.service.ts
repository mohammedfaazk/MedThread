import { prisma } from '@medthread/database'

// All valid HealthProfile fields (excluding id, userId, createdAt, updatedAt which are managed by Prisma)
const HEALTH_PROFILE_FIELDS = new Set([
  'ageGroup', 'biologicalSex', 'nationality', 'weightRange', 'heightRange',
  'activityLevel', 'medicalConditions', 'currentMedications', 'foodAllergies',
  'riskLevel', 'dietType', 'religiousRestrictions', 'foodsToAvoid', 'cookingAccess',
  'primaryGoal', 'sleepHours', 'waterIntake', 'completedAt',
])

function sanitize(data: any) {
  return Object.fromEntries(
    Object.entries(data).filter(([k]) => HEALTH_PROFILE_FIELDS.has(k))
  )
}

export class HealthProfileService {
  async createOrUpdateHealthProfile(userId: string, data: any) {
    const clean = sanitize(data)
    // Retry once on P2003 (foreign key) — can happen if called immediately after user creation
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const healthProfile = await prisma.healthProfile.upsert({
          where: { userId },
          update: { ...clean, updatedAt: new Date() },
          create: { userId, ...clean }
        })
        return { success: true, data: healthProfile }
      } catch (error: any) {
        console.error('Error creating/updating health profile:', error)
        if (error?.code === 'P2003' && attempt === 0) {
          await new Promise(r => setTimeout(r, 300))
          continue
        }
        if (error?.code === 'P2003') {
          return { success: false, error: 'User account not found. Please log out and log back in.' }
        }
        return { success: false, error: `Failed to save health profile: ${error?.message}` }
      }
    }
    return { success: false, error: 'Failed to save health profile' }
  }

  // Only creates a profile if one doesn't already exist — never overwrites
  async createIfNotExists(userId: string, data: any) {
    try {
      const existing = await prisma.healthProfile.findUnique({ where: { userId } })
      if (existing) return { success: true, data: existing }
      const clean = sanitize(data)
      const healthProfile = await prisma.healthProfile.create({ data: { userId, ...clean } })
      return { success: true, data: healthProfile }
    } catch (error: any) {
      if (error?.code === 'P2003') {
        await new Promise(r => setTimeout(r, 300))
        try {
          const clean = sanitize(data)
          const healthProfile = await prisma.healthProfile.create({ data: { userId, ...clean } })
          return { success: true, data: healthProfile }
        } catch { /* ignore */ }
      }
      return { success: false, error: 'Failed to initialise health profile' }
    }
  }

  async getHealthProfile(userId: string) {
    try {
      const healthProfile = await prisma.healthProfile.findUnique({
        where: { userId }
      })

      return { success: true, data: healthProfile }
    } catch (error) {
      console.error('Error fetching health profile:', error)
      return { success: false, error: 'Failed to fetch health profile' }
    }
  }

  async deleteHealthProfile(userId: string) {
    try {
      await prisma.healthProfile.delete({
        where: { userId }
      })

      return { success: true }
    } catch (error) {
      console.error('Error deleting health profile:', error)
      return { success: false, error: 'Failed to delete health profile' }
    }
  }
}