
import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { InvoiceService } from '@/services/InvoiceService';
import { SecurityService } from '@/services/SecurityService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

// Enhanced form validation schema with security checks
const invoiceFormSchema = z.object({
  nome: z.string()
    .min(2, { message: "Nome deve ter pelo menos 2 caracteres" })
    .max(100, { message: "Nome muito longo" })
    .refine(val => SecurityService.sanitizeHtml(val) === val, {
      message: "Nome contém caracteres inválidos"
    }),
  email: z.string()
    .email({ message: "Email inválido" })
    .refine(val => SecurityService.isValidEmail(val), {
      message: "Formato de email inválido"
    }),
  whatsapp: z.string()
    .min(10, { message: "WhatsApp inválido" })
    .refine(val => SecurityService.isValidPhone(val), {
      message: "Formato de telefone inválido"
    }),
  cpf_cnpj: z.string()
    .min(11, { message: "CPF/CNPJ inválido" })
    .refine(val => SecurityService.isValidCpfCnpj(val), {
      message: "CPF/CNPJ inválido"
    }),
  descricao: z.string()
    .min(3, { message: "Descrição é obrigatória" })
    .max(1000, { message: "Descrição muito longa" })
    .refine(val => SecurityService.sanitizeHtml(val) === val, {
      message: "Descrição contém caracteres inválidos"
    }),
  valor: z.coerce.number()
    .positive({ message: "Valor deve ser positivo" })
    .max(1000000, { message: "Valor muito alto" }),
  vencimento: z.string().min(1, { message: "Data de vencimento é obrigatória" }),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

interface SecureInvoiceFormProps {
  onSuccess: () => void;
  clientId?: string;
}

export function SecureInvoiceForm({ onSuccess, clientId }: SecureInvoiceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      nome: "",
      email: "",
      whatsapp: "",
      cpf_cnpj: "",
      descricao: "",
      valor: 0,
      vencimento: new Date().toISOString().split("T")[0],
    },
  });

  async function onSubmit(values: InvoiceFormValues) {
    try {
      setIsSubmitting(true);
      
      // Rate limiting check
      if (!SecurityService.checkRateLimit('invoice_creation', 5, 60000)) {
        toast({
          title: "Muitas tentativas",
          description: "Aguarde um minuto antes de tentar novamente.",
          variant: "destructive"
        });
        return;
      }

      // Sanitize all input data
      const sanitizedValues = SecurityService.sanitizeInput(values);
      
      // Use the secure service to create invoice
      const invoiceData = {
        ...sanitizedValues,
        client_id: clientId,
        valor: parseFloat(sanitizedValues.valor.toString()),
      };
      
      await InvoiceService.createInvoice(invoiceData);
      
      toast({
        title: "Sucesso",
        description: "Sua fatura foi criada e um crédito foi consumido."
      });
      
      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Error creating invoice:", SecurityService.cleanSensitiveData(error));
      toast({
        title: "Erro",
        description: "Erro ao criar fatura. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Nome do cliente" 
                  {...field} 
                  maxLength={100}
                  autoComplete="off"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="email@exemplo.com" 
                  {...field} 
                  autoComplete="off"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="(00) 00000-0000" 
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
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descrição do serviço ou produto" 
                  className="resize-none" 
                  {...field} 
                  maxLength={1000}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    max="1000000"
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
            name="vencimento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vencimento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
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
          ) : "Gerar Fatura"}
        </Button>
      </form>
    </Form>
  );
}
