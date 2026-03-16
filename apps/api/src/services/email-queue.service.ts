import { prisma } from '@medthread/database';
import { EmailService } from './email.service';
import { NotificationService } from './notification.service';
import { PreferencesService } from './notification-preferences.service';
import { Notification } from '@prisma/client';

interface EmailQueueJob {
  id: string;
  userId: string;
  notificationId: string;
  type: 'instant' | 'digest';
  status: 'pending' | 'sent' | 'failed';
  attempts: number;
  lastAttemptAt: Date | null;
  sentAt: Date | null;
  error: string | null;
  createdAt: Date;
}

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'closed' | 'open' | 'half-open';
}

export class EmailQueueService {
  private emailService: EmailService;
  private notificationService: NotificationService;
  private preferencesService: PreferencesService;
  private isProcessing: boolean = false;
  private processingInterval: NodeJS.Timeout | null = null;
  
  // Circuit breaker configuration
  private circuitBreaker: CircuitBreakerState = {
    failures: 0,
    lastFailureTime: 0,
    state: 'closed'
  };
  private readonly CIRCUIT_BREAKER_THRESHOLD = 5; // Open after 5 failures
  private readonly CIRCUIT_BREAKER_TIMEOUT = 60000; // 1 minute
  private readonly CIRCUIT_BREAKER_HALF_OPEN_TIMEOUT = 30000; // 30 seconds
  
  // Retry configuration
  private readonly MAX_ATTEMPTS = 3;
  private readonly BASE_DELAY = 1000; // 1 second
  
  constructor() {
    this.emailService = new EmailService();
    this.notificationService = new NotificationService();
    this.preferencesService = new PreferencesService();
  }

