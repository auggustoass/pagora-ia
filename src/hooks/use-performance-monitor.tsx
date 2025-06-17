
import { useState, useEffect, useCallback } from 'react';
import { performanceService } from '@/services/PerformanceService';
import { cacheService } from '@/services/CacheService';
import { realtimeService } from '@/services/RealtimeService';

export function usePerformanceMonitor() {
  const [stats, setStats] = useState(performanceService.getStats());
  const [cacheStats, setCacheStats] = useState(cacheService.getStats());
  const [realtimeStats, setRealtimeStats] = useState(realtimeService.getStats());

  const refreshStats = useCallback(() => {
    setStats(performanceService.getStats());
    setCacheStats(cacheService.getStats());
    setRealtimeStats(realtimeService.getStats());
    
    // Update memory usage
    performanceService.getMemoryUsage();
    
    // Record cache hit rate
    performanceService.recordMetric('cache_hit_rate', cacheStats.hitRate);
  }, [cacheStats.hitRate]);

  useEffect(() => {
    const interval = setInterval(refreshStats, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [refreshStats]);

  const getAlerts = useCallback(() => {
    return performanceService.getAlerts(10);
  }, []);

  const recordCustomMetric = useCallback((name: string, value: number, metadata?: Record<string, any>) => {
    performanceService.recordMetric(name, value, metadata);
  }, []);

  return {
    stats,
    cacheStats,
    realtimeStats,
    alerts: getAlerts(),
    recordMetric: recordCustomMetric,
    refreshStats
  };
}
