import { prisma } from '@medthread/database';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  details?: Record<string, any>;
}

export class PerformanceMonitorService {
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetricsInMemory = 1000;

  /**
   * Record performance metric
   */
  recordMetric(name: string, value: number, unit: string, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date(),
      metadata
    };

    this.metrics.push(metric);

    // Keep only recent metrics in memory
    if (this.metrics.length > this.maxMetricsInMemory) {
      this.metrics = this.metrics.slice(-this.maxMetricsInMemory);
    }

    // Store critical metrics in database
    if (this.isCriticalMetric(name)) {
      this.storeMetricInDatabase(metric);
    }
  }

  /**
   * Measure execution time of a function
   */
  async measureExecutionTime<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      
      this.recordMetric(name, duration, 'ms', {
        ...metadata,
        status: 'success'
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.recordMetric(name, duration, 'ms', {
        ...metadata,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }

  /**
   * Monitor API endpoint performance
   */
  createApiMonitoringMiddleware() {
    return (req: any, res: any, next: any) => {
      const startTime = Date.now();
      const originalSend = res.send;

      res.send = function(data: any) {
        const duration = Date.now() - startTime;
        
        // Record API performance metric
        performanceMonitorService.recordMetric(
          `api.${req.method}.${req.route?.path || req.path}`,
          duration,
          'ms',
          {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            userAgent: req.get('User-Agent'),
            ip: req.ip
          }
        );

        // Alert on slow requests
        if (duration > 5000) { // 5 seconds
          performanceMonitorService.recordAlert('slow_api_request', {
            path: req.path,
            duration,
            method: req.method
          });
        }

        return originalSend.call(this, data);
      };

      next();
    };
  }

  /**
   * Monitor database query performance
   */
  async monitorDatabaseQuery<T>(
    queryName: string,
    query: () => Promise<T>
  ): Promise<T> {
    return this.measureExecutionTime(`db.${queryName}`, query);
  }

  /**
   * Comprehensive health check
   */
  async performHealthCheck(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    services: HealthCheckResult[];
    timestamp: Date;
  }> {
    const healthChecks: HealthCheckResult[] = [];

    // Database health check
    const dbHealth = await this.checkDatabaseHealth();
    healthChecks.push(dbHealth);

    // Memory usage check
    const memoryHealth = this.checkMemoryHealth();
    healthChecks.push(memoryHealth);

    // Disk space check
    const diskHealth = await this.checkDiskHealth();
    healthChecks.push(diskHealth);

    // API response time check
    const apiHealth = this.checkApiHealth();
    healthChecks.push(apiHealth);

    // Determine overall health
    const unhealthyServices = healthChecks.filter(s => s.status === 'unhealthy').length;
    const degradedServices = healthChecks.filter(s => s.status === 'degraded').length;

    let overall: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (unhealthyServices > 0) {
      overall = 'unhealthy';
    } else if (degradedServices > 0) {
      overall = 'degraded';
    }

    const result = {
      overall,
      services: healthChecks,
      timestamp: new Date()
    };

    // Store health check result
    await this.storeHealthCheckResult(result);

    return result;
  }

  /**
   * Get performance metrics
   */
  getMetrics(filters: {
    name?: string;
    since?: Date;
    limit?: number;
  } = {}): PerformanceMetric[] {
    let filteredMetrics = this.metrics;

    if (filters.name) {
      filteredMetrics = filteredMetrics.filter(m => m.name.includes(filters.name!));
    }

    if (filters.since) {
      filteredMetrics = filteredMetrics.filter(m => m.timestamp >= filters.since!);
    }

    if (filters.limit) {
      filteredMetrics = filteredMetrics.slice(-filters.limit);
    }

    return filteredMetrics;
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(metricName: string, timeWindow: number = 3600000): {
    average: number;
    min: number;
    max: number;
    count: number;
    p95: number;
    p99: number;
  } {
    const since = new Date(Date.now() - timeWindow);
    const metrics = this.getMetrics({ name: metricName, since });

    if (metrics.length === 0) {
      return { average: 0, min: 0, max: 0, count: 0, p95: 0, p99: 0 };
    }

    const values = metrics.map(m => m.value).sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      average: sum / values.length,
      min: values[0],
      max: values[values.length - 1],
      count: values.length,
      p95: values[Math.floor(values.length * 0.95)] || 0,
      p99: values[Math.floor(values.length * 0.99)] || 0
    };
  }

  /**
   * Record performance alert
   */
  recordAlert(type: string, details: Record<string, any>) {
    console.warn(`[PerformanceAlert] ${type}:`, details);
    
    // Store alert in database
    this.storeAlert(type, details);
  }

  /**
   * Monitor system resources
   */
  monitorSystemResources() {
    setInterval(() => {
      const memUsage = process.memoryUsage();
      
      this.recordMetric('system.memory.rss', memUsage.rss, 'bytes');
      this.recordMetric('system.memory.heapUsed', memUsage.heapUsed, 'bytes');
      this.recordMetric('system.memory.heapTotal', memUsage.heapTotal, 'bytes');
      this.recordMetric('system.memory.external', memUsage.external, 'bytes');

      // CPU usage (simplified)
      const cpuUsage = process.cpuUsage();
      this.recordMetric('system.cpu.user', cpuUsage.user, 'microseconds');
      this.recordMetric('system.cpu.system', cpuUsage.system, 'microseconds');

    }, 30000); // Every 30 seconds
  }

  // Private helper methods
  private isCriticalMetric(name: string): boolean {
    const criticalMetrics = [
      'api.',
      'db.',
      'system.memory',
      'system.cpu',
      'health_check'
    ];
    
    return criticalMetrics.some(prefix => name.startsWith(prefix));
  }

  private async storeMetricInDatabase(metric: PerformanceMetric) {
    try {
      await prisma.performanceMetric.create({
        data: {
          name: metric.name,
          value: metric.value,
          unit: metric.unit,
          metadata: metric.metadata || {},
          timestamp: metric.timestamp
        }
      });
    } catch (error) {
      console.error('[PerformanceMonitor] Failed to store metric:', error);
    }
  }

  private async checkDatabaseHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      await prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;
      
      return {
        service: 'database',
        status: responseTime < 1000 ? 'healthy' : 'degraded',
        responseTime,
        details: {
          connectionPool: 'active',
          queryTime: responseTime
        }
      };
    } catch (error) {
      return {
        service: 'database',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  private checkMemoryHealth(): HealthCheckResult {
    const memUsage = process.memoryUsage();
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
    const heapTotalMB = memUsage.heapTotal / 1024 / 1024;
    const memoryUsagePercent = (heapUsedMB / heapTotalMB) * 100;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (memoryUsagePercent > 90) {
      status = 'unhealthy';
    } else if (memoryUsagePercent > 75) {
      status = 'degraded';
    }

    return {
      service: 'memory',
      status,
      responseTime: 0,
      details: {
        heapUsedMB: Math.round(heapUsedMB),
        heapTotalMB: Math.round(heapTotalMB),
        usagePercent: Math.round(memoryUsagePercent)
      }
    };
  }

  private async checkDiskHealth(): Promise<HealthCheckResult> {
    try {
      const { execSync } = require('child_process');
      const diskUsage = execSync('df -h /', { encoding: 'utf8' });
      
      // Parse disk usage (simplified)
      const lines = diskUsage.split('\n');
      const dataLine = lines[1];
      const parts = dataLine.split(/\s+/);
      const usagePercent = parseInt(parts[4].replace('%', ''));

      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      if (usagePercent > 90) {
        status = 'unhealthy';
      } else if (usagePercent > 80) {
        status = 'degraded';
      }

      return {
        service: 'disk',
        status,
        responseTime: 0,
        details: {
          usagePercent,
          available: parts[3],
          total: parts[1]
        }
      };
    } catch (error) {
      return {
        service: 'disk',
        status: 'unhealthy',
        responseTime: 0,
        details: {
          error: 'Unable to check disk usage'
        }
      };
    }
  }

  private checkApiHealth(): HealthCheckResult {
    const recentApiMetrics = this.getMetrics({
      name: 'api.',
      since: new Date(Date.now() - 300000) // Last 5 minutes
    });

    if (recentApiMetrics.length === 0) {
      return {
        service: 'api',
        status: 'healthy',
        responseTime: 0,
        details: { message: 'No recent API activity' }
      };
    }

    const avgResponseTime = recentApiMetrics.reduce((sum, m) => sum + m.value, 0) / recentApiMetrics.length;
    const errorCount = recentApiMetrics.filter(m => m.metadata?.status === 'error').length;
    const errorRate = (errorCount / recentApiMetrics.length) * 100;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (avgResponseTime > 5000 || errorRate > 10) {
      status = 'unhealthy';
    } else if (avgResponseTime > 2000 || errorRate > 5) {
      status = 'degraded';
    }

    return {
      service: 'api',
      status,
      responseTime: Math.round(avgResponseTime),
      details: {
        avgResponseTime: Math.round(avgResponseTime),
        errorRate: Math.round(errorRate * 100) / 100,
        totalRequests: recentApiMetrics.length
      }
    };
  }

  private async storeHealthCheckResult(result: any) {
    try {
      await prisma.healthCheck.create({
        data: {
          overall: result.overall,
          services: result.services,
          timestamp: result.timestamp
        }
      });
    } catch (error) {
      console.error('[PerformanceMonitor] Failed to store health check:', error);
    }
  }

  private async storeAlert(type: string, details: Record<string, any>) {
    try {
      await prisma.performanceAlert.create({
        data: {
          type,
          details,
          createdAt: new Date()
        }
      });
    } catch (error) {
      console.error('[PerformanceMonitor] Failed to store alert:', error);
    }
  }
}

export const performanceMonitorService = new PerformanceMonitorService();