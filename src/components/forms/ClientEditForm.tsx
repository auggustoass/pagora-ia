
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Mail, Phone, CreditCard } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// Form validation schema
const formSchema = z.object({
  nome: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres' }),
  email: z.string().email({ message: 'E-mail inválido' }),
  whatsapp: z.string().min(8, { message: 'Número de WhatsApp inválido' }),
  cpf_cnpj: z.string().min(11, { message: 'CPF ou CNPJ inválido' }),
});

type FormValues = z.infer<typeof formSchema>;

interface ClientEditFormProps {
  clientId: string;
  onSuccess?: () => void;
}

export function ClientEditForm({ clientId, onSuccess }: ClientEditFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      email: '',
      whatsapp: '',
      cpf_cnpj: '',
    },
  });
  
  // Fetch client data
  useEffect(() => {
    const fetchClientData = async () => {
      setIsLoadingInitialData(true);
      
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', clientId)
          .single();
        
        if (error) throw error;
        
        if (data) {
          form.reset({
            nome: data.nome,
            email: data.email,
            whatsapp: data.whatsapp,
            cpf_cnpj: data.cpf_cnpj,
          });
        }
      } catch (error) {
        console.error('Error fetching client data:', error);
        toast({
          title: 'Erro ao carregar dados do cliente',
          description: 'Não foi possível carregar os dados do cliente. Tente novamente.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingInitialData(false);
      }
    };
    
    if (clientId) {
      fetchClientData();
    }
  }, [clientId, form]);
  
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    
    try {
      // Atualizar dados do cliente no Supabase
      const { error } = await supabase
        .from('clients')
        .update({
          nome: values.nome,
          email: values.email,
          whatsapp: values.whatsapp,
          cpf_cnpj: values.cpf_cnpj,
        })
        .eq('id', clientId);
        
      if (error) throw error;
      
      toast({
        title: 'Cliente atualizado com sucesso',
        description: `Os dados de ${values.nome} foram atualizados.`,
      });
      
      // Execute callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating client:', error);
      toast({
        title: 'Erro ao atualizar cliente',
        description: 'Ocorreu um erro ao tentar atualizar o cliente. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoadingInitialData) {
    return <div className="text-center py-4">Carregando dados do cliente...</div>;
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input 
                      placeholder="Nome do cliente" 
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input 
                      placeholder="exemplo@email.com" 
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
            name="whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input 
                      placeholder="+55 (00) 00000-0000" 
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
            name="cpf_cnpj"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF ou CNPJ</FormLabel>
                <FormControl>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input 
                      placeholder="000.000.000-00" 
                      className="pl-10 bg-white/5 border-white/10" 
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
          {isLoading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </form>
    </Form>
  );
}
