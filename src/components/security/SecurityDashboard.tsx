
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Activity, Eye, Lock, Zap } from 'lucide-react';
import { useSecurity } from './SecurityProvider';

export function SecurityDashboard() {
  const { securityScore, threats, isMonitoring } = useSecurity();

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    if (score >= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excelente';
    if (score >= 70) return 'Bom';
    if (score >= 50) return 'Regular';
    return 'Crítico';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Eye className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'secondary',
      low: 'outline'
    } as const;

    return (
      <Badge variant={variants[severity as keyof typeof variants] || 'outline'}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Security Score Card */}
      <Card className="bg-black border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <Shield className="h-5 w-5" />
            Security Score
          </CardTitle>
          <CardDescription className="text-gray-400">
            Pontuação geral de segurança do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`text-3xl font-bold ${getScoreColor(securityScore)}`}>
                {securityScore}
              </div>
              <div className="text-sm text-gray-400">
                / 100
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-400 border-green-500/30">
                {getScoreLabel(securityScore)}
              </Badge>
              {isMonitoring && (
                <div className="flex items-center gap-1 text-xs text-green-400">
                  <Zap className="w-3 h-3" />
                  MONITORANDO
                </div>
              )}
            </div>
          </div>
          <Progress 
            value={securityScore} 
            className="h-2 bg-gray-800"
          />
          <p className="text-xs text-gray-500 mt-2 font-mono">
            // Sistema de monitoramento ativo
          </p>
        </CardContent>
      </Card>

      {/* Threats Monitor */}
      <Card className="bg-black border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <AlertTriangle className="h-5 w-5" />
            Ameaças Detectadas
          </CardTitle>
          <CardDescription className="text-gray-400">
            Últimas atividades suspeitas identificadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {threats.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500/10 rounded-lg flex items-center justify-center border border-green-500/20">
                <Shield className="w-8 h-8 text-green-400/60" />
              </div>
              <h3 className="text-sm font-mono font-bold text-green-400 tracking-wider uppercase mb-2">
                SISTEMA_SEGURO
              </h3>
              <p className="text-xs text-gray-500 font-mono tracking-wide">
                // Nenhuma ameaça detectada<br/>
                // Monitoramento_ativo
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {threats.slice(0, 5).map((threat) => (
                <Alert key={threat.id} className="bg-gray-900/50 border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(threat.severity)}
                      <div>
                        <p className="text-sm font-medium text-white">
                          {threat.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {threat.timestamp.toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    {getSeverityBadge(threat.severity)}
                  </div>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Features Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-black border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-4 w-4 text-green-400" />
              <span className="text-sm font-mono text-green-400">RLS_ENABLED</span>
            </div>
            <div className="text-xs text-gray-400">
              Row Level Security ativo
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-green-400" />
              <span className="text-sm font-mono text-green-400">RATE_LIMITING</span>
            </div>
            <div className="text-xs text-gray-400">
              Limitação de taxa ativa
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-green-400" />
              <span className="text-sm font-mono text-green-400">AUDIT_LOGGING</span>
            </div>
            <div className="text-xs text-gray-400">
              Auditoria completa ativa
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
