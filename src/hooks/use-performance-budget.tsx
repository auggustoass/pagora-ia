
import { useEffect, useState } from 'react';
import { performanceService } from '@/services/PerformanceService';

interface PerformanceBudget {
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
}

const DEFAULT_BUDGET: PerformanceBudget = {
  firstContentfulPaint: 1800, // 1.8s
  largestContentfulPaint: 2500, // 2.5s
  cumulativeLayoutShift: 0.1,
  firstInputDelay: 100, // 100ms
  timeToInteractive: 3800 // 3.8s
};

export function usePerformanceBudget(customBudget?: Partial<PerformanceBudget>) {
  const [budget] = useState({ ...DEFAULT_BUDGET, ...customBudget });
  const [violations, setViolations] = useState<string[]>([]);
  const [score, setScore] = useState(100);

  useEffect(() => {
    const checkBudget = () => {
      const stats = performanceService.getStats();
      const newViolations: string[] = [];
      let currentScore = 100;

      // Check each budget item
      Object.entries(budget).forEach(([metric, limit]) => {
        const currentValue = stats.stats[metric]?.avg;
        if (currentValue && currentValue > limit) {
          newViolations.push(`${metric}: ${currentValue.toFixed(2)} > ${limit}`);
          currentScore -= 10;
        }
      });

      setViolations(newViolations);
      setScore(Math.max(0, currentScore));

      // Log violations
      if (newViolations.length > 0) {
        console.warn('Performance Budget Violations:', newViolations);
        performanceService.recordMetric('performance_budget_violations', newViolations.length);
      }
    };

    const interval = setInterval(checkBudget, 10000); // Check every 10 seconds
    checkBudget(); // Initial check

    return () => clearInterval(interval);
  }, [budget]);

  return {
    budget,
    violations,
    score,
    isWithinBudget: violations.length === 0
  };
}
