
import React, { useState } from 'react';
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

// Mock data for clients - will be replaced with actual data from Supabase
const mockClients = [
  { id: '1', nome: 'João Silva', email: 'joao@email.com' },
  { id: '2', nome: 'Maria Souza', email: 'maria@email.com' },
  { id: '3', nome: 'Carlos Oliveira', email: 'carlos@email.com' },
];

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
});

type FormValues = z.infer<typeof formSchema>;

export function InvoiceForm() {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: '',
      valor: '',
      descricao: '',
    },
  });
  
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    
    try {
      // Here we would use Supabase to insert the data
      console.log('Submitting invoice data:', values);
      
      // Find client details
      const client = mockClients.find(c => c.id === values.clientId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Fatura gerada com sucesso',
        description: `Fatura no valor de R$ ${values.valor} criada para ${client?.nome}.`,
      });
      
      form.reset();
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
                    {mockClients.map((client) => (
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
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
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
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-pagora-purple hover:bg-pagora-purple/90"
          disabled={isLoading}
        >
          {isLoading ? 'Gerando...' : 'Gerar Fatura'}
        </Button>
      </form>
    </Form>
  );
}
