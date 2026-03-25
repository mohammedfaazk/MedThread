import { prisma } from '@medthread/database';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

const execAsync = promisify(exec);

interface BackupConfig {
  retentionDays: number;
  backupPath: string;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
}

export class BackupService {
  private config: BackupConfig = {
    retentionDays: 30,
    backupPath: process.env.BACKUP_PATH || './backups',
    compressionEnabled: true,
    encryptionEnabled: false,
  };

  /**
   * Create full database backup
   */
  async createFullBackup(): Promise<{
    success: boolean;
    backupId: string;
    filePath: string;
    size: number;
    duration: number;
  }> {
    const startTime = Date.now();
    const backupId = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}`;
    const backupDir = path.join(this.config.backupPath, backupId);
    
    try {
      // Ensure backup directory exists
      await fs.mkdir(backupDir, { recursive: true });

      // Create database dump
      const dbBackupPath = await this.createDatabaseDump(backupDir);
      
      // Backup uploaded files
      const filesBackupPath = await this.backupUploadedFiles(backupDir);
      
      // Create backup metadata
      const metadata = {
        backupId,
        createdAt: new Date().toISOString(),
        type: 'FULL',
        database: {
          path: dbBackupPath,
          size: await this.getFileSize(dbBackupPath)
        },
        files: {
          path: filesBackupPath,
          size: filesBackupPath ? await this.getFileSize(filesBackupPath) : 0
        },
        totalSize: 0,
        duration: 0,
        status: 'COMPLETED'
      };

      metadata.totalSize = metadata.database.size + metadata.files.size;
      metadata.duration = Date.now() - startTime;

      // Save metadata
      const metadataPath = path.join(backupDir, 'metadata.json');
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

      // Store backup record in database
      await this.storeBackupRecord(metadata);

      // Compress if enabled
      let finalPath = backupDir;
      if (this.config.compressionEnabled) {
        finalPath = await this.compressBackup(backupDir);
      }

      console.log(`[BackupService] Full backup completed: ${backupId}`);

      return {
        success: true,
        backupId,
        filePath: finalPath,
        size: metadata.totalSize,
        duration: metadata.duration
      };
    } catch (error) {
      console.error('[BackupService] Full backup failed:', error);
      
      // Store failed backup record
      await this.storeBackupRecord({
        backupId,
        createdAt: new Date().toISOString(),
        type: 'FULL',
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      });

      return {
        success: false,
        backupId,
        filePath: '',
        size: 0,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Create incremental backup (only changed data)
   */
  async createIncrementalBackup(lastBackupDate: Date): Promise<{
    success: boolean;
    backupId: string;
    filePath: string;
    size: number;
    recordsBackedUp: number;
  }> {
    const backupId = `incremental_${new Date().toISOString().replace(/[:.]/g, '-')}`;
    const backupDir = path.join(this.config.backupPath, backupId);
    
    try {
      await fs.mkdir(backupDir, { recursive: true });

      // Get changed records since last backup
      const changedData = await this.getChangedData(lastBackupDate);
      
      // Export changed data
      const dataPath = path.join(backupDir, 'incremental_data.json');
      await fs.writeFile(dataPath, JSON.stringify(changedData, null, 2));

      const metadata = {
        backupId,
        createdAt: new Date().toISOString(),
        type: 'INCREMENTAL',
        lastBackupDate: lastBackupDate.toISOString(),
        recordsBackedUp: this.countRecords(changedData),
        size: await this.getFileSize(dataPath),
        status: 'COMPLETED'
      };

      await fs.writeFile(
        path.join(backupDir, 'metadata.json'),
        JSON.stringify(metadata, null, 2)
      );

      await this.storeBackupRecord(metadata);

      console.log(`[BackupService] Incremental backup completed: ${backupId}`);

      return {
        success: true,
        backupId,
        filePath: backupDir,
        size: metadata.size,
        recordsBackedUp: metadata.recordsBackedUp
      };
    } catch (error) {
      console.error('[BackupService] Incremental backup failed:', error);
      return {
        success: false,
        backupId,
        filePath: '',
        size: 0,
        recordsBackedUp: 0
      };
    }
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(backupId: string, options: {
    restoreDatabase?: boolean;
    restoreFiles?: boolean;
    targetDate?: Date;
  } = {}): Promise<{
    success: boolean;
    restoredTables: string[];
    restoredFiles: number;
    duration: number;
  }> {
    const startTime = Date.now();
    const { restoreDatabase = true, restoreFiles = true } = options;
    
    try {
      const backupRecord = await this.getBackupRecord(backupId);
      if (!backupRecord) {
        throw new Error(`Backup ${backupId} not found`);
      }

      const backupPath = path.join(this.config.backupPath, backupId);
      const restoredTables: string[] = [];
      let restoredFiles = 0;

      // Restore database
      if (restoreDatabase) {
        const dbRestoreResult = await this.restoreDatabase(backupPath);
        restoredTables.push(...dbRestoreResult.tables);
      }

      // Restore files
      if (restoreFiles) {
        restoredFiles = await this.restoreFiles(backupPath);
      }

      console.log(`[BackupService] Restore completed: ${backupId}`);

      return {
        success: true,
        restoredTables,
        restoredFiles,
        duration: Date.now() - startTime
      };
    } catch (error) {
      console.error('[BackupService] Restore failed:', error);
      return {
        success: false,
        restoredTables: [],
        restoredFiles: 0,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Schedule automatic backups
   */
  async scheduleBackups() {
    // Full backup daily at 2 AM
    const fullBackupCron = '0 2 * * *';
    
    // Incremental backup every 6 hours
    const incrementalBackupCron = '0 */6 * * *';

    console.log('[BackupService] Backup scheduling would be implemented with cron jobs');
    console.log(`Full backup schedule: ${fullBackupCron}`);
    console.log(`Incremental backup schedule: ${incrementalBackupCron}`);

    // In a real implementation, you would use node-cron or similar
    // cron.schedule(fullBackupCron, () => this.createFullBackup());
    // cron.schedule(incrementalBackupCron, () => this.createIncrementalBackup(lastBackupDate));
  }

  /**
   * Clean up old backups
   */
  async cleanupOldBackups(): Promise<{
    deletedBackups: string[];
    freedSpace: number;
  }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

      const oldBackups = await prisma.backupRecord.findMany({
        where: {
          createdAt: { lt: cutoffDate },
          status: 'COMPLETED'
        }
      });

      const deletedBackups: string[] = [];
      let freedSpace = 0;

      for (const backup of oldBackups) {
        try {
          const backupPath = path.join(this.config.backupPath, backup.backupId);
          const stats = await fs.stat(backupPath);
          
          if (stats.isDirectory()) {
            await fs.rm(backupPath, { recursive: true });
          } else {
            await fs.unlink(backupPath);
          }

          freedSpace += backup.totalSize || 0;
          deletedBackups.push(backup.backupId);

          // Remove from database
          await prisma.backupRecord.delete({
            where: { id: backup.id }
          });
        } catch (error) {
          console.error(`Failed to delete backup ${backup.backupId}:`, error);
        }
      }

      console.log(`[BackupService] Cleaned up ${deletedBackups.length} old backups, freed ${freedSpace} bytes`);

      return { deletedBackups, freedSpace };
    } catch (error) {
      console.error('[BackupService] Cleanup failed:', error);
      return { deletedBackups: [], freedSpace: 0 };
    }
  }

  /**
   * Get backup status and statistics
   */
  async getBackupStatus(): Promise<{
    totalBackups: number;
    totalSize: number;
    lastBackup: any;
    nextScheduledBackup: Date;
    storageUsed: number;
    retentionPolicy: string;
  }> {
    const backups = await prisma.backupRecord.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' }
    });

    const totalSize = backups.reduce((sum, backup) => sum + (backup.totalSize || 0), 0);
    const lastBackup = backups[0] || null;

    // Calculate next scheduled backup (simplified)
    const nextScheduledBackup = new Date();
    nextScheduledBackup.setHours(2, 0, 0, 0); // Next 2 AM
    if (nextScheduledBackup <= new Date()) {
      nextScheduledBackup.setDate(nextScheduledBackup.getDate() + 1);
    }

    return {
      totalBackups: backups.length,
      totalSize,
      lastBackup,
      nextScheduledBackup,
      storageUsed: totalSize,
      retentionPolicy: `${this.config.retentionDays} days`
    };
  }

  // Private helper methods
  private async createDatabaseDump(backupDir: string): Promise<string> {
    const dumpPath = path.join(backupDir, 'database.sql');
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL not configured');
    }

    // Use pg_dump for PostgreSQL
    const command = `pg_dump "${databaseUrl}" > "${dumpPath}"`;
    await execAsync(command);
    
    return dumpPath;
  }

  private async backupUploadedFiles(backupDir: string): Promise<string | null> {
    const uploadsPath = process.env.UPLOADS_PATH || './uploads';
    
    try {
      await fs.access(uploadsPath);
      const filesBackupPath = path.join(backupDir, 'files.tar.gz');
      
      // Create tar archive of uploaded files
      const command = `tar -czf "${filesBackupPath}" -C "${uploadsPath}" .`;
      await execAsync(command);
      
      return filesBackupPath;
    } catch (error) {
      console.log('[BackupService] No uploads directory found, skipping file backup');
      return null;
    }
  }

  private async getChangedData(since: Date) {
    // Get all records modified since the last backup
    const [users, posts, comments, appointments] = await Promise.all([
      prisma.user.findMany({
        where: { updatedAt: { gte: since } }
      }),
      prisma.post.findMany({
        where: { updatedAt: { gte: since } }
      }),
      prisma.comment.findMany({
        where: { updatedAt: { gte: since } }
      }),
      prisma.appointment.findMany({
        where: { updatedAt: { gte: since } }
      })
    ]);

    return { users, posts, comments, appointments };
  }

  private countRecords(data: any): number {
    return Object.values(data).reduce((total: number, records: any) => {
      return total + (Array.isArray(records) ? records.length : 0);
    }, 0);
  }

  private async getFileSize(filePath: string): Promise<number> {
    try {
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch (error) {
      return 0;
    }
  }

  private async compressBackup(backupDir: string): Promise<string> {
    const compressedPath = `${backupDir}.tar.gz`;
    const command = `tar -czf "${compressedPath}" -C "${path.dirname(backupDir)}" "${path.basename(backupDir)}"`;
    
    await execAsync(command);
    
    // Remove uncompressed directory
    await fs.rm(backupDir, { recursive: true });
    
    return compressedPath;
  }

  private async storeBackupRecord(metadata: any) {
    try {
      await prisma.backupRecord.create({
        data: {
          backupId: metadata.backupId,
          type: metadata.type,
          status: metadata.status,
          totalSize: metadata.totalSize || 0,
          duration: metadata.duration || 0,
          recordsBackedUp: metadata.recordsBackedUp || 0,
          metadata: metadata,
          createdAt: new Date(metadata.createdAt),
        }
      });
    } catch (error) {
      console.error('[BackupService] Failed to store backup record:', error);
    }
  }

  private async getBackupRecord(backupId: string) {
    return await prisma.backupRecord.findUnique({
      where: { backupId }
    });
  }

  private async restoreDatabase(backupPath: string): Promise<{ tables: string[] }> {
    const sqlFile = path.join(backupPath, 'database.sql');
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL not configured');
    }

    // Restore database from SQL dump
    const command = `psql "${databaseUrl}" < "${sqlFile}"`;
    await execAsync(command);
    
    // Return list of restored tables (simplified)
    return { tables: ['users', 'posts', 'comments', 'appointments'] };
  }

  private async restoreFiles(backupPath: string): Promise<number> {
    const filesArchive = path.join(backupPath, 'files.tar.gz');
    const uploadsPath = process.env.UPLOADS_PATH || './uploads';
    
    try {
      await fs.access(filesArchive);
      
      // Extract files
      const command = `tar -xzf "${filesArchive}" -C "${uploadsPath}"`;
      await execAsync(command);
      
      // Count restored files (simplified)
      return 100; // Placeholder
    } catch (error) {
      console.log('[BackupService] No files archive found');
      return 0;
    }
  }
}

export const backupService = new BackupService();