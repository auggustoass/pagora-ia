
import { useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { EnhancedSecurityService } from '@/services/EnhancedSecurityService';

export function useSecurityMonitoring() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Monitor for suspicious activity patterns
    const monitorActivity = (action: string) => {
      EnhancedSecurityService.detectAnomalousActivity(user.id, action);
    };

    // Monitor page visibility changes (tab switching)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        EnhancedSecurityService.logSecurityEvent('TAB_HIDDEN', { userId: user.id });
      } else {
        EnhancedSecurityService.logSecurityEvent('TAB_VISIBLE', { userId: user.id });
      }
    };

    // Monitor for developer tools with throttling
    let devToolsCheckCount = 0;
    const maxDevToolsChecks = 10;
    
    const detectDevTools = () => {
      if (devToolsCheckCount >= maxDevToolsChecks) return;
      
      const threshold = 160;
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        EnhancedSecurityService.logSecurityEvent('DEV_TOOLS_DETECTED', { userId: user.id });
        devToolsCheckCount++;
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Check for dev tools with reduced frequency
    const devToolsInterval = setInterval(detectDevTools, 10000); // 10 seconds

    // Monitor common user actions with throttling
    let clickCount = 0;
    let keyCount = 0;
    
    const monitorClicks = () => {
      clickCount++;
      if (clickCount % 10 === 0) { // Log every 10th click
        monitorActivity('click');
      }
    };
    
    const monitorKeypress = () => {
      keyCount++;
      if (keyCount % 20 === 0) { // Log every 20th keypress
        monitorActivity('keypress');
      }
    };
    
    document.addEventListener('click', monitorClicks);
    document.addEventListener('keypress', monitorKeypress);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('click', monitorClicks);
      document.removeEventListener('keypress', monitorKeypress);
      clearInterval(devToolsInterval);
    };
  }, [user]);

  return {
    logSecurityEvent: EnhancedSecurityService.logSecurityEvent,
    validateInput: EnhancedSecurityService.validateSecureInput,
    checkRateLimit: EnhancedSecurityService.checkServerRateLimit
  };
}
