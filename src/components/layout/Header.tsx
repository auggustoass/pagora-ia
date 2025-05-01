
import React, { useEffect, useState } from 'react';
import { Bell, CreditCard, MessageSquare, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '../ui/badge';
import { Link } from 'react-router-dom';

interface SubscriptionStatus {
  active: boolean;
  status: string;
  trial: boolean;
  trial_ends_at: string | null;
}

export function Header() {
  const { user } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);

  useEffect(() => {
    if (user) {
      fetchSubscriptionStatus();
    }
  }, [user]);

  async function fetchSubscriptionStatus() {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('status, trial_ends_at')
        .eq('user_id', user!.id)
        .in('status', ['active', 'trial'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription status:', error);
        return;
      }

      if (data) {
        setSubscriptionStatus({
          active: true,
          status: data.status,
          trial: data.status === 'trial',
          trial_ends_at: data.trial_ends_at,
        });
      } else {
        setSubscriptionStatus({
          active: false,
          status: 'inactive',
          trial: false,
          trial_ends_at: null,
        });
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    }
  }

  const daysLeftInTrial = subscriptionStatus?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(subscriptionStatus.trial_ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  return <header className="px-6 py-5 flex items-center justify-between border-b border-white/10 dark:border-white/10 border-gray-200 backdrop-blur-md bg-black/10">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-white dark:text-white flex items-center">
          <span className="text-gradient text-glow text-2xl mr-2">HBLACKPIX</span>
          <span className="text-sm text-muted-foreground">Assistente de Cobrança Inteligente</span>
        </h1>
      </div>
      <div className="flex items-center space-x-3">
        {user && subscriptionStatus && (
          <Link to="/configuracoes/assinatura">
            <Button 
              variant="outline" 
              size="sm"
              className={`
                flex items-center gap-2 border-white/10 
                ${subscriptionStatus.trial ? 'text-blue-400 hover:text-blue-300' : 'text-green-400 hover:text-green-300'}
              `}
            >
              <CreditCard size={16} />
              {subscriptionStatus.active ? (
                subscriptionStatus.trial ? (
                  <>
                    Trial <Badge variant="outline" className="ml-1 text-xs">
                      {daysLeftInTrial} dias
                    </Badge>
                  </>
                ) : (
                  'Ativo'
                )
              ) : (
                'Inativo'
              )}
            </Button>
          </Link>
        )}
        
        <ThemeToggle />
        
        <div className="h-6 w-[1px] bg-white/10"></div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-pagora-purple rounded-full"></span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-pagora-dark border-white/10">
              <p>Notificações</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                <MessageSquare size={20} />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-pagora-dark border-white/10">
              <p>Mensagens</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                <Settings size={20} />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-pagora-dark border-white/10">
              <p>Configurações</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>;
}
