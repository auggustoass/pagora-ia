
import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressCircleProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  valueClassName?: string;
  children?: React.ReactNode;
  showAnimation?: boolean;
  color?: string;
}

export const ProgressCircle = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 6,
  className,
  valueClassName,
  children,
  showAnimation = true,
  color = "stroke-primary"
}: ProgressCircleProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(Math.max(value, 0), max);
  const progressPercentage = (progress / max) * 100;
  const dashoffset = circumference - (circumference * progressPercentage) / 100;

  return (
    <div className={cn("progress-circle", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-white/5 fill-none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={cn(
            "fill-none", 
            color,
            showAnimation && "transition-[stroke-dashoffset] duration-1000 ease-in-out"
          )}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: dashoffset
          }}
        />
      </svg>
      <div className={cn("progress-value text-center", valueClassName)}>
        {children || (
          <div className="flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">{Math.round(progressPercentage)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};
