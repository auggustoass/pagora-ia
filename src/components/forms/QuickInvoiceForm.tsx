import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Copy, MessageCircle, AlertCircle } from 'lucide-react';
import { InvoiceService } from '@/services/InvoiceService';
import { useCredits } from '@/hooks/use-credits';
import { SecurityService } from '@/services/SecurityService';
import { PixQRCodeModal } from './PixQRCodeModal';

const quickInvoiceSchema = z.object({
  whatsapp: z.string()
    .min(10, { message: "WhatsApp deve ter pelo menos 10 dígitos" })
    .refine(val => SecurityService.isValidPhone(val), {
      message: "Formato de telefone inválido"
    }),
  cpf_cnpj: z.string()
    .min(11, { message: "CPF/CNPJ inválido" })
    .refine(val => SecurityService.isValidCpfCnpj(val), {
      message: "CPF/CNPJ inválido"
    }),
  email: z.string()
    .email({ message: "Email inválido" })
    .refine(val => SecurityService.isValidEmail(val), {
      message: "Formato de email inválido"
    }),
  valor: z.coerce.number()
    .positive({ message: "Valor deve ser positivo" })
    .max(1000000, { message: "Valor muito alto" }),
  descricao: z.string()
    .min(3, { message: "Descrição é obrigatória" })
    .max(500, { message: "Descrição muito longa" }),
  paymentType: z.enum(["pix", "link"], {
    required_error: "Selecione o tipo de pagamento"
  })
});

type QuickInvoiceFormValues = z.infer<typeof quickInvoiceSchema>;

interface QuickInvoiceFormProps {
  onSuccess: () => void;
}

