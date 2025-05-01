
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CreditCard, CalendarClock, MessageSquare, DollarSign, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface Client {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  cpf_cnpj: string;
}

// Form validation schema
const formSchema = z.object({
  clientId: z.string({ required_error: 'Selecione um cliente' }),
  valor: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'O valor deve ser maior que zero',
  }),
  vencimento: z.date({
    required_error: 'A data de vencimento é obrigatória',
  }),
  descricao: z.string().min(3, { message: 'A descrição deve ter pelo menos 3 caracteres' }),
  generatePaymentLink: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface InvoiceFormProps {
  onSuccess?: () => void;
}

export function InvoiceForm({ onSuccess }: InvoiceFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPaymentLink, setIsGeneratingPaymentLink] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const { user, isAdmin } = useAuth();
  
  // Carrega a lista de clientes do Supabase, filtrando pelo usuário atual
  useEffect(() => {
    const fetchClients = async () => {
      if (!user) return;
      
      try {
        let query = supabase
          .from('clients')
          .select('id, nome, email, whatsapp, cpf_cnpj');
          
        // Se não for admin, mostrar apenas os clientes do usuário
        if (!isAdmin) {
          query = query.eq('user_id', user.id);
        }
        
        const { data, error } = await query.order('nome');
          
        if (error) throw error;
        
        setClients(data || []);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };
    
    fetchClients();
  }, [user, isAdmin]); // Adiciona isAdmin e user como dependências
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: '',
      valor: '',
      descricao: '',
      generatePaymentLink: false,
    },
  });
  
  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para criar faturas.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Encontrar detalhes do cliente
      const client = clients.find(c => c.id === values.clientId);
      
      if (!client) {
        throw new Error('Cliente não encontrado');
      }
      
      // Inserir fatura no Supabase
      const { data: invoice, error } = await supabase
        .from('faturas')
        .insert({
          nome: client.nome,
          email: client.email,
          whatsapp: client.whatsapp,
          cpf_cnpj: client.cpf_cnpj,
          valor: parseFloat(values.valor),
          vencimento: values.vencimento.toISOString().split('T')[0],
          descricao: values.descricao,
          status: 'pendente',
          payment_status: 'pending',
          client_id: client.id,
          user_id: user.id
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // If the user wants to generate a payment link
      if (values.generatePaymentLink && invoice) {
        setIsGeneratingPaymentLink(true);
        
        try {
          const { data: paymentData, error: paymentError } = await supabase.functions.invoke('generate-invoice-payment', {
            body: { invoiceId: invoice.id }
          });
          
          if (paymentError) {
            console.error('Error generating payment link:', paymentError);
            toast({
              title: 'Aviso',
              description: 'Fatura criada, mas não foi possível gerar o link de pagamento.',
              variant: 'default',
            });
          } else if (paymentData && paymentData.payment_url) {
            toast({
              title: 'Link de pagamento gerado',
              description: 'O link de pagamento foi gerado com sucesso.',
            });
          }
        } catch (paymentGenError) {
          console.error('Error calling payment generation:', paymentGenError);
        } finally {
          setIsGeneratingPaymentLink(false);
        }
      }
      
      toast({
        title: 'Fatura gerada com sucesso',
        description: `Fatura no valor de R$ ${values.valor} criada para ${client.nome}.`,
      });
      
      form.reset();
      
      // Execute callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: 'Erro ao gerar fatura',
        description: 'Ocorreu um erro ao tentar gerar a fatura. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="Selecione um cliente" />
                      </div>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.nome} ({client.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="valor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor</FormLabel>
                <FormControl>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input 
                      placeholder="0,00" 
                      className="pl-10 bg-white/5 border-white/10" 
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="vencimento"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Vencimento</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="pl-3 text-left font-normal bg-white/5 border-white/10 w-full flex items-center"
                      >
                        <CalendarClock className="mr-2 h-4 w-4 text-muted-foreground" />
                        {field.value ? (
                          format(field.value, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                        ) : (
                          <span className="text-muted-foreground">Selecione uma data</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
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
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 text-muted-foreground w-4 h-4" />
                    <Textarea 
                      placeholder="Descrição da cobrança" 
                      className="pl-10 min-h-[100px] bg-white/5 border-white/10" 
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="generatePaymentLink"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-white/10 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Gerar link de pagamento
                  </FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Cria automaticamente um link de pagamento via Mercado Pago para esta fatura
                  </p>
                </div>
              </FormItem>
            )}
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-pagora-purple hover:bg-pagora-purple/90"
          disabled={isLoading || isGeneratingPaymentLink}
        >
          {isLoading ? 'Gerando...' : (isGeneratingPaymentLink ? 'Gerando link de pagamento...' : 'Gerar Fatura')}
        </Button>
      </form>
    </Form>
  );
}
