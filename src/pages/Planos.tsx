
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Users, CreditCard, FileText, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Planos = () => {
  const handleWhatsAppContact = () => {
    const message = encodeURIComponent('Olá! Gostaria de solicitar mais créditos para minha conta na plataforma.');
    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Como Funciona</h1>
          <p className="text-muted-foreground">
            Nosso sistema foi simplificado para oferecer maior controle e flexibilidade. 
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
              <CardTitle className="text-lg">3. Solicitar Créditos</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Entre em contato conosco para solicitar créditos conforme sua necessidade.
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
            <CardTitle>Sistema de Créditos Personalizado</CardTitle>
            <CardDescription>
              Adaptamos nosso sistema para oferecer atendimento personalizado e flexibilidade total
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Como Funciona:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Cada fatura criada consome 1 crédito do seu saldo</li>
                  <li>• Créditos são adicionados manualmente pela nossa equipe</li>
                  <li>• Valores e quantidades são negociados individualmente</li>
                  <li>• Atendimento personalizado para cada cliente</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Vantagens:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Preços e pacotes personalizados</li>
                  <li>• Sem mensalidades fixas obrigatórias</li>
                  <li>• Flexibilidade total de uso</li>
                  <li>• Suporte direto e personalizado</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">
                Precisa de mais créditos?
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                Entre em contato conosco pelo WhatsApp para solicitar mais créditos. 
                Nossa equipe está pronta para atender suas necessidades específicas.
              </p>
              <Button 
                onClick={handleWhatsAppContact}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Solicitar Créditos pelo WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Planos;
