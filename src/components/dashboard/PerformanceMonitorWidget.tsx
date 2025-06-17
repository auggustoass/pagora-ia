
import React from 'react';
import { usePerformanceMonitor } from '@/hooks/use-performance-monitor';
import { usePerformanceBudget } from '@/hooks/use-performance-budget';
import { Activity, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

export function PerformanceMonitorWidget() {
  const {
    stats,
    cacheStats
  } = usePerformanceMonitor();
  const {
    score,
    violations,
    isWithinBudget
  } = usePerformanceBudget();
  
  return (
    <div className="bg-black/50 border border-green-400/20 rounded-lg p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-4 h-4 text-green-400" />
        <h3 className="text-sm font-mono text-green-400">PERFORMANCE_MONITOR</h3>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400 font-mono">SCORE</span>
          <div className="flex items-center gap-1">
            {isWithinBudget ? (
              <CheckCircle className="w-3 h-3 text-green-400" />
            ) : (
              <AlertTriangle className="w-3 h-3 text-yellow-400" />
            )}
            <span className="text-xs font-mono text-white">{score}%</span>
          </div>
        </div>
        
        {violations.length > 0 && (
          <div className="text-xs text-yellow-400 font-mono">
            {violations.length} violations detected
          </div>
        )}
        
        {cacheStats && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400 font-mono">CACHE_HIT</span>
            <span className="text-xs font-mono text-green-400">
              {((cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
