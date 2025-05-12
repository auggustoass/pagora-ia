
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, UserPlus, FileText, Link, BarChart2, MessageCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

interface OnboardingTutorialProps {
  onClose?: () => void;
}

const tutorialSteps = [
  {
    title: "Bem-vindo ao HBLACKPIX!",
    description: "Vamos fazer um tour rápido para você aprender a usar nossa plataforma. Use as setas para navegar entre os passos do tutorial.",
    icon: <CreditCard className="w-12 h-12 text-pagora-purple" />,
    action: null
  },
  {
    title: "1. Comprar créditos de faturas",
    description: "Cada fatura que você gera consome 1 crédito. Você ganhou 1 fatura grátis! Para gerar mais faturas você precisará comprar créditos.",
    icon: <CreditCard className="w-12 h-12 text-yellow-500" />,
    action: {
      label: "Ver planos",
      route: "/planos"
    }
  },
  {
    title: "2. Cadastrar novos clientes",
    description: "Cadastre seus clientes para poder gerar faturas rapidamente. Você pode cadastrar quantos clientes quiser.",
    icon: <UserPlus className="w-12 h-12 text-green-500" />,
    action: {
      label: "Cadastrar cliente",
      route: "/clientes"
    }
  },
  {
    title: "3. Gerar nova fatura",
    description: "Gere faturas para seus clientes em poucos cliques. Cada fatura consome 1 crédito da sua conta.",
    icon: <FileText className="w-12 h-12 text-blue-500" />,
    action: {
      label: "Gerar fatura",
      route: "/faturas"
    }
  },
  {
    title: "4. Gerar link de pagamento",
    description: "Você pode gerar links de pagamento para suas faturas ou deixar nosso assistente cobrar automaticamente via WhatsApp e e-mail.",
    icon: <Link className="w-12 h-12 text-purple-500" />,
    action: null
  },
  {
    title: "5. Gerar relatórios",
    description: "Acompanhe suas finanças e o status de todas as suas faturas através de relatórios detalhados.",
    icon: <BarChart2 className="w-12 h-12 text-orange-500" />,
    action: {
      label: "Ver relatórios",
      route: "/relatorios"
    }
  },
  {
    title: "6. Suporte e sugestões",
    description: "Tem dúvidas ou sugestões? Entre em contato com nosso suporte, estamos sempre prontos para ajudar!",
    icon: <MessageCircle className="w-12 h-12 text-pink-500" />,
    action: {
      label: "Falar com suporte",
      route: "/ajuda"
    }
  }
];

export function OnboardingTutorial({ onClose }: OnboardingTutorialProps) {
  const [open, setOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAction = () => {
    const action = tutorialSteps[currentStep].action;
    if (action) {
      navigate(action.route);
      handleClose();
    }
  };

  const handleClose = async () => {
    setOpen(false);
    
    // Update user profile to mark first login as completed
    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({ first_login: false })
          .eq('id', user.id);
      } catch (error) {
        console.error('Error updating first login status:', error);
      }
    }
    
    // Call the onClose prop if provided
    if (onClose) {
      onClose();
    }
  };

  const step = tutorialSteps[currentStep];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) handleClose();
    }}>
      <DialogContent className="sm:max-w-[500px] bg-pagora-dark border-white/10">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight text-center">{step.title}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4 py-4">
          {step.icon}
          
          <p className="text-center text-muted-foreground">{step.description}</p>
        </div>
        
        <div className="flex justify-center mt-2 mb-4">
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 mx-1 rounded-full ${
                index === currentStep ? 'bg-pagora-purple' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="border-white/10"
            >
              Anterior
            </Button>
            
            {step.action && (
              <Button onClick={handleAction} className="bg-pagora-purple hover:bg-pagora-purple/90">
                {step.action.label}
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleClose}>
              Pular tutorial
            </Button>
            
            <Button onClick={handleNext} className={currentStep === tutorialSteps.length - 1 ? "bg-green-600 hover:bg-green-700" : ""}>
              {currentStep === tutorialSteps.length - 1 ? "Concluir" : "Próximo"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
