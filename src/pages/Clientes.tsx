
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Plus, Search, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Client {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  cpf_cnpj: string;
}

const Clientes = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('nome');
          
        if (error) throw error;
        
        setClients(data || []);
      } catch (error) {
        console.error('Error fetching clients:', error);
        setClients([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClients();
    
    // Setup real-time subscription
    const subscription = supabase
      .channel('table-db-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'clients' 
        }, 
        () => {
          fetchClients();
        }
      )
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Filter clients based on search term
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.cpf_cnpj.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gerencie seus clientes e visualize informações de contato.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Pesquisar clientes..."
              className="pl-9 bg-white/5 border-white/10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button className="bg-pagora-purple hover:bg-pagora-purple/90 w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
        </div>
        
        <div className="glass-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 bg-white/5">
                <TableHead className="text-muted-foreground">Nome</TableHead>
                <TableHead className="text-muted-foreground">E-mail</TableHead>
                <TableHead className="text-muted-foreground">WhatsApp</TableHead>
                <TableHead className="text-muted-foreground">CPF/CNPJ</TableHead>
                <TableHead className="text-muted-foreground text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <TableRow key={client.id} className="border-white/5 hover:bg-white/5">
                    <TableCell className="font-medium">{client.nome}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.whatsapp}</TableCell>
                    <TableCell>{client.cpf_cnpj}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
                        <UserCog className="w-4 h-4 mr-1" />
                        Gerenciar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "Nenhum cliente encontrado com este termo." : "Nenhum cliente cadastrado."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
};

export default Clientes;
