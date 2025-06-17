
import { useState, useEffect, useCallback } from 'react';

interface OfflineAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load pending actions from localStorage
    const saved = localStorage.getItem('offline-pending-actions');
    if (saved) {
      try {
        setPendingActions(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load pending actions:', error);
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const queueAction = useCallback((type: string, data: any) => {
    const action: OfflineAction = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0
    };

    setPendingActions(prev => {
      const updated = [...prev, action];
      localStorage.setItem('offline-pending-actions', JSON.stringify(updated));
      return updated;
    });

    return action.id;
  }, []);

  const syncPendingActions = useCallback(async (syncHandlers: Record<string, (data: any) => Promise<boolean>>) => {
    if (!isOnline || pendingActions.length === 0) return;

    const successful: string[] = [];
    const failed: OfflineAction[] = [];

    for (const action of pendingActions) {
      try {
        const handler = syncHandlers[action.type];
        if (handler) {
          const success = await handler(action.data);
          if (success) {
            successful.push(action.id);
          } else {
            failed.push({ ...action, retryCount: action.retryCount + 1 });
          }
        }
      } catch (error) {
        console.error(`Failed to sync action ${action.id}:`, error);
        failed.push({ ...action, retryCount: action.retryCount + 1 });
      }
    }

    // Update pending actions
    const remaining = failed.filter(action => action.retryCount < 3);
    setPendingActions(remaining);
    localStorage.setItem('offline-pending-actions', JSON.stringify(remaining));

    return { successful: successful.length, failed: failed.length };
  }, [isOnline, pendingActions]);

  const clearPendingActions = useCallback(() => {
    setPendingActions([]);
    localStorage.removeItem('offline-pending-actions');
  }, []);

  return {
    isOnline,
    pendingActions,
    queueAction,
    syncPendingActions,
    clearPendingActions
  };
}
