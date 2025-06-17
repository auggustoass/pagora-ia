
import React from 'react';
import { usePerformanceMonitor } from '@/hooks/use-performance-monitor';
import { usePerformanceBudget } from '@/hooks/use-performance-budget';
import { Activity, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

export function PerformanceMonitorWidget() {
  const { stats, cacheStats } = usePerformanceMonitor();
  const { score, violations, isWithinBudget } = usePerformanceBudget();

  return (
    <div className="bg-gray-900/50 border border-green-500/20 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2 text-green-400 font-mono text-sm">
        <Activity className="w-4 h-4" />
        PERFORMANCE_MONITOR
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-xs text-gray-400 uppercase tracking-wider">
            Performance Score
          </div>
          <div className={`text-lg font-mono ${
            score >= 90 ? 'text-green-400' : 
            score >= 70 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {score}/100
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-xs text-gray-400 uppercase tracking-wider">
            Cache Hit Rate
          </div>
          <div className="text-lg font-mono text-blue-400">
            {cacheStats.hitRate.toFixed(1)}%
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-xs">
        {isWithinBudget ? (
          <>
            <CheckCircle className="w-3 h-3 text-green-400" />
            <span className="text-green-400">Within Budget</span>
          </>
        ) : (
          <>
            <AlertTriangle className="w-3 h-3 text-yellow-400" />
            <span className="text-yellow-400">{violations.length} Budget Violations</span>
          </>
        )}
      </div>
      
      <div className="text-xs text-gray-500 space-y-1">
        <div>API Calls: {stats.stats.api_response_time?.count || 0}</div>
        <div>Cache Size: {cacheStats.size} items</div>
        <div>Memory: {stats.stats.memory_usage?.avg?.toFixed(1) || 0}%</div>
      </div>
    </div>
  );
}
