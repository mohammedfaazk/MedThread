"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailQueueService = exports.EmailQueueService = void 0;
const database_1 = require("@medthread/database");
const email_service_1 = require("./email.service");
const notification_service_1 = require("./notification.service");
const notification_preferences_service_1 = require("./notification-preferences.service");
class EmailQueueService {
    constructor() {
        this.isProcessing = false;
        this.processingInterval = null;
        // Circuit breaker configuration
        this.circuitBreaker = {
            failures: 0,
            lastFailureTime: 0,
            state: 'closed'
        };
        this.CIRCUIT_BREAKER_THRESHOLD = 5; // Open after 5 failures
        this.CIRCUIT_BREAKER_TIMEOUT = 60000; // 1 minute
        this.CIRCUIT_BREAKER_HALF_OPEN_TIMEOUT = 30000; // 30 seconds
        // Retry configuration
        this.MAX_ATTEMPTS = 3;
        this.BASE_DELAY = 1000; // 1 second
        this.emailService = new email_service_1.EmailService();
        this.notificationService = new notification_service_1.NotificationService();
        this.preferencesService = new notification_preferences_service_1.PreferencesService();
    }
    /**
     * Enqueue an instant email notification
     */
    async enqueueInstantEmail(notificationId, userId) {
        try {
            // Check if user has instant email enabled for this notification type
            const notification = await database_1.prisma.notification.findUnique({
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
            await database_1.prisma.emailQueue.create({
                data: {
                    userId,
                    notificationId,
                    type: 'instant',
                    status: 'pending'
                }
            });
            console.log(`[EMAIL_QUEUE] Enqueued instant email for notification ${notificationId}`);
        }
        catch (error) {
            console.error('[EMAIL_QUEUE] Error enqueueing instant email:', error);
            throw error;
        }
    }
    /**
     * Enqueue multiple instant emails for a batch of notifications
     */
    async enqueueInstantEmailBatch(notifications) {
        try {
            const jobs = [];
            for (const notification of notifications) {
                const preferences = await this.preferencesService.getPreferences(notification.recipientId);
                const emailPreference = preferences.email[notification.type];
                if (emailPreference === 'instant') {
                    jobs.push({
                        userId: notification.recipientId,
                        notificationId: notification.id,
                        type: 'instant',
                        status: 'pending'
                    });
                }
            }
            if (jobs.length > 0) {
                await database_1.prisma.emailQueue.createMany({
                    data: jobs
                });
                console.log(`[EMAIL_QUEUE] Enqueued ${jobs.length} instant emails`);
            }
        }
        catch (error) {
            console.error('[EMAIL_QUEUE] Error enqueueing instant email batch:', error);
            throw error;
        }
    }
    /**
     * Start processing the email queue
     * Processes jobs every 30 seconds
     */
    startProcessing(intervalMs = 30000) {
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
    stopProcessing() {
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
    async processQueue() {
        // Check circuit breaker
        if (!this.canProcessJobs()) {
            console.log('[EMAIL_QUEUE] Circuit breaker is open, skipping processing');
            return;
        }
        try {
            // Fetch pending jobs that haven't exceeded max attempts
            const jobs = await database_1.prisma.emailQueue.findMany({
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
        }
        catch (error) {
            console.error('[EMAIL_QUEUE] Error processing queue:', error);
            this.recordFailure();
        }
    }
    /**
     * Process a single email job
     */
    async processJob(job) {
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
            await database_1.prisma.emailQueue.update({
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
                await database_1.prisma.emailQueue.update({
                    where: { id: job.id },
                    data: {
                        status: 'sent',
                        sentAt: new Date(),
                        error: null
                    }
                });
                console.log(`[EMAIL_QUEUE] Successfully sent email for job ${job.id}`);
                this.recordSuccess();
            }
            else {
                throw new Error('Email sending returned false');
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`[EMAIL_QUEUE] Error processing job ${job.id}:`, errorMessage);
            // Update job with error
            if (attempts >= this.MAX_ATTEMPTS) {
                // Max attempts reached, mark as failed
                await database_1.prisma.emailQueue.update({
                    where: { id: job.id },
                    data: {
                        status: 'failed',
                        error: errorMessage
                    }
                });
                console.error(`[EMAIL_QUEUE] Job ${job.id} failed after ${this.MAX_ATTEMPTS} attempts`);
            }
            else {
                // Will retry
                await database_1.prisma.emailQueue.update({
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
    calculateBackoffDelay(attempts) {
        // Exponential backoff: 1s, 2s, 4s, 8s, etc.
        return this.BASE_DELAY * Math.pow(2, attempts);
    }
    /**
     * Check if circuit breaker allows processing
     */
    canProcessJobs() {
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
    recordSuccess() {
        if (this.circuitBreaker.state === 'half-open') {
            console.log('[EMAIL_QUEUE] Circuit breaker closing after successful job');
            this.circuitBreaker.state = 'closed';
            this.circuitBreaker.failures = 0;
        }
    }
    /**
     * Record a failed job processing
     */
    recordFailure() {
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
    getCircuitBreakerStatus() {
        return { ...this.circuitBreaker };
    }
    /**
     * Reset circuit breaker (for testing or manual intervention)
     */
    resetCircuitBreaker() {
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
    async getQueueStats() {
        const [pending, sent, failed, total] = await Promise.all([
            database_1.prisma.emailQueue.count({ where: { status: 'pending' } }),
            database_1.prisma.emailQueue.count({ where: { status: 'sent' } }),
            database_1.prisma.emailQueue.count({ where: { status: 'failed' } }),
            database_1.prisma.emailQueue.count()
        ]);
        return { pending, sent, failed, total };
    }
    /**
     * Retry failed jobs (manual intervention)
     */
    async retryFailedJobs() {
        const result = await database_1.prisma.emailQueue.updateMany({
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
exports.EmailQueueService = EmailQueueService;
// Export singleton instance
exports.emailQueueService = new EmailQueueService();
