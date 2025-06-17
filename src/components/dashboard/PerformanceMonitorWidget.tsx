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
  return;
}