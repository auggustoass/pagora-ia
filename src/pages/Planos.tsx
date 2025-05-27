
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Users, CreditCard, FileText } from 'lucide-react';

const Planos = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Como Funciona</h1>
          <p className="text-muted-foreground">
            Nosso sistema foi simplificado para oferecer maior flexibilidade. 
            Veja como começar a usar a plataforma.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">1. Cadastro</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Crie sua conta na plataforma preenchendo suas informações básicas.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="relative">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <CardTitle className="text-lg">2. Aprovação</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Nossa equipe analisará e aprovará sua conta em até 24-48 horas.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="relative">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">3. Créditos</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Solicite créditos conforme sua necessidade. Nossa equipe adicionará manualmente.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="relative">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">4. Começar</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Cadastre seus clientes e comece a criar faturas usando seus créditos.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Modelo Flexível de Créditos</CardTitle>
            <CardDescription>
              Adaptamos nosso sistema para oferecer maior flexibilidade no uso da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Como Funciona:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Créditos são adicionados manualmente pela nossa equipe</li>
                  <li>• Cada fatura criada consome créditos do seu saldo</li>
                  <li>• Você pode solicitar mais créditos a qualquer momento</li>
                  <li>• Modelo pay-as-you-use mais justo e flexível</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Vantagens:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Pague apenas pelo que usar</li>
                  <li>• Sem mensalidades fixas</li>
                  <li>• Controle total sobre gastos</li>
                  <li>• Suporte personalizado para cada cliente</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Planos;
