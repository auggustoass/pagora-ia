
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

const Configuracoes = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">Personalize sua experiência no PAGORA.</p>
        </div>
        
        <div className="glass-card p-6 space-y-6">
          <div>
            <h2 className="text-lg font-medium mb-4">Aparência</h2>
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-mode">Modo escuro / claro</Label>
              <ThemeToggle />
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-medium mb-4">Notificações</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications">Notificações por e-mail</Label>
                <Switch id="email-notifications" />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="whatsapp-notifications">Notificações por WhatsApp</Label>
                <Switch id="whatsapp-notifications" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Configuracoes;