  /**
   * Enqueue an instant email notification
   */
  async enqueueInstantEmail(notificationId: string, userId: string): Promise<void> {
    try {
      // Check if user has instant email enabled for this notification type
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId }
      });

      if (!notification) {
        console.error(`[EMAIL_QUEUE] Notification ${notificationId} not found`);
        return;
      }

      const preferences = await this.preferencesService.getPreferences(userId);
      const emailPreference = preferences.email[notification.type];

      if (emailPreference !== 'instant') {
        console.log(`[EMAIL_QUEUE] User ${userId} does not have instant email enabled for ${notification.type}`);
        return;
      }

      // Create email queue job
      await prisma.emailQueue.create({
        data: {
          userId,
          notificationId,
          type: 'instant',
          status: 'pending'
        }
      });

      console.log(`[EMAIL_QUEUE] Enqueued instant email for notification ${notificationId}`);
    } catch (error) {
      console.error('[EMAIL_QUEUE] Error enqueueing instant email:', error);
      throw error;
    }
  }

  /**
   * Enqueue multiple instant emails for a batch of notifications
   */
  async enqueueInstantEmailBatch(notifications: Notification[]): Promise<void> {
    try {
      const jobs = [];

      for (const notification of notifications) {
        const preferences = await this.preferencesService.getPreferences(notification.recipientId);
        const emailPreference = preferences.email[notification.type];

        if (emailPreference === 'instant') {
          jobs.push({
            userId: notification.recipientId,
            notificationId: notification.id,
            type: 'instant' as const,
            status: 'pending' as const
          });
        }
      }

      if (jobs.length > 0) {
        await prisma.emailQueue.createMany({
          data: jobs
        });

        console.log(`[EMAIL_QUEUE] Enqueued ${jobs.length} instant emails`);
      }
    } catch (error) {
      console.error('[EMAIL_QUEUE] Error enqueueing instant email batch:', error);
      throw error;
    }
  }

  /**
   * Start processing the email queue
   * Processes jobs every 30 seconds
   */
  startProcessing(intervalMs: number = 30000): void {
    if (this.isProcessing) {
      console.log('[EMAIL_QUEUE] Already processing');
      return;
    }

    this.isProcessing = true;
    console.log('[EMAIL_QUEUE] Started processing queue');

    // Process immediately
    this.processQueue();

    // Then process at intervals
    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, intervalMs);
  }

  /**
   * Stop processing the email queue
   */
  stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    this.isProcessing = false;
    console.log('[EMAIL_QUEUE] Stopped processing queue');
  }

  /**
   * Process pending email jobs
   */
  private async processQueue(): Promise<void> {
    // Check circuit breaker
    if (!this.canProcessJobs()) {
      console.log('[EMAIL_QUEUE] Circuit breaker is open, skipping processing');
      return;
    }

    try {
      // Fetch pending jobs that haven't exceeded max attempts
      const jobs = await prisma.emailQueue.findMany({
        where: {
          status: 'pending',
          attempts: {
            lt: this.MAX_ATTEMPTS
          }
        },
        take: 10, // Process 10 jobs at a time
        orderBy: {
          createdAt: 'asc'
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true
            }
          },
          notification: {
            include: {
              actor: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                  role: true
                }
              }
            }
          }
        }
      });

      if (jobs.length === 0) {
        return;
      }

      console.log(`[EMAIL_QUEUE] Processing ${jobs.length} jobs`);

      // Process each job
      for (const job of jobs) {
        await this.processJob(job);
      }
      
      // Reset circuit breaker on success
      this.resetCircuitBreaker();
    } catch (error) {
      // Check if error is due to missing EmailQueue table/model
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('emailQueue') || errorMessage.includes('findMany') || errorMessage.includes('undefined')) {
        console.warn('[EMAIL_QUEUE] EmailQueue table not found in schema. Stopping email queue processing.');
        this.stopProcessing();
        return;
      }
      
      console.error('[EMAIL_QUEUE] Error processing queue:', error);
      this.recordFailure();
    }
  }

  /**
   * Process a single email job
   */
  private async processJob(job: any): Promise<void> {
    const attempts = job.attempts + 1;

    try {
      // Check if we should delay this job (exponential backoff)
      if (job.lastAttemptAt) {
        const delay = this.calculateBackoffDelay(job.attempts);
        const timeSinceLastAttempt = Date.now() - new Date(job.lastAttemptAt).getTime();
        
        if (timeSinceLastAttempt < delay) {
          console.log(`[EMAIL_QUEUE] Job ${job.id} is in backoff period, skipping`);
          return;
        }
      }

      console.log(`[EMAIL_QUEUE] Processing job ${job.id} (attempt ${attempts}/${this.MAX_ATTEMPTS})`);

      // Update attempt count
      await prisma.emailQueue.update({
        where: { id: job.id },
        data: {
          attempts,
          lastAttemptAt: new Date()
        }
      });

      // Send email based on type
      let success = false;
      if (job.type === 'instant') {
        success = await this.emailService.sendNotificationEmail(job.user, job.notification);
      }

      if (success) {
        // Mark as sent
        await prisma.emailQueue.update({
          where: { id: job.id },
          data: {
            status: 'sent',
            sentAt: new Date(),
            error: null
          }
        });

        console.log(`[EMAIL_QUEUE] Successfully sent email for job ${job.id}`);
        this.recordSuccess();
      } else {
        throw new Error('Email sending returned false');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[EMAIL_QUEUE] Error processing job ${job.id}:`, errorMessage);

      // Update job with error
      if (attempts >= this.MAX_ATTEMPTS) {
        // Max attempts reached, mark as failed
        await prisma.emailQueue.update({
          where: { id: job.id },
          data: {
            status: 'failed',
            error: errorMessage
          }
        });

        console.error(`[EMAIL_QUEUE] Job ${job.id} failed after ${this.MAX_ATTEMPTS} attempts`);
      } else {
        // Will retry
        await prisma.emailQueue.update({
          where: { id: job.id },
          data: {
            error: errorMessage
          }
        });

        console.log(`[EMAIL_QUEUE] Job ${job.id} will retry (${attempts}/${this.MAX_ATTEMPTS})`);
      }

      this.recordFailure();
    }
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoffDelay(attempts: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, etc.
    return this.BASE_DELAY * Math.pow(2, attempts);
  }

  /**
   * Check if circuit breaker allows processing
   */
  private canProcessJobs(): boolean {
    const now = Date.now();

    switch (this.circuitBreaker.state) {
      case 'closed':
        return true;

      case 'open':
        // Check if timeout has passed
        if (now - this.circuitBreaker.lastFailureTime >= this.CIRCUIT_BREAKER_TIMEOUT) {
          console.log('[EMAIL_QUEUE] Circuit breaker moving to half-open state');
          this.circuitBreaker.state = 'half-open';
          return true;
        }
        return false;

      case 'half-open':
        return true;

      default:
        return true;
    }
  }

  /**
   * Record a successful job processing
   */
  private recordSuccess(): void {
    if (this.circuitBreaker.state === 'half-open') {
      console.log('[EMAIL_QUEUE] Circuit breaker closing after successful job');
      this.circuitBreaker.state = 'closed';
      this.circuitBreaker.failures = 0;
    }
  }

  /**
   * Record a failed job processing
   */
  private recordFailure(): void {
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailureTime = Date.now();

    if (this.circuitBreaker.failures >= this.CIRCUIT_BREAKER_THRESHOLD) {
      console.error(`[EMAIL_QUEUE] Circuit breaker opening after ${this.circuitBreaker.failures} failures`);
      this.circuitBreaker.state = 'open';
    }
  }

  /**
   * Get circuit breaker status
   */
  getCircuitBreakerStatus(): CircuitBreakerState {
    return { ...this.circuitBreaker };
  }

  /**
   * Reset circuit breaker (for testing or manual intervention)
   */
  resetCircuitBreaker(): void {
    this.circuitBreaker = {
      failures: 0,
      lastFailureTime: 0,
      state: 'closed'
    };
    console.log('[EMAIL_QUEUE] Circuit breaker reset');
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{
    pending: number;
    sent: number;
    failed: number;
    total: number;
  }> {
    const [pending, sent, failed, total] = await Promise.all([
      prisma.emailQueue.count({ where: { status: 'pending' } }),
      prisma.emailQueue.count({ where: { status: 'sent' } }),
      prisma.emailQueue.count({ where: { status: 'failed' } }),
      prisma.emailQueue.count()
    ]);

    return { pending, sent, failed, total };
  }

  /**
   * Retry failed jobs (manual intervention)
   */
  async retryFailedJobs(): Promise<number> {
    const result = await prisma.emailQueue.updateMany({
      where: {
        status: 'failed'
      },
      data: {
        status: 'pending',
        attempts: 0,
        error: null,
        lastAttemptAt: null
      }
    });

    console.log(`[EMAIL_QUEUE] Reset ${result.count} failed jobs for retry`);
    return result.count;
  }
}

// Export singleton instance
export const emailQueueService = new EmailQueueService();
