interface OfflineAction {
  id: string;
  type: 'CREATE_POST' | 'CREATE_COMMENT' | 'VOTE' | 'SAVE_POST' | 'UPDATE_PROFILE' | 'SEND_MESSAGE';
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  status: 'PENDING' | 'SYNCING' | 'COMPLETED' | 'FAILED';
}

interface SyncResult {
  success: boolean;
  syncedActions: number;
  failedActions: number;
  errors: string[];
}

class OfflineSyncManager {
  private dbName = 'MedThreadOffline';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private syncInProgress = false;
  private syncQueue: OfflineAction[] = [];
  private maxRetries = 3;
  private retryDelay = 5000; // 5 seconds

  constructor() {
    this.initializeDB();
    this.setupEventListeners();
    this.startPeriodicSync();
  }

  /**
   * Initialize IndexedDB for offline storage
   */
  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        console.log('[OfflineSync] Database initialized');
        this.loadPendingActions();
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('actions')) {
          const actionStore = db.createObjectStore('actions', { keyPath: 'id' });
          actionStore.createIndex('status', 'status', { unique: false });
          actionStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('cachedData')) {
          const cacheStore = db.createObjectStore('cachedData', { keyPath: 'key' });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('drafts')) {
          db.createObjectStore('drafts', { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * Setup event listeners for online/offline status
   */
  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      console.log('[OfflineSync] Back online, starting sync');
      this.syncPendingActions();
    });

    window.addEventListener('offline', () => {
      console.log('[OfflineSync] Gone offline, queuing actions');
    });

    // Sync before page unload
    window.addEventListener('beforeunload', () => {
      if (navigator.onLine && this.syncQueue.length > 0) {
        // Try to sync immediately (limited time)
        this.syncPendingActions();
      }
    });
  }

  /**
   * Start periodic sync when online
   */
  private startPeriodicSync(): void {
    setInterval(() => {
      if (navigator.onLine && !this.syncInProgress && this.syncQueue.length > 0) {
        this.syncPendingActions();
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Queue an action for offline execution
   */
  async queueAction(
    type: OfflineAction['type'],
    data: any,
    options: { maxRetries?: number } = {}
  ): Promise<string> {
    const action: OfflineAction = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: options.maxRetries || this.maxRetries,
      status: 'PENDING'
    };

    // Add to memory queue
    this.syncQueue.push(action);

    // Store in IndexedDB
    await this.storeAction(action);

    console.log(`[OfflineSync] Queued action: ${type}`);

    // Try to sync immediately if online
    if (navigator.onLine) {
      setTimeout(() => this.syncPendingActions(), 1000);
    }

    return action.id;
  }

  /**
   * Sync all pending actions
   */
  async syncPendingActions(): Promise<SyncResult> {
    if (this.syncInProgress || !navigator.onLine) {
      return { success: false, syncedActions: 0, failedActions: 0, errors: ['Sync already in progress or offline'] };
    }

    this.syncInProgress = true;
    const result: SyncResult = {
      success: true,
      syncedActions: 0,
      failedActions: 0,
      errors: []
    };

    console.log(`[OfflineSync] Starting sync of ${this.syncQueue.length} actions`);

    try {
      const pendingActions = this.syncQueue.filter(action => action.status === 'PENDING');

      for (const action of pendingActions) {
        try {
          action.status = 'SYNCING';
          await this.updateAction(action);

          const success = await this.executeAction(action);

          if (success) {
            action.status = 'COMPLETED';
            result.syncedActions++;
            console.log(`[OfflineSync] Synced action: ${action.type}`);
          } else {
            throw new Error('Action execution failed');
          }
        } catch (error) {
          action.retryCount++;
          
          if (action.retryCount >= action.maxRetries) {
            action.status = 'FAILED';
            result.failedActions++;
            result.errors.push(`${action.type}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            console.error(`[OfflineSync] Action failed permanently: ${action.type}`, error);
          } else {
            action.status = 'PENDING';
            console.warn(`[OfflineSync] Action failed, will retry (${action.retryCount}/${action.maxRetries}): ${action.type}`, error);
          }
        }

        await this.updateAction(action);
      }

      // Remove completed actions from queue
      this.syncQueue = this.syncQueue.filter(action => action.status !== 'COMPLETED');

      // Clean up completed actions from IndexedDB
      await this.cleanupCompletedActions();

    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Unknown sync error');
      console.error('[OfflineSync] Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }

    console.log(`[OfflineSync] Sync completed: ${result.syncedActions} synced, ${result.failedActions} failed`);
    return result;
  }

  /**
   * Execute a specific action
   */
  private async executeAction(action: OfflineAction): Promise<boolean> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token available');
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    try {
      switch (action.type) {
        case 'CREATE_POST':
          await fetch(`${apiUrl}/api/v1/posts`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(action.data)
          });
          break;

        case 'CREATE_COMMENT':
          await fetch(`${apiUrl}/api/v1/posts/${action.data.postId}/comments`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content: action.data.content })
          });
          break;

        case 'VOTE':
          await fetch(`${apiUrl}/api/v1/posts/${action.data.postId}/vote`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ value: action.data.value })
          });
          break;

        case 'SAVE_POST':
          await fetch(`${apiUrl}/api/v1/posts/${action.data.postId}/save`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          break;

        case 'UPDATE_PROFILE':
          await fetch(`${apiUrl}/api/v1/users/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(action.data)
          });
          break;

        case 'SEND_MESSAGE':
          await fetch(`${apiUrl}/api/v1/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(action.data)
          });
          break;

        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }

      return true;
    } catch (error) {
      console.error(`[OfflineSync] Failed to execute ${action.type}:`, error);
      return false;
    }
  }

  /**
   * Cache data for offline access
   */
  async cacheData(key: string, data: any, ttl: number = 24 * 60 * 60 * 1000): Promise<void> {
    if (!this.db) return;

    const cacheItem = {
      key,
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    };

    const transaction = this.db.transaction(['cachedData'], 'readwrite');
    const store = transaction.objectStore('cachedData');
    await store.put(cacheItem);
  }

  /**
   * Get cached data
   */
  async getCachedData<T>(key: string): Promise<T | null> {
    if (!this.db) return null;

    const transaction = this.db.transaction(['cachedData'], 'readonly');
    const store = transaction.objectStore('cachedData');
    
    return new Promise((resolve) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result;
        if (result && result.expiresAt > Date.now()) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  }

  /**
   * Save draft content
   */
  async saveDraft(id: string, content: any): Promise<void> {
    if (!this.db) return;

    const draft = {
      id,
      content,
      timestamp: Date.now()
    };

    const transaction = this.db.transaction(['drafts'], 'readwrite');
    const store = transaction.objectStore('drafts');
    await store.put(draft);
  }

  /**
   * Get saved draft
   */
  async getDraft(id: string): Promise<any | null> {
    if (!this.db) return null;

    const transaction = this.db.transaction(['drafts'], 'readonly');
    const store = transaction.objectStore('drafts');
    
    return new Promise((resolve) => {
      const request = store.get(id);
      request.onsuccess = () => {
        resolve(request.result?.content || null);
      };
      request.onerror = () => resolve(null);
    });
  }

  /**
   * Get sync status
   */
  getSyncStatus(): {
    isOnline: boolean;
    syncInProgress: boolean;
    pendingActions: number;
    failedActions: number;
  } {
    return {
      isOnline: navigator.onLine,
      syncInProgress: this.syncInProgress,
      pendingActions: this.syncQueue.filter(a => a.status === 'PENDING').length,
      failedActions: this.syncQueue.filter(a => a.status === 'FAILED').length
    };
  }

  /**
   * Retry failed actions
   */
  async retryFailedActions(): Promise<void> {
    const failedActions = this.syncQueue.filter(action => action.status === 'FAILED');
    
    for (const action of failedActions) {
      action.status = 'PENDING';
      action.retryCount = 0;
      await this.updateAction(action);
    }

    if (navigator.onLine) {
      this.syncPendingActions();
    }
  }

  // Private helper methods
  private async loadPendingActions(): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['actions'], 'readonly');
    const store = transaction.objectStore('actions');
    const index = store.index('status');
    
    const request = index.getAll('PENDING');
    request.onsuccess = () => {
      this.syncQueue = request.result || [];
      console.log(`[OfflineSync] Loaded ${this.syncQueue.length} pending actions`);
    };
  }

  private async storeAction(action: OfflineAction): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['actions'], 'readwrite');
    const store = transaction.objectStore('actions');
    await store.put(action);
  }

  private async updateAction(action: OfflineAction): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['actions'], 'readwrite');
    const store = transaction.objectStore('actions');
    await store.put(action);
  }

  private async cleanupCompletedActions(): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['actions'], 'readwrite');
    const store = transaction.objectStore('actions');
    const index = store.index('status');
    
    const request = index.getAllKeys('COMPLETED');
    request.onsuccess = () => {
      const keys = request.result;
      keys.forEach(key => store.delete(key));
    };
  }
}

// Create singleton instance
export const offlineSyncManager = new OfflineSyncManager();

// Export helper functions
export const queueOfflineAction = (type: OfflineAction['type'], data: any, options?: { maxRetries?: number }) =>
  offlineSyncManager.queueAction(type, data, options);

export const syncPendingActions = () => offlineSyncManager.syncPendingActions();

export const cacheForOffline = (key: string, data: any, ttl?: number) =>
  offlineSyncManager.cacheData(key, data, ttl);

export const getCachedData = <T>(key: string) => offlineSyncManager.getCachedData<T>(key);

export const saveDraft = (id: string, content: any) => offlineSyncManager.saveDraft(id, content);

export const getDraft = (id: string) => offlineSyncManager.getDraft(id);

export const getSyncStatus = () => offlineSyncManager.getSyncStatus();

export const retryFailedActions = () => offlineSyncManager.retryFailedActions();