
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { ProgressCircle } from '@/components/ui/progress-circle';

const statusCardVariants = cva("glass-card p-5 flex transition-all duration-300 card-hover h-full", {
  variants: {
    variant: {
      default: "border-border bg-card/80",
      pending: "border-l-4 border-l-warning border-border",
      success: "border-l-4 border-l-success border-border",
      error: "border-l-4 border-l-error border-border"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});

export interface StatusCardProps extends VariantProps<typeof statusCardVariants> {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  className?: string;
  style?: React.CSSProperties;
  showProgress?: boolean;
  progressValue?: number;
  progressColor?: string;
}

export function StatusCard({
  title,
  value,
  icon,
  description,
  variant,
  className,
  style,
  showProgress = false,
  progressValue = 0,
  progressColor
}: StatusCardProps) {
  // Determine color based on variant
  const getProgressColor = () => {
    if (progressColor) return progressColor;
    
    switch (variant) {
      case "pending": return "stroke-warning";
      case "success": return "stroke-success";
      case "error": return "stroke-error";
      default: return "stroke-primary";
    }
  };

  return (
    <div className={cn(statusCardVariants({
      variant,
      className
    }))} style={style}>
      <div className="flex flex-1 items-center">
        {showProgress ? (
          <div className="mr-4">
            <ProgressCircle 
              value={progressValue} 
              max={100} 
              size={64} 
              strokeWidth={4} 
              color={getProgressColor()}
            >
              <div className={cn(
                "flex flex-col items-center justify-center",
                variant === "pending" && "text-warning",
                variant === "success" && "text-success", 
                variant === "error" && "text-error",
                (!variant || variant === "default") && "text-primary"
              )}>
                {icon}
              </div>
            </ProgressCircle>
          </div>
        ) : (
          <div className={cn(
            "icon-circle w-10 h-10 bg-secondary/50 mr-4", 
            variant === "pending" && "bg-warning/10 text-warning", 
            variant === "success" && "bg-success/10 text-success", 
            variant === "error" && "bg-error/10 text-error",
            (!variant || variant === "default") && "text-primary"
          )}>
            {icon}
          </div>
        )}

        <div className="space-y-1">
          <h3 className="status-card-title">{title}</h3>
          <p className="status-card-value">{value}</p>
          {description && <p className="status-card-description">{description}</p>}
        </div>
      </div>
    </div>
  );
}
