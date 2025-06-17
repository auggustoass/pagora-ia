
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
    <div className="bg-gray-900/50 border border-green-500/20 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-green-400" />
        <h3 className="text-green-400 font-mono text-sm uppercase tracking-wider">
          Performance Monitor
        </h3>
      </div>
      
      <div className="space-y-3">
        {/* Performance Score */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm font-mono">Score</span>
          <div className="flex items-center gap-2">
            {isWithinBudget ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
            )}
            <span className={`font-mono text-sm ${
              score >= 90 ? 'text-green-400' : 
              score >= 70 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {score}
            </span>
          </div>
        </div>

        {/* Cache Stats */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm font-mono">Cache Hit</span>
          <span className="text-green-400 font-mono text-sm">
            {cacheStats.hitRate.toFixed(1)}%
          </span>
        </div>

        {/* Memory Usage */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm font-mono">Memory</span>
          <span className="text-blue-400 font-mono text-sm">
            {stats.recentMetrics} metrics
          </span>
        </div>

        {/* Violations */}
        {violations.length > 0 && (
          <div className="mt-3 p-2 bg-yellow-400/10 border border-yellow-400/20 rounded">
            <div className="flex items-center gap-1 mb-1">
              <AlertTriangle className="w-3 h-3 text-yellow-400" />
              <span className="text-yellow-400 text-xs font-mono">
                {violations.length} violations
              </span>
            </div>
            <div className="text-gray-400 text-xs font-mono">
              Budget exceeded
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 mt-3">
          <button className="flex-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded px-2 py-1 text-green-400 text-xs font-mono transition-colors">
            <Zap className="w-3 h-3 inline mr-1" />
            Optimize
          </button>
        </div>
      </div>
    </div>
  );
}
