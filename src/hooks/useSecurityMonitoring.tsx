
import { useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { EnhancedSecurityService } from '@/services/EnhancedSecurityService';

export function useSecurityMonitoring() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Monitor for suspicious activity patterns with throttling
    const monitorActivity = (action: string) => {
      // Rate limit activity monitoring
      const lastCheck = localStorage.getItem(`last_monitor_${action}`);
      const now = Date.now();
      
      if (lastCheck && now - parseInt(lastCheck) < 5000) {
        return; // Don't monitor more than once every 5 seconds per action
      }
      
      localStorage.setItem(`last_monitor_${action}`, now.toString());
      EnhancedSecurityService.detectAnomalousActivity(user.id, action);
    };

    // Monitor page visibility changes (tab switching) with throttling
    let lastVisibilityChange = 0;
    const handleVisibilityChange = () => {
      const now = Date.now();
      if (now - lastVisibilityChange < 1000) return; // Throttle to 1 second
      
      lastVisibilityChange = now;
      if (document.hidden) {
        EnhancedSecurityService.logSecurityEvent('TAB_HIDDEN', { userId: user.id });
      } else {
        EnhancedSecurityService.logSecurityEvent('TAB_VISIBLE', { userId: user.id });
      }
    };

    // Monitor for developer tools with reduced frequency and limit
    let devToolsCheckCount = 0;
    const maxDevToolsChecks = 5; // Reduced from 10
    
    const detectDevTools = () => {
      if (devToolsCheckCount >= maxDevToolsChecks) return;
      
      try {
        const threshold = 160;
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
          EnhancedSecurityService.logSecurityEvent('DEV_TOOLS_DETECTED', { userId: user.id });
          devToolsCheckCount++;
        }
      } catch (error) {
        // Ignore errors in dev tools detection
      }
    };

    // Add event listeners with error handling
    try {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    } catch (error) {
      console.error('Failed to add visibility change listener:', error);
    }
    
    // Check for dev tools with reduced frequency (30 seconds instead of 10)
    const devToolsInterval = setInterval(detectDevTools, 30000);

    // Monitor common user actions with more aggressive throttling
    let clickCount = 0;
    let keyCount = 0;
    
    const monitorClicks = () => {
      clickCount++;
      if (clickCount % 25 === 0) { // Increased from 10 to 25
        monitorActivity('click');
      }
    };
    
    const monitorKeypress = () => {
      keyCount++;
      if (keyCount % 50 === 0) { // Increased from 20 to 50
        monitorActivity('keypress');
      }
    };
    
    try {
      document.addEventListener('click', monitorClicks, { passive: true });
      document.addEventListener('keypress', monitorKeypress, { passive: true });
    } catch (error) {
      console.error('Failed to add user action listeners:', error);
    }

    // Cleanup function
    return () => {
      try {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('click', monitorClicks);
        document.removeEventListener('keypress', monitorKeypress);
        clearInterval(devToolsInterval);
      } catch (error) {
        console.error('Error during security monitoring cleanup:', error);
      }
    };
  }, [user]);

  return {
    logSecurityEvent: EnhancedSecurityService.logSecurityEvent,
    validateInput: EnhancedSecurityService.validateSecureInput,
    checkRateLimit: EnhancedSecurityService.checkServerRateLimit
  };
}
