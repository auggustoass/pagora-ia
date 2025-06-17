
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

const cyberCardVariants = cva(
  "group relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl cyber-card",
  {
    variants: {
      variant: {
        default: "bg-black border border-green-500/20 hover:border-green-400/40 hover:shadow-green-400/20",
        success: "bg-black border border-green-500/30 hover:border-green-400/50 hover:shadow-green-400/30",
        pending: "bg-black border border-gray-500/30 hover:border-gray-400/50 hover:shadow-gray-400/20",
        info: "bg-black border border-green-500/30 hover:border-green-400/50 hover:shadow-green-400/30",
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

interface CyberStatusCardProps extends VariantProps<typeof cyberCardVariants> {
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

export function CyberStatusCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  variant,
  className
}: CyberStatusCardProps) {
  const getIconColor = () => {
    switch (variant) {
      case "success": return "text-green-400";
      case "pending": return "text-gray-400";
      case "info": return "text-green-400";
      default: return "text-white";
    }
  };

  const getGlowColor = () => {
    switch (variant) {
      case "success": return "shadow-green-400/50";
      case "pending": return "shadow-gray-400/30";
      case "info": return "shadow-green-400/50";
      default: return "shadow-white/30";
    }
  };

  const getTrendColor = () => {
    if (!trend) return "";
    return trend.isPositive ? "text-green-400" : "text-gray-400";
  };

  return (
    <div className={cn(cyberCardVariants({ variant }), className)}>
      {/* Hexagonal clip effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Scan line effect */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-green-400/50 to-transparent animate-pulse"></div>
      
      {/* Glow border effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-400/0 via-green-400/20 to-green-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
      
      <div className="relative p-6 bg-black/90 backdrop-blur-sm rounded-lg">
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            "relative p-3 rounded-lg bg-black border transition-all duration-300 group-hover:scale-110",
            variant === "success" && "border-green-500/30 bg-green-500/5",
            variant === "pending" && "border-gray-500/30 bg-gray-500/5",
            variant === "info" && "border-green-500/30 bg-green-500/5",
            variant === "default" && "border-white/20 bg-white/5"
          )}>
            <Icon className={cn("w-6 h-6 transition-all duration-300", getIconColor())} />
            
            {/* Icon glow effect */}
            <div className={cn(
              "absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md",
              getGlowColor()
            )}></div>
          </div>
          
          {trend && (
            <div className={cn(
              "text-xs font-mono font-bold tracking-wider px-2 py-1 rounded border bg-black/50",
              getTrendColor(),
              trend.isPositive ? "border-green-500/30" : "border-gray-500/30"
            )}>
              {trend.isPositive ? "+" : ""}{trend.value}%
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">
            {title}
          </h3>
          <p className="text-3xl font-mono font-bold text-white tracking-tight group-hover:text-green-400 transition-colors duration-300">
            {value}
          </p>
          {description && (
            <p className="text-xs text-gray-500 font-mono tracking-wide">
              {description}
            </p>
          )}
        </div>
        
        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-green-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
    </div>
  );
}
