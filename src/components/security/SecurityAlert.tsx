
import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EnhancedSecurityService } from '@/services/EnhancedSecurityService';

interface SecurityAlertProps {
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  onDismiss?: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function SecurityAlert({ 
  type, 
  title, 
  message, 
  onDismiss, 
  autoClose = false, 
  duration = 5000 
}: SecurityAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onDismiss]);

  useEffect(() => {
    // Log security alert display
    EnhancedSecurityService.logSecurityEvent('SECURITY_ALERT_SHOWN', {
      type,
      title,
      message: message.substring(0, 100)
    });
  }, [type, title, message]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Shield className="h-4 w-4 text-blue-500" />;
    }
  };

  const getVariant = () => {
    switch (type) {
      case 'error':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <Alert variant={getVariant()} className="mb-4 border-l-4 border-l-current">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2">
          {getIcon()}
          <div>
            <AlertTitle className="font-semibold">{title}</AlertTitle>
            <AlertDescription className="mt-1">{message}</AlertDescription>
          </div>
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Alert>
  );
}
