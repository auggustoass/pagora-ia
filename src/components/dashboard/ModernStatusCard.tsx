
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

const statusCardVariants = cva(
  "group relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-white/10 hover:border-white/20",
        success: "bg-gradient-to-br from-green-900/30 to-emerald-800/20 border-green-500/20 hover:border-green-400/30",
        pending: "bg-gradient-to-br from-gray-800/30 to-gray-700/20 border-gray-500/20 hover:border-gray-400/30",
        info: "bg-gradient-to-br from-green-900/30 to-emerald-800/20 border-green-500/20 hover:border-green-400/30",
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

interface ModernStatusCardProps extends VariantProps<typeof statusCardVariants> {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function ModernStatusCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  variant,
  className
}: ModernStatusCardProps) {
  const getIconColor = () => {
    switch (variant) {
      case "success": return "text-green-400";
      case "pending": return "text-gray-400";
      case "info": return "text-green-400";
      default: return "text-gray-300";
    }
  };

  const getTrendColor = () => {
    if (!trend) return "";
    return trend.isPositive ? "text-green-400" : "text-gray-400";
  };

  return (
    <div className={cn(statusCardVariants({ variant }), className)}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("p-3 rounded-xl bg-white/5 backdrop-blur-sm", getIconColor())}>
            <Icon className="w-5 h-5" />
          </div>
          {trend && (
            <div className={cn("text-xs font-medium", getTrendColor())}>
              {trend.isPositive ? "+" : ""}{trend.value}%
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
            {title}
          </h3>
          <p className="text-2xl font-bold text-white">
            {value}
          </p>
          {description && (
            <p className="text-xs text-gray-500">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
