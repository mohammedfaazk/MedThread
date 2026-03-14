import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class HealthProfileService {
  async createOrUpdateHealthProfile(userId: string, data: any) {
    try {
      const healthProfile = await prisma.healthProfile.upsert({
        where: { userId },
        update: {
          ...data,
          completedAt: new Date(),
          updatedAt: new Date()
        },
        create: {
          userId,
          ...data,
          completedAt: new Date()
        }
      })

      return { success: true, data: healthProfile }
    } catch (error) {
      console.error('Error creating/updating health profile:', error)
      return { success: false, error: 'Failed to save health profile' }
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