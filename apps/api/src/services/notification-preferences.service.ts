import { prisma } from '@medthread/database';
import { NotificationType, NotificationPreferences } from '@prisma/client';

export type DeliveryChannel = 'in-app' | 'email' | 'push';
export type EmailFrequency = 'instant' | 'digest' | 'off';
export type DigestFrequency = 'daily' | 'weekly';

export interface NotificationPreferencesData {
  inApp: Record<NotificationType, boolean>;
  email: Record<NotificationType, EmailFrequency>;
  push: Record<NotificationType, boolean>;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  digestFrequency: DigestFrequency;
  upvoteThreshold?: number;
}

export class PreferencesService {
  /**
   * Get user's notification preferences, creating defaults if they don't exist
   */
  async getPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      let preferences = await prisma.notificationPreferences.findUnique({
        where: { userId },
      });

      if (!preferences) {
        // Create default preferences for new user
        preferences = await this.createDefaultPreferences(userId);
      }

      return preferences;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw new Error(`Failed to fetch preferences: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update user's notification preferences
   */
  async updatePreferences(
    userId: string,
    updates: Partial<NotificationPreferencesData>
  ): Promise<NotificationPreferences> {
    try {
      // Ensure preferences exist
      await this.getPreferences(userId);

      // Validate updates
      this.validatePreferences(updates);

      const preferences = await prisma.notificationPreferences.update({
        where: { userId },
        data: {
          ...(updates.inApp && { inApp: updates.inApp }),
          ...(updates.email && { email: updates.email }),
          ...(updates.push && { push: updates.push }),
          ...(updates.quietHoursStart !== undefined && { quietHoursStart: updates.quietHoursStart }),
          ...(updates.quietHoursEnd !== undefined && { quietHoursEnd: updates.quietHoursEnd }),
          ...(updates.digestFrequency && { digestFrequency: updates.digestFrequency }),
          ...(updates.upvoteThreshold !== undefined && { upvoteThreshold: updates.upvoteThreshold }),
        },
      });

      console.log(`Updated notification preferences for user ${userId}`);

      return preferences;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw new Error(`Failed to update preferences: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if a specific notification type is enabled for a user on a given channel
   */
  async isNotificationEnabled(
    userId: string,
    type: NotificationType,
    channel: DeliveryChannel
  ): Promise<boolean> {
    try {
      const preferences = await this.getPreferences(userId);

      switch (channel) {
        case 'in-app': {
          const inApp = preferences.inApp as Record<string, boolean>;
          return inApp[type] ?? true; // Default to enabled
        }
        case 'email': {
          const email = preferences.email as Record<string, EmailFrequency>;
          return email[type] !== 'off';
        }
        case 'push': {
          const push = preferences.push as Record<string, boolean>;
          return push[type] ?? true; // Default to enabled
        }
        default:
          return true;
      }
    } catch (error) {
      console.error('Error checking notification enabled status:', error);
      // Default to enabled on error to avoid blocking notifications
      return true;
    }
  }

  /**
   * Check if user is currently in quiet hours
   */
  async isInQuietHours(userId: string): Promise<boolean> {
    try {
      const preferences = await this.getPreferences(userId);

      if (!preferences.quietHoursStart || !preferences.quietHoursEnd) {
        return false;
      }

      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      const start = preferences.quietHoursStart;
      const end = preferences.quietHoursEnd;

      // Handle quiet hours that span midnight
      if (start <= end) {
        return currentTime >= start && currentTime <= end;
      } else {
        return currentTime >= start || currentTime <= end;
      }
    } catch (error) {
      console.error('Error checking quiet hours:', error);
      return false;
    }
  }

  /**
   * Get default notification preferences for a new user
   */
  getDefaultPreferencesData(): NotificationPreferencesData {
    const allTypes = Object.values(NotificationType);

    const inApp: Record<NotificationType, boolean> = {} as Record<NotificationType, boolean>;
    const email: Record<NotificationType, EmailFrequency> = {} as Record<NotificationType, EmailFrequency>;
    const push: Record<NotificationType, boolean> = {} as Record<NotificationType, boolean>;

    // Set defaults for each notification type
    allTypes.forEach((type) => {
      // In-app: all enabled by default
      inApp[type] = true;

      // Email: important notifications instant, others digest
      if (
        type === NotificationType.APPOINTMENT_REQUEST ||
        type === NotificationType.APPOINTMENT_UPDATE ||
        type === NotificationType.VERIFICATION_STATUS ||
        type === NotificationType.DIRECT_MESSAGE ||
        type === NotificationType.SYSTEM_ANNOUNCEMENT
      ) {
        email[type] = 'instant';
      } else {
        email[type] = 'digest';
      }

      // Push: important notifications enabled, others disabled
      if (
        type === NotificationType.APPOINTMENT_REQUEST ||
        type === NotificationType.APPOINTMENT_UPDATE ||
        type === NotificationType.DIRECT_MESSAGE ||
        type === NotificationType.MENTION
      ) {
        push[type] = true;
      } else {
        push[type] = false;
      }
    });

    return {
      inApp,
      email,
      push,
      digestFrequency: 'daily',
      upvoteThreshold: 10,
    };
  }

  /**
   * Create default preferences for a user
   */
  private async createDefaultPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const defaults = this.getDefaultPreferencesData();

      const preferences = await prisma.notificationPreferences.create({
        data: {
          userId,
          inApp: defaults.inApp,
          email: defaults.email,
          push: defaults.push,
          digestFrequency: defaults.digestFrequency,
          upvoteThreshold: defaults.upvoteThreshold,
        },
      });

      console.log(`Created default notification preferences for user ${userId}`);

      return preferences;
    } catch (error) {
      console.error('Error creating default preferences:', error);
      throw new Error(`Failed to create default preferences: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate preference updates
   */
  private validatePreferences(updates: Partial<NotificationPreferencesData>): void {
    // Validate quiet hours format (HH:mm)
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

    if (updates.quietHoursStart && !timeRegex.test(updates.quietHoursStart)) {
      throw new Error('Invalid quietHoursStart format. Expected HH:mm');
    }

    if (updates.quietHoursEnd && !timeRegex.test(updates.quietHoursEnd)) {
      throw new Error('Invalid quietHoursEnd format. Expected HH:mm');
    }

    // Validate digest frequency
    if (updates.digestFrequency && !['daily', 'weekly'].includes(updates.digestFrequency)) {
      throw new Error('Invalid digestFrequency. Expected "daily" or "weekly"');
    }

    // Validate upvote threshold
    if (updates.upvoteThreshold !== undefined && updates.upvoteThreshold < 0) {
      throw new Error('upvoteThreshold must be non-negative');
    }
  }
}

// Export singleton instance
export const preferencesService = new PreferencesService();
