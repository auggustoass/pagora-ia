
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Como funciona a cobrança automática?",
    answer: "Você cadastra seu cliente e cria uma fatura. Nossa plataforma envia automaticamente uma mensagem pelo WhatsApp com o link de pagamento Pix. Se o pagamento não for realizado, enviamos lembretes programados para aumentar suas chances de recebimento."
  },
  {
    question: "Posso cobrar uma única vez?",
    answer: "Sim! A plataforma permite tanto cobranças únicas quanto recorrentes. Você pode criar faturas avulsas para projetos específicos ou configurar cobranças recorrentes para serviços de assinatura."
  },
  {
    question: "Preciso ter CNPJ?",
    answer: "Não é obrigatório. Você pode utilizar nossa plataforma como pessoa física com seu CPF. Para receber os pagamentos, basta ter uma conta no Mercado Pago associada ao seu CPF ou CNPJ."
  },
  {
    question: "Como recebo os pagamentos?",
    answer: "Os pagamentos via Pix são processados pelo Mercado Pago e caem diretamente na sua conta. Você pode configurar sua conta do Mercado Pago para transferir automaticamente os valores para sua conta bancária."
  },
  {
    question: "A plataforma tem contrato?",
    answer: "Não há contrato de fidelidade. Você pode cancelar sua assinatura a qualquer momento sem multas ou taxas adicionais. Oferecemos planos mensais que podem ser atualizados ou cancelados conforme sua necessidade."
  }
];

export const FAQSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-background/95" id="faq">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">Perguntas Frequentes</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tire suas dúvidas sobre nossa plataforma de cobranças automatizadas.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="glass-card divide-y divide-border">
            {faqs.map((faq, index) => (
              <AccordionItem value={`item-${index}`} key={index} className="border-none">
                <AccordionTrigger className="p-6 text-left text-lg font-medium hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-0 text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
