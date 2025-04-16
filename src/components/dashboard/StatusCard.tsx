import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
const statusCardVariants = cva("glass-card p-6 flex flex-col space-y-3 transition-all duration-200 hover:shadow-lg", {
  variants: {
    variant: {
      default: "border-white/10",
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
}
export function StatusCard({
  title,
  value,
  icon,
  description,
  variant,
  className
}: StatusCardProps) {
  return <div className={cn(statusCardVariants({
    variant,
    className
  }))}>
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="text-muted-foreground">
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <p className="font-bold text-sm">{value}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
    </div>;
}