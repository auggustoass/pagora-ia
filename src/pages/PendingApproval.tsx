
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Mail } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

const PendingApproval = () => {
  const { signOut } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-background bg-grid">
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full filter blur-[120px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-accent/5 rounded-full filter blur-[120px]" />
      </div>
      <div className="w-full max-w-md z-10">
        <Card className="w-full bg-card/60 backdrop-blur-md border-border rounded-2xl shadow-xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pagora-green via-pagora-darkGreen to-transparent"></div>
          
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl font-bold">
              <span className="text-gradient text-glow">Aguardando Aprovação</span>
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Sua conta foi criada com sucesso e está sendo analisada pela nossa equipe
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-800">O que acontece agora?</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Um administrador irá revisar sua conta em breve. Você receberá um email quando sua conta for aprovada.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              <p>Tempo médio de aprovação: 24-48 horas</p>
            </div>
            
            <Button 
              onClick={signOut}
              variant="outline" 
              className="w-full"
            >
              Sair
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PendingApproval;
