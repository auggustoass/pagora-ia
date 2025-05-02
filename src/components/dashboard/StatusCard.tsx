
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { ProgressCircle } from '@/components/ui/progress-circle';

const statusCardVariants = cva("glass-card p-5 flex transition-all duration-300 card-hover h-full", {
  variants: {
    variant: {
      default: "border-white/5 bg-card/80",
      pending: "border-l-4 border-l-pagora-pending border-white/5",
      success: "border-l-4 border-l-pagora-success border-white/5",
      error: "border-l-4 border-l-pagora-error border-white/5"
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
      case "pending": return "stroke-pagora-pending";
      case "success": return "stroke-pagora-success";
      case "error": return "stroke-pagora-error";
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
                variant === "pending" && "text-pagora-pending",
                variant === "success" && "text-pagora-success", 
                variant === "error" && "text-pagora-error",
                (!variant || variant === "default") && "text-primary"
              )}>
                {icon}
              </div>
            </ProgressCircle>
          </div>
        ) : (
          <div className={cn(
            "icon-circle w-10 h-10 bg-secondary/50 mr-4", 
            variant === "pending" && "bg-pagora-pending/10 text-pagora-pending", 
            variant === "success" && "bg-pagora-success/10 text-pagora-success", 
            variant === "error" && "bg-pagora-error/10 text-pagora-error",
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
