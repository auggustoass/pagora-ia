interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface PerformanceAlert {
  type: 'warning' | 'critical';
  message: string;
  timestamp: number;
  metric: string;
  value: number;
  threshold: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private alerts: PerformanceAlert[] = [];
  private thresholds = new Map<string, { warning: number; critical: number }>();
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.setupDefaultThresholds();
    this.initializeObservers();
  }

  private setupDefaultThresholds() {
    this.thresholds.set('memory_usage', { warning: 50, critical: 80 });
    this.thresholds.set('cache_hit_rate', { warning: 60, critical: 40 });
    this.thresholds.set('api_response_time', { warning: 1000, critical: 3000 });
    this.thresholds.set('render_time', { warning: 16.67, critical: 33.33 });
  }

  private initializeObservers() {
    if ('PerformanceObserver' in window) {
      // Observe navigation timing
      const navObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.recordMetric('page_load_time', navEntry.loadEventEnd - navEntry.fetchStart);
            this.recordMetric('dom_content_loaded', navEntry.domContentLoadedEventEnd - navEntry.fetchStart);
          }
        });
      });

      try {
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navObserver);
      } catch (error) {
        console.warn('Navigation timing observer failed:', error);
      }

      // Observe paint timing
      const paintObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.recordMetric('first_contentful_paint', entry.startTime);
          }
        });
      });

      try {
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(paintObserver);
      } catch (error) {
        console.warn('Paint timing observer failed:', error);
      }
    }
  }

  recordMetric(name: string, value: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata
    };

    this.metrics.push(metric);
    this.checkThresholds(metric);

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  getMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      this.recordMetric('memory_usage', usagePercent);
      return {
        used: memory.usedJSHeapSize,
        total: memory.jsHeapSizeLimit,
        percentage: usagePercent
      };
    }
    return null;
  }

  measureApiCall<T>(
    name: string,
    apiCall: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    
    return apiCall()
      .then((result) => {
        const duration = performance.now() - startTime;
        this.recordMetric(`api_${name}`, duration);
        return result;
      })
      .catch((error) => {
        const duration = performance.now() - startTime;
        this.recordMetric(`api_${name}_error`, duration, { error: error.message });
        throw error;
      });
  }

  measureRender(componentName: string, renderFunction: () => void) {
    const startTime = performance.now();
    renderFunction();
    const duration = performance.now() - startTime;
    this.recordMetric(`render_${componentName}`, duration);
  }

  private checkThresholds(metric: PerformanceMetric) {
    const threshold = this.thresholds.get(metric.name);
    if (!threshold) return;

    let alertType: 'warning' | 'critical' | null = null;
    
    if (metric.name === 'cache_hit_rate') {
      // For cache hit rate, lower is worse
      if (metric.value < threshold.critical) {
        alertType = 'critical';
      } else if (metric.value < threshold.warning) {
        alertType = 'warning';
      }
    } else {
      // For other metrics, higher is worse
      if (metric.value > threshold.critical) {
        alertType = 'critical';
      } else if (metric.value > threshold.warning) {
        alertType = 'warning';
      }
    }

    if (alertType) {
      const alert: PerformanceAlert = {
        type: alertType,
        message: `${metric.name} ${alertType}: ${metric.value.toFixed(2)}`,
        timestamp: Date.now(),
        metric: metric.name,
        value: metric.value,
        threshold: alertType === 'critical' ? threshold.critical : threshold.warning
      };

      this.alerts.push(alert);
      
      // Keep only last 100 alerts
      if (this.alerts.length > 100) {
        this.alerts = this.alerts.slice(-100);
      }

      console.warn(`Performance ${alertType}:`, alert.message);
    }
  }

  getMetrics(name?: string, limit = 100) {
    let filtered = name 
      ? this.metrics.filter(m => m.name === name)
      : this.metrics;
    
    return filtered.slice(-limit);
  }

  getAlerts(limit = 50) {
    return this.alerts.slice(-limit);
  }

  getStats() {
    const now = Date.now();
    const recentMetrics = this.metrics.filter(m => now - m.timestamp < 60000); // Last minute
    
    const metricGroups = recentMetrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = [];
      }
      acc[metric.name].push(metric.value);
      return acc;
    }, {} as Record<string, number[]>);

    const stats = Object.entries(metricGroups).reduce((acc, [name, values]) => {
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      
      acc[name] = { avg, min, max, count: values.length };
      return acc;
    }, {} as Record<string, { avg: number; min: number; max: number; count: number }>);

    return {
      totalMetrics: this.metrics.length,
      recentMetrics: recentMetrics.length,
      totalAlerts: this.alerts.length,
      criticalAlerts: this.alerts.filter(a => a.type === 'critical').length,
      stats
    };
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

export const performanceService = new PerformanceMonitor();
