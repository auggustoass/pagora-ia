
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle, Activity, Eye, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedSecurityService } from '@/services/EnhancedSecurityService';
import { toast } from 'sonner';

interface SecuritySettings {
  rateLimitEnabled: boolean;
  maxLoginAttempts: number;
  rateLimitWindow: number;
  sessionTimeout: number;
  auditLogging: boolean;
  suspiciousActivityDetection: boolean;
}

export function SecurityConfig() {
  const [settings, setSettings] = useState<SecuritySettings>({
    rateLimitEnabled: true,
    maxLoginAttempts: 3,
    rateLimitWindow: 15,
    sessionTimeout: 60,
    auditLogging: true,
    suspiciousActivityDetection: true
  });
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSecuritySettings();
    loadAuditLogs();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('id', 'security_config')
        .maybeSingle();

      if (data?.value) {
        setSettings({ ...settings, ...data.value });
      }
    } catch (error) {
      console.error('Error loading security settings:', error);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAuditLogs(data || []);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    }
  };

  const saveSecuritySettings = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          id: 'security_config',
          value: settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      await EnhancedSecurityService.logSecurityEvent('SECURITY_SETTINGS_UPDATED', settings);
      toast.success('Configurações de segurança salvas com sucesso');
    } catch (error) {
      console.error('Error saving security settings:', error);
      toast.error('Erro ao salvar configurações de segurança');
    } finally {
      setLoading(false);
    }
  };

  const formatEventType = (eventType: string) => {
    return eventType.replace(/_/g, ' ').toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const getEventIcon = (eventType: string) => {
    if (eventType.includes('SIGNIN') || eventType.includes('SIGNUP')) {
      return <Lock className="h-4 w-4 text-blue-500" />;
    }
    if (eventType.includes('FAILED') || eventType.includes('SUSPICIOUS')) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    return <Activity className="h-4 w-4 text-green-500" />;
  };

  const getEventBadge = (eventType: string) => {
    if (eventType.includes('FAILED') || eventType.includes('SUSPICIOUS')) {
      return <Badge variant="destructive">Atenção</Badge>;
    }
    if (eventType.includes('SUCCESS')) {
      return <Badge variant="default">Sucesso</Badge>;
    }
    return <Badge variant="secondary">Info</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Configurações de Segurança</h2>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
          <TabsTrigger value="audit">Logs de Auditoria</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Segurança</CardTitle>
              <CardDescription>
                Configure as políticas de segurança do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="rate-limit">Limite de Taxa</Label>
                    <Switch
                      id="rate-limit"
                      checked={settings.rateLimitEnabled}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, rateLimitEnabled: checked })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-attempts">Máximo de Tentativas de Login</Label>
                    <Input
                      id="max-attempts"
                      type="number"
                      value={settings.maxLoginAttempts}
                      onChange={(e) =>
                        setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })
                      }
                      min="1"
                      max="10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rate-window">Janela de Limite (minutos)</Label>
                    <Input
                      id="rate-window"
                      type="number"
                      value={settings.rateLimitWindow}
                      onChange={(e) =>
                        setSettings({ ...settings, rateLimitWindow: parseInt(e.target.value) })
                      }
                      min="5"
                      max="60"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Timeout de Sessão (minutos)</Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) =>
                        setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })
                      }
                      min="15"
                      max="480"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="audit-logging">Log de Auditoria</Label>
                    <Switch
                      id="audit-logging"
                      checked={settings.auditLogging}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, auditLogging: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="suspicious-detection">Detecção de Atividade Suspeita</Label>
                    <Switch
                      id="suspicious-detection"
                      checked={settings.suspiciousActivityDetection}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, suspiciousActivityDetection: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <Button onClick={saveSecuritySettings} disabled={loading} className="w-full">
                {loading ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Logs de Auditoria de Segurança
              </CardTitle>
              <CardDescription>
                Histórico de eventos de segurança do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.length > 0 ? (
                  auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getEventIcon(log.event_type)}
                        <div>
                          <div className="font-medium">
                            {formatEventType(log.event_type)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(log.created_at).toLocaleString('pt-BR')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getEventBadge(log.event_type)}
                        {log.ip_address && (
                          <Badge variant="outline">{log.ip_address}</Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum log de auditoria encontrado
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Monitoramento em Tempo Real
              </CardTitle>
              <CardDescription>
                Status atual da segurança do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Status do Sistema</div>
                  <div className="text-2xl font-bold text-green-600">Seguro</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Tentativas Bloqueadas (24h)</div>
                  <div className="text-2xl font-bold">
                    {auditLogs.filter(log => 
                      log.event_type.includes('FAILED') && 
                      new Date(log.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                    ).length}
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Atividade Suspeita</div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {auditLogs.filter(log => log.event_type.includes('SUSPICIOUS')).length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
