import { prisma } from '@medthread/database'

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
    } catch (error: any) {
      console.error('Error creating/updating health profile:', error)
      // P2003 = foreign key constraint — userId doesn't exist in User table (stale JWT)
      if (error?.code === 'P2003') {
        return { success: false, error: 'User account not found. Please log out and log back in.' }
      }
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