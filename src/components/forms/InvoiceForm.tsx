import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CreditCard, CalendarClock, MessageSquare, DollarSign, User, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useCredits } from '@/hooks/use-credits';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { useMercadoPago } from '@/hooks/use-mercado-pago';
import { formatDateForDatabase } from '@/utils/date';
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
import {
  Checkbox
} from '@/components/ui/checkbox';

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
  const { credits, loading: creditsLoading } = useCredits();
  const { canGeneratePayments, credentialsSource, isLoading: mpLoading } = useMercadoPago();
  const navigate = useNavigate();
  
  // Sistema simplificado: 1 crédito = 1 fatura
  const creditConsumption = 1;
  const hasCredits = credits && credits.credits_remaining >= creditConsumption;
  
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
  }, [user, isAdmin]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: '',
      valor: '',
      descricao: '',
      generatePaymentLink: false,
    },
  });

  // Função para consumir créditos simplificada
  const consumeCredits = async (amount: number) => {
    try {
      const { data, error } = await supabase
        .from('user_invoice_credits')
        .update({ 
          credits_remaining: (credits?.credits_remaining || 0) - amount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user!.id)
        .select()
        .single();

      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error consuming credits:', error);
      return false;
    }
  };
  
  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast.error('Você precisa estar logado para criar faturas.');
      return;
    }

    // Check if user has available credits
    if (!hasCredits) {
      toast.error(`Você precisa de ${creditConsumption} crédito para gerar uma fatura.`);
      return;
    }

    // Check if the user can generate payment links
    if (values.generatePaymentLink && !canGeneratePayments) {
      toast.error('É necessário configurar credenciais do Mercado Pago para gerar links de pagamento.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Consume credits
      const creditConsumed = await consumeCredits(creditConsumption);
      if (!creditConsumed) {
        throw new Error(`Não foi possível consumir ${creditConsumption} crédito`);
      }
      
      // Encontrar detalhes do cliente
      const client = clients.find(c => c.id === values.clientId);
      
      if (!client) {
        throw new Error('Cliente não encontrado');
      }
      
      console.log('Creating invoice for user:', user.id);
      
      // Inserir fatura no Supabase - usando formatDateForDatabase para evitar problemas de timezone
      const { data: invoice, error } = await supabase
        .from('faturas')
        .insert({
          nome: client.nome,
          email: client.email,
          whatsapp: client.whatsapp,
          cpf_cnpj: client.cpf_cnpj,
          valor: parseFloat(values.valor),
          vencimento: formatDateForDatabase(values.vencimento),
          descricao: values.descricao,
          status: 'pendente',
          payment_status: 'pending',
          client_id: client.id,
          user_id: user.id
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating invoice:', error);
        throw error;
      }
      
      console.log('Invoice created successfully:', invoice);
      
      // If the user wants to generate a payment link
      if (values.generatePaymentLink && invoice && canGeneratePayments) {
        setIsGeneratingPaymentLink(true);
        
        try {
          console.log('Attempting to generate payment link for invoice:', invoice.id);
          console.log('Using credentials source:', credentialsSource);
          
          const { data: paymentData, error: paymentError } = await supabase.functions.invoke('generate-invoice-payment', {
            body: { invoiceId: invoice.id }
          });
          
          console.log('Payment generation response:', { paymentData, paymentError });
          
          if (paymentError) {
            console.error('Error generating payment link:', paymentError);
            toast.error(`Fatura criada, mas erro ao gerar link de pagamento: ${paymentError.message || 'Erro desconhecido'}`);
          } else if (paymentData?.success && paymentData.payment_url) {
            const sourceText = credentialsSource === 'user' ? 'suas credenciais pessoais' : 'credenciais globais';
            toast.success(`Link de pagamento gerado com sucesso usando ${sourceText}.`);
            console.log('Payment link generated successfully:', paymentData.payment_url);
          } else {
            console.error('Payment generation failed:', paymentData);
            toast.error(`Fatura criada, mas falha na geração do link: ${paymentData?.error || 'Resposta inválida'}`);
          }
        } catch (paymentGenError) {
          console.error('Error calling payment generation function:', paymentGenError);
          toast.error(`Erro ao chamar função de pagamento: ${paymentGenError instanceof Error ? paymentGenError.message : 'Erro desconhecido'}`);
        } finally {
          setIsGeneratingPaymentLink(false);
        }
      }
      
      toast.success(`Fatura no valor de R$ ${values.valor} criada para ${client.nome}.`);
      
      form.reset();
      
      // Execute callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error(`Erro ao criar fatura: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (creditsLoading || mpLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <p>Carregando...</p>
      </div>
    );
  }
  
  if (!hasCredits) {
    return (
      <div className="space-y-4">
        <Alert className="bg-red-500/10 border-red-500/20">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertTitle className="text-red-500">Sem créditos suficientes</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            Você precisa de {creditConsumption} crédito para gerar uma fatura.
            Entre em contato conosco para solicitar mais créditos.
          </AlertDescription>
        </Alert>
        
        <Button 
          className="w-full bg-yellow-500 hover:bg-yellow-600"
          onClick={() => navigate('/planos')}
        >
          Solicitar créditos
        </Button>
      </div>
    );
  }

  const getPaymentLinkStatus = () => {
    if (!canGeneratePayments) {
      return {
        canGenerate: false,
        message: "Configure suas credenciais do Mercado Pago em Configurações para gerar links de pagamento.",
        buttonText: "Configurar Mercado Pago"
      };
    }
    
    if (credentialsSource === 'user') {
      return {
        canGenerate: true,
        message: "Links de pagamento serão gerados usando suas credenciais pessoais.",
        buttonText: null
      };
    }
    
    return {
      canGenerate: true,
      message: "Links de pagamento serão gerados usando credenciais globais do sistema.",
      buttonText: null
    };
  };

  const paymentStatus = getPaymentLinkStatus();
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {!canGeneratePayments && (
            <Alert className="bg-amber-500/10 border-amber-500/20">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-sm">
                <span className="font-medium text-amber-500">
                  Nenhuma credencial do Mercado Pago configurada.
                </span>
                <br />
                <span className="text-muted-foreground">
                  Configure suas credenciais pessoais ou solicite ao administrador para configurar credenciais globais.
                </span>
                <Button 
                  variant="outline"
                  size="sm"
                  className="mt-2 border-amber-500/30 text-amber-500 hover:bg-amber-500/20"
                  onClick={() => navigate('/configuracoes')}
                >
                  Configurar Mercado Pago
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Alert className="bg-blue-500/10 border-blue-500/20">
            <AlertDescription className="text-sm">
              <span className="font-medium">
                Créditos disponíveis: {credits?.credits_remaining || 0}
              </span>
              <br />
              <span className="text-muted-foreground">
                Cada fatura consome {creditConsumption} crédito
              </span>
            </AlertDescription>
          </Alert>
          
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
                    disabled={!canGeneratePayments}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className={!canGeneratePayments ? 'text-muted-foreground' : ''}>
                    Gerar link de pagamento
                  </FormLabel>
                  <p className="text-sm text-muted-foreground">
                    {paymentStatus.message}
                  </p>
                  {paymentStatus.buttonText && (
                    <Button 
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-1"
                      onClick={() => navigate('/configuracoes')}
                    >
                      {paymentStatus.buttonText}
                    </Button>
                  )}
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
