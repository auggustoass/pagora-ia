import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { InvoiceService } from '@/services/InvoiceService';
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

// Form validation schema
const invoiceFormSchema = z.object({
  nome: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  whatsapp: z.string().min(10, { message: "WhatsApp inválido" }),
  cpf_cnpj: z.string().min(11, { message: "CPF/CNPJ inválido" }),
  descricao: z.string().min(3, { message: "Descrição é obrigatória" }),
  valor: z.coerce.number().positive({ message: "Valor deve ser positivo" }),
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
      
      // Use the secure service to create invoice
      const invoiceData = {
        ...values,
        client_id: clientId,
        valor: parseFloat(values.valor.toString()),
      };
      
      await InvoiceService.createInvoice(invoiceData);
      
      toast.success("Sua fatura foi criada e um crédito foi consumido.");
      
      onSuccess();
    } catch (error) {
      console.error("Error creating invoice:", error);
      // Toast is already shown by the service on error
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
                <Input placeholder="Nome do cliente" {...field} />
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
                <Input type="email" placeholder="email@exemplo.com" {...field} />
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
                  <Input placeholder="(00) 00000-0000" {...field} />
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
                  <Input placeholder="000.000.000-00" {...field} />
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
