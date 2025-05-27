
import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Users, CreditCard, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const PricingSection = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">Como Funciona Nossa Plataforma</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sistema simplificado e flexível. Pague apenas pelos créditos que usar.
          </p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto mb-12">
          <Card className="glass-card text-center hover-float">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">1. Cadastro</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Crie sua conta gratuita em menos de 2 minutos
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="glass-card text-center hover-float">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-yellow-600" />
              </div>
              <CardTitle className="text-xl">2. Aprovação</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Nossa equipe analisa e aprova em até 24-48h
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="glass-card text-center hover-float">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">3. Créditos</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Solicite créditos conforme sua necessidade
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="glass-card text-center hover-float">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">4. Use</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Crie faturas e gerencie cobranças
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sistema de Créditos Flexível</CardTitle>
            <CardDescription>
              Modelo justo e transparente - pague apenas pelo que usar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4 flex items-center">
                  <Check className="h-5 w-5 text-[#aaff00] mr-2" />
                  Vantagens
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-[#aaff00] mr-2 flex-shrink-0" />
                    <span>Sem mensalidades fixas</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-[#aaff00] mr-2 flex-shrink-0" />
                    <span>Pague apenas pelo que usar</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-[#aaff00] mr-2 flex-shrink-0" />
                    <span>Controle total de gastos</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-[#aaff00] mr-2 flex-shrink-0" />
                    <span>Suporte personalizado</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4 flex items-center">
                  <Check className="h-5 w-5 text-[#aaff00] mr-2" />
                  Funcionalidades
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-[#aaff00] mr-2 flex-shrink-0" />
                    <span>Cobranças via WhatsApp</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-[#aaff00] mr-2 flex-shrink-0" />
                    <span>Pagamento via Pix</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-[#aaff00] mr-2 flex-shrink-0" />
                    <span>IA para mensagens</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-[#aaff00] mr-2 flex-shrink-0" />
                    <span>Dashboard completo</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <Button 
                asChild 
                size="lg" 
                className="bg-[#aaff00] hover:bg-[#88cc00] text-black text-lg px-8 py-3"
              >
                <Link to="/auth?tab=signup">
                  Começar Agora - É Grátis
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
