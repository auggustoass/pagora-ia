
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const statusCardVariants = cva("glass-card p-6 flex flex-col space-y-3 transition-all duration-300 hover:transform hover:-translate-y-1", {
  variants: {
    variant: {
      default: "border-white/10 bg-gradient-to-br from-black/40 to-black/10",
      pending: "border-pagora-pending/30 bg-gradient-to-br from-pagora-pending/10 to-black/20",
      success: "border-pagora-success/30 bg-gradient-to-br from-pagora-success/10 to-black/20",
      error: "border-pagora-error/30 bg-gradient-to-br from-pagora-error/10 to-black/20"
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
}

export function StatusCard({
  title,
  value,
  icon,
  description,
  variant,
  className,
  style
}: StatusCardProps) {
  return (
    <div className={cn(statusCardVariants({
      variant,
      className
    }))} style={style}>
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="p-2 rounded-full bg-white/5 text-muted-foreground">
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <p className="font-bold text-2xl">{value}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}
