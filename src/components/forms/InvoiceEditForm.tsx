import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CreditCard, CalendarClock, MessageSquare, DollarSign, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { parseDateFromDatabase, formatDateForDatabase } from '@/utils/date';
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
  status: z.enum(['pendente', 'aprovado', 'rejeitado']),
});

type FormValues = z.infer<typeof formSchema>;

interface InvoiceEditFormProps {
  invoiceId: string;
  onSuccess?: () => void;
}

export function InvoiceEditForm({ invoiceId, onSuccess }: InvoiceEditFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const { user } = useAuth();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: '',
      valor: '',
      descricao: '',
      status: 'pendente',
    },
  });
  
  // Carrega a lista de clientes do Supabase
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('id, nome, email, whatsapp, cpf_cnpj')
          .order('nome');
          
        if (error) throw error;
        
        setClients(data || []);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };
    
    fetchClients();
  }, []);
  
  // Fetch invoice data
  useEffect(() => {
    const fetchInvoiceData = async () => {
      setIsLoadingInitialData(true);
      
      try {
        const { data: invoice, error } = await supabase
          .from('faturas')
          .select('*')
          .eq('id', invoiceId)
          .single();
        
        if (error) throw error;
        
        if (invoice) {
          form.reset({
            clientId: invoice.client_id || '',
            valor: invoice.valor.toString(),
            vencimento: parseDateFromDatabase(invoice.vencimento),
            descricao: invoice.descricao,
            status: invoice.status as 'pendente' | 'aprovado' | 'rejeitado',
          });
        }
      } catch (error) {
        console.error('Error fetching invoice data:', error);
        toast.error('Não foi possível carregar os dados da fatura. Tente novamente.');
      } finally {
        setIsLoadingInitialData(false);
      }
    };
    
    if (invoiceId) {
      fetchInvoiceData();
    }
  }, [invoiceId, form]);
  
  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast.error('Você precisa estar logado para editar faturas.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Encontrar detalhes do cliente
      const client = clients.find(c => c.id === values.clientId);
      
      if (!client) {
        throw new Error('Cliente não encontrado');
      }
      
      // Atualizar fatura no Supabase - usando formatDateForDatabase para evitar problemas de timezone
      const { error } = await supabase
        .from('faturas')
        .update({
          nome: client.nome,
          email: client.email,
          whatsapp: client.whatsapp,
          cpf_cnpj: client.cpf_cnpj,
          valor: parseFloat(values.valor),
          vencimento: formatDateForDatabase(values.vencimento),
          descricao: values.descricao,
          status: values.status,
          client_id: client.id,
          // Mantemos o user_id existente, não atualizamos aqui
        })
        .eq('id', invoiceId);
        
      if (error) throw error;
      
      toast.success(`Fatura no valor de R$ ${values.valor} para ${client.nome} foi atualizada.`);
      
      // Execute callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.error('Ocorreu um erro ao tentar atualizar a fatura. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoadingInitialData) {
    return <div className="text-center py-4">Carregando dados da fatura...</div>;
  }
  
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
                <Select onValueChange={field.onChange} value={field.value}>
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
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="rejeitado">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-pagora-purple hover:bg-pagora-purple/90"
          disabled={isLoading}
        >
          {isLoading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </form>
    </Form>
  );
}
