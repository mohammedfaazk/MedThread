/**
 * PWA Manager - Centralized PWA functionality
 */

export class PWAManager {
  private static instance: PWAManager
  private registration: ServiceWorkerRegistration | null = null

  private constructor() {}

  static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager()
    }
    return PWAManager.instance
  }

  /**
   * Initialize PWA features
   */
  async initialize(): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      // Register service worker
      if ('serviceWorker' in navigator) {
        this.registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none'
        })

        console.log('[PWA] Service worker registered')

        // Check for updates
        this.registration.addEventListener('updatefound', () => {
          console.log('[PWA] Update found')
          const newWorker = this.registration?.installing
          
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              this.notifyUpdate()
            }
          })
        })
      }

      // Handle app updates
      this.setupUpdateHandler()

      // Setup offline detection
      this.setupOfflineDetection()

    } catch (error) {
      console.error('[PWA] Initialization failed:', error)
    }
  }

  /**
   * Check if app is installed
   */
  isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true
  }

  /**
   * Get service worker registration
   */
  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration
  }

  /**
   * Update service worker
   */
  async update(): Promise<void> {
    if (this.registration) {
      await this.registration.update()
    }
  }

  /**
   * Notify user of available update
   */
  private notifyUpdate(): void {
    if (confirm('A new version is available! Reload to update?')) {
      window.location.reload()
    }
  }

  /**
   * Setup update handler
   */
  private setupUpdateHandler(): void {
    let refreshing = false

    navigator.serviceWorker?.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true
        window.location.reload()
      }
    })
  }

  /**
   * Setup offline detection
   */
  private setupOfflineDetection(): void {
    window.addEventListener('online', () => {
      console.log('[PWA] Back online')
      this.syncOfflineData()
    })

    window.addEventListener('offline', () => {
      console.log('[PWA] Gone offline')
    })
  }

  /**
   * Sync offline data when back online
   */
  private async syncOfflineData(): Promise<void> {
    if ('sync' in this.registration!) {
      try {
        await this.registration!.sync.register('sync-posts')
        console.log('[PWA] Background sync registered')
      } catch (error) {
        console.error('[PWA] Background sync failed:', error)
      }
    }
  }

  /**
   * Clear all caches
   */
  async clearCaches(): Promise<void> {
    const cacheNames = await caches.keys()
    await Promise.all(cacheNames.map(name => caches.delete(name)))
    console.log('[PWA] Caches cleared')
  }

  /**
   * Get cache size
   */
  async getCacheSize(): Promise<number> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      return estimate.usage || 0
    }
    return 0
  }
}

export const pwaManager = PWAManager.getInstance()
