
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AdvancedSecurityService } from '@/services/AdvancedSecurityService';
import { useAuth } from '@/components/auth/AuthProvider';

interface SecurityContextType {
  securityScore: number;
  threats: SecurityThreat[];
  isMonitoring: boolean;
  logSecurityEvent: (eventType: string, details?: any, riskLevel?: 'low' | 'medium' | 'high' | 'critical') => Promise<void>;
  checkRateLimit: (identifier: string, action: string, maxAttempts?: number) => Promise<boolean>;
}

interface SecurityThreat {
  id: string;
  type: 'suspicious_activity' | 'rate_limit' | 'anomalous_behavior' | 'security_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [securityScore, setSecurityScore] = useState(100);
  const [threats, setThreats] = useState<SecurityThreat[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Initialize security monitoring
  useEffect(() => {
    if (user) {
      setIsMonitoring(true);
      initializeSecurityMonitoring();
    } else {
      setIsMonitoring(false);
      AdvancedSecurityService.cleanupSecurityArtifacts();
    }
  }, [user]);

  const initializeSecurityMonitoring = async () => {
    if (!user) return;

    // Check for suspicious login patterns
    const isSuspicious = await AdvancedSecurityService.detectSuspiciousLoginPattern(user.id);
    if (isSuspicious) {
      addThreat({
        type: 'suspicious_activity',
        severity: 'high',
        message: 'Padrão de login suspeito detectado',
      });
    }

    // Log session start
    await AdvancedSecurityService.logSecurityEventEnhanced(
      'SESSION_STARTED',
      { userAgent: navigator.userAgent },
      user.id,
      'low'
    );
  };

  const addThreat = (threat: Omit<SecurityThreat, 'id' | 'timestamp' | 'resolved'>) => {
    const newThreat: SecurityThreat = {
      ...threat,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      resolved: false,
    };

    setThreats(prev => [newThreat, ...prev.slice(0, 9)]); // Keep last 10 threats

    // Update security score based on threat severity
    const scoreReduction = {
      low: 5,
      medium: 15,
      high: 30,
      critical: 50
    }[threat.severity];

    setSecurityScore(prev => Math.max(0, prev - scoreReduction));
  };

  const logSecurityEvent = async (
    eventType: string, 
    details?: any, 
    riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
  ) => {
    await AdvancedSecurityService.logSecurityEventEnhanced(
      eventType,
      details,
      user?.id,
      riskLevel
    );
  };

  const checkRateLimit = async (
    identifier: string, 
    action: string, 
    maxAttempts: number = 10
  ): Promise<boolean> => {
    const result = await AdvancedSecurityService.checkAdvancedRateLimit(
      identifier,
      action,
      user?.id,
      maxAttempts
    );

    if (!result.allowed) {
      addThreat({
        type: 'rate_limit',
        severity: result.blocked ? 'high' : 'medium',
        message: `Rate limit excedido para ação: ${action}`,
      });
    }

    return result.allowed;
  };

  // Gradual security score recovery
  useEffect(() => {
    const recovery = setInterval(() => {
      setSecurityScore(prev => Math.min(100, prev + 1));
    }, 60000); // Recover 1 point per minute

    return () => clearInterval(recovery);
  }, []);

  const value: SecurityContextType = {
    securityScore,
    threats,
    isMonitoring,
    logSecurityEvent,
    checkRateLimit,
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}
