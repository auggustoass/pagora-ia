
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { ProgressCircle } from '@/components/ui/progress-circle';

const statusCardVariants = cva("glass-card p-5 flex transition-all duration-300 card-hover", {
  variants: {
    variant: {
      default: "border-white/5 bg-card/80",
      pending: "border-pagora-pending/30",
      success: "border-pagora-success/30",
      error: "border-pagora-error/30"
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
      <div className="flex flex-1">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              "icon-circle w-8 h-8 bg-white/5", 
              variant === "pending" && "bg-pagora-pending/10 text-pagora-pending", 
              variant === "success" && "bg-pagora-success/10 text-pagora-success", 
              variant === "error" && "bg-pagora-error/10 text-pagora-error"
            )}>
              {icon}
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          </div>
          
          <div className="space-y-1">
            <p className="font-bold text-2xl">{value}</p>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
        </div>
      
        {showProgress && (
          <div className="ml-auto">
            <ProgressCircle 
              value={progressValue} 
              max={100} 
              size={64} 
              strokeWidth={6} 
              color={getProgressColor()}
              className="ml-auto"
            >
              <span className="text-xs font-semibold">{progressValue}%</span>
            </ProgressCircle>
          </div>
        )}
      </div>
    </div>
  );
}
