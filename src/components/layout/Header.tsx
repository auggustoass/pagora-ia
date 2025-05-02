
import React, { useEffect, useState } from 'react';
import { Bell, CreditCard, MessageSquare, Settings, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '../ui/badge';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';

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
        .maybeSingle();

      if (error) {
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
    
  const isDangerZone = daysLeftInTrial <= 3 && daysLeftInTrial > 0;
  const isExpired = daysLeftInTrial <= 0 && subscriptionStatus?.trial;

  return (
    <header className="px-6 py-4 flex items-center justify-between border-b border-white/5 backdrop-blur-md bg-black/5">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground">
          <Menu size={20} />
        </Button>
        
        <div className="relative w-64 hidden md:flex">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Pesquisar..."
            className="pl-9 bg-white/5 border-white/5 h-9"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        {user && subscriptionStatus && (
          <Link to="/configuracoes/assinatura">
            <Button 
              variant="outline" 
              size="sm"
              className={`
                flex flex-col items-center gap-1 border-white/10 h-auto py-1.5
                ${isExpired ? 'text-red-400 hover:text-red-300' : 
                  isDangerZone ? 'text-yellow-400 hover:text-yellow-300' :
                  subscriptionStatus.trial ? 'text-blue-400 hover:text-blue-300' : 
                  'text-green-400 hover:text-green-300'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <CreditCard size={16} />
                {subscriptionStatus.active ? (
                  subscriptionStatus.trial ? (
                    <>
                      Trial <Badge variant="outline" className={`ml-1 text-xs ${isDangerZone ? 'text-yellow-400 border-yellow-400' : isExpired ? 'text-red-400 border-red-400' : ''}`}>
                        {isExpired ? 'Expirado' : `${daysLeftInTrial} dias`}
                      </Badge>
                    </>
                  ) : (
                    'Ativo'
                  )
                ) : (
                  'Inativo'
                )}
              </div>
              
              {subscriptionStatus.trial && subscriptionStatus.trial_ends_at && daysLeftInTrial > 0 && (
                <div className="w-full mt-1">
                  <Progress 
                    value={Math.max(0, Math.min(100, ((30 - daysLeftInTrial) / 30) * 100))}
                    className={`h-1 ${isDangerZone ? "bg-yellow-400" : "bg-blue-400"}`}
                  />
                </div>
              )}
            </Button>
          </Link>
        )}
        
        <ThemeToggle />
        
        <div className="h-6 w-[1px] bg-white/5"></div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white relative bg-white/5 rounded-full h-9 w-9">
                <Bell size={18} />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-card border-white/10">
              <p>Notificações</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white bg-white/5 rounded-full h-9 w-9">
                <MessageSquare size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-card border-white/10">
              <p>Mensagens</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Link to="/configuracoes">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white bg-white/5 rounded-full h-9 w-9">
                  <Settings size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-card border-white/10">
                <p>Configurações</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Link>
      </div>
    </header>
  );
}
