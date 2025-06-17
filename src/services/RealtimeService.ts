
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface SubscriptionConfig {
  throttleMs: number;
  reconnectDelay: number;
  maxReconnectAttempts: number;
}

class RealtimeManager {
  private channels = new Map<string, RealtimeChannel>();
  private subscriptions = new Map<string, any>();
  private reconnectAttempts = new Map<string, number>();
  private config: SubscriptionConfig;

  constructor(config: Partial<SubscriptionConfig> = {}) {
    this.config = {
      throttleMs: 100,
      reconnectDelay: 1000,
      maxReconnectAttempts: 5,
      ...config
    };
  }

  subscribe(
    channelName: string,
    table: string,
    callback: (payload: any) => void,
    filters?: { event?: string; filter?: string }
  ) {
    // Cancel existing subscription
    this.unsubscribe(channelName);

    const throttledCallback = this.throttle(callback, this.config.throttleMs);
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: filters?.event || '*',
          schema: 'public',
          table,
          filter: filters?.filter
        },
        throttledCallback
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Realtime subscription active: ${channelName}`);
          this.reconnectAttempts.set(channelName, 0);
        } else if (status === 'CHANNEL_ERROR') {
          this.handleReconnect(channelName, table, callback, filters);
        }
      });

    this.channels.set(channelName, channel);
    this.subscriptions.set(channelName, { table, callback, filters });

    return channel;
  }

  unsubscribe(channelName: string) {
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
      this.subscriptions.delete(channelName);
      this.reconnectAttempts.delete(channelName);
    }
  }

  unsubscribeAll() {
    this.channels.forEach((_, channelName) => {
      this.unsubscribe(channelName);
    });
  }

  private handleReconnect(
    channelName: string,
    table: string,
    callback: (payload: any) => void,
    filters?: { event?: string; filter?: string }
  ) {
    const attempts = this.reconnectAttempts.get(channelName) || 0;
    
    if (attempts < this.config.maxReconnectAttempts) {
      const delay = this.config.reconnectDelay * Math.pow(2, attempts);
      
      setTimeout(() => {
        console.log(`Reconnecting ${channelName}, attempt ${attempts + 1}`);
        this.reconnectAttempts.set(channelName, attempts + 1);
        this.subscribe(channelName, table, callback, filters);
      }, delay);
    } else {
      console.error(`Max reconnection attempts reached for ${channelName}`);
    }
  }

  private throttle<T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): T {
    let timeoutId: NodeJS.Timeout | null = null;
    let lastExecTime = 0;
    
    return ((...args: any[]) => {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func(...args);
        lastExecTime = currentTime;
      } else {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func(...args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    }) as T;
  }

  getStats() {
    return {
      activeChannels: this.channels.size,
      subscriptions: Array.from(this.subscriptions.keys())
    };
  }
}

export const realtimeService = new RealtimeManager({
  throttleMs: 150,
  reconnectDelay: 1000,
  maxReconnectAttempts: 3
});