export function QuickInvoiceForm({ onSuccess }: QuickInvoiceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<{
    type: 'pix' | 'link';
    value: string;
    invoiceId: string;
    pixError?: string;
  } | null>(null);
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixData, setPixData] = useState<{
    code: string;
    whatsapp: string;
  } | null>(null);
  const { credits, refetch } = useCredits();
  const { toast } = useToast();

  const form = useForm<QuickInvoiceFormValues>({
    resolver: zodResolver(quickInvoiceSchema),
    defaultValues: {
      whatsapp: "",
      cpf_cnpj: "",
      email: "",
      valor: 0,
      descricao: "",
      paymentType: "pix",
    },
  });

  async function onSubmit(values: QuickInvoiceFormValues) {
    try {
      setIsSubmitting(true);
      
      // Verificar créditos
      if (!credits || credits.credits_remaining < 1) {
        toast({
          title: "Créditos insuficientes",
          description: "Você precisa de pelo menos 1 crédito para gerar uma fatura.",
          variant: "destructive"
        });
        return;
      }

      // Rate limiting check
      if (!SecurityService.checkRateLimit('quick_invoice_creation', 3, 60000)) {
        toast({
          title: "Muitas tentativas",
          description: "Aguarde um minuto antes de tentar novamente.",
          variant: "destructive"
        });
        return;
      }

      // Sanitizar dados
      const sanitizedValues = SecurityService.sanitizeInput(values);
      
      // Criar fatura
      const invoiceData = {
        nome: `Cliente - ${sanitizedValues.cpf_cnpj}`,
        email: sanitizedValues.email,
        whatsapp: sanitizedValues.whatsapp,
        cpf_cnpj: sanitizedValues.cpf_cnpj,
        descricao: sanitizedValues.descricao,
        valor: parseFloat(sanitizedValues.valor.toString()),
        vencimento: new Date().toISOString().split("T")[0],
      };
      
      console.log("🔥 Creating invoice with data:", invoiceData);
      const invoice = await InvoiceService.createInvoice(invoiceData);
      console.log("✅ Invoice created:", invoice);
      
      // Generate payment based on type
      console.log(`🔥 Generating ${values.paymentType} payment for invoice ${invoice.id}`);
      const paymentResult = await InvoiceService.generatePaymentLink(invoice.id, values.paymentType);
      console.log("✅ Payment result:", paymentResult);
      
      if (values.paymentType === "pix") {
        // For PIX, check if real PIX data is available
        if (paymentResult.qr_code_base64 || paymentResult.qr_code) {
          const pixCode = paymentResult.qr_code_base64 || paymentResult.qr_code;
          
          setPixData({
            code: pixCode,
            whatsapp: sanitizedValues.whatsapp
          });
          setShowPixModal(true);
        } else {
          // PIX generation failed, show error
          setGeneratedResult({
            type: 'pix',
            value: paymentResult.payment_url || '',
            invoiceId: invoice.id,
            pixError: "Erro ao gerar PIX. Tente novamente ou use o link de pagamento."
          });
        }
      } else {
        // For link payment
        setGeneratedResult({
          type: 'link',
          value: paymentResult.payment_url || paymentResult.init_point,
          invoiceId: invoice.id
        });
      }
      
      await refetch();
      
      toast({
        title: "Cobrança criada com sucesso!",
        description: `${values.paymentType === 'pix' ? 'Código PIX' : 'Link de pagamento'} gerado.`
      });
      
    } catch (error: any) {
      console.error("Error creating quick invoice:", error);
      toast({
        title: "Erro ao criar cobrança",
        description: error.message || "Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado!",
        description: "Conteúdo copiado para a área de transferência."
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o conteúdo.",
        variant: "destructive"
      });
    }
  };

  const openWhatsApp = () => {
    if (generatedResult && form.getValues('whatsapp')) {
      const whatsapp = form.getValues('whatsapp').replace(/\D/g, '');
      const message = encodeURIComponent(
        `Olá! Sua cobrança está pronta. ${generatedResult.type === 'pix' ? 'Link de pagamento' : 'Link de pagamento'}: ${generatedResult.value}`
      );
      window.open(`https://wa.me/55${whatsapp}?text=${message}`, '_blank');
    }
  };

  const handleNewInvoice = () => {
    setGeneratedResult(null);
    setShowPixModal(false);
    setPixData(null);
    form.reset();
  };

  const handlePixModalClose = () => {
    setShowPixModal(false);
    setPixData(null);
  };

  if (showPixModal && pixData) {
    return (
      <PixQRCodeModal
        isOpen={showPixModal}
        onClose={handlePixModalClose}
        pixCode={pixData.code}
        whatsappNumber={pixData.whatsapp}
        onNewInvoice={handleNewInvoice}
      />
    );
  }

  if (generatedResult) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-medium text-green-400 mb-2">
            {generatedResult.type === 'pix' && generatedResult.pixError ? (
              <>
                <AlertCircle className="w-5 h-5 inline mr-2 text-yellow-500" />
                Erro ao Gerar PIX
              </>
            ) : generatedResult.type === 'pix' ? 'Código PIX Gerado!' : 'Link de Pagamento Gerado!'}
          </h3>
          
          {generatedResult.pixError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-400">{generatedResult.pixError}</p>
            </div>
          )}
          
          <div className="bg-black/20 p-4 rounded-lg border border-white/10">
            <p className="text-sm text-muted-foreground mb-2">
              {generatedResult.type === 'pix' && !generatedResult.pixError ? 'Código PIX:' : 'Link de Pagamento:'}
            </p>
            <div className="flex items-center gap-2">
              <Input 
                value={generatedResult.value} 
                readOnly 
                className="bg-white/5 border-white/10"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(generatedResult.value)}
                className="shrink-0"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={openWhatsApp}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Enviar via WhatsApp
          </Button>
          <Button
            variant="outline"
            onClick={handleNewInvoice}
            className="flex-1"
          >
            Nova Cobrança
          </Button>
        </div>
        
        <Button
          variant="ghost"
          onClick={onSuccess}
          className="w-full"
        >
          Fechar
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="(11) 99999-9999" 
                    {...field} 
                    autoComplete="off"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="cpf_cnpj"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF/CNPJ</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="000.000.000-00" 
                    {...field} 
                    autoComplete="off"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="cliente@exemplo.com" 
                  {...field} 
                  autoComplete="off"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="valor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor (R$)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0.01" 
                  step="0.01" 
                  placeholder="0.00" 
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descrição do serviço ou produto" 
                  className="resize-none" 
                  {...field} 
                  maxLength={500}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="paymentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Pagamento</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pix" id="pix" />
                    <Label htmlFor="pix">PIX</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="link" id="link" />
                    <Label htmlFor="link">Link de Pagamento</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-pagora-orange to-pagora-orange/80 hover:opacity-90"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando...
            </>
          ) : "Gerar Cobrança Rápida"}
        </Button>
      </form>
    </Form>
  );
}
