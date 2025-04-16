
import React, { useState } from 'react';
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

export function ClientForm() {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      email: '',
      whatsapp: '',
      cpf_cnpj: '',
    },
  });
  
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    
    try {
      // Inserir os dados do cliente na tabela faturas do Supabase
      const { error } = await supabase
        .from('faturas')
        .insert({
          nome: values.nome,
          email: values.email,
          whatsapp: values.whatsapp,
          cpf_cnpj: values.cpf_cnpj,
          valor: 0, // Valor default, já que estamos apenas cadastrando o cliente
          vencimento: new Date().toISOString().split('T')[0], // Data atual como default
          descricao: 'Cadastro de cliente',
          status: 'pendente'
        });
        
      if (error) throw error;
      
      toast({
        title: 'Cliente cadastrado com sucesso',
        description: `${values.nome} foi adicionado à sua base de clientes.`,
      });
      
      form.reset();
    } catch (error) {
      console.error('Error creating client:', error);
      toast({
        title: 'Erro ao cadastrar cliente',
        description: 'Ocorreu um erro ao tentar cadastrar o cliente. Tente novamente.',
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
          {isLoading ? 'Cadastrando...' : 'Cadastrar Cliente'}
        </Button>
      </form>
    </Form>
  );
}
