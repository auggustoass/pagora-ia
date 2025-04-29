import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Plus, Search, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { ClientForm } from '@/components/forms/ClientForm';
import { ClientEditForm } from '@/components/forms/ClientEditForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [newClientDialogOpen, setNewClientDialogOpen] = useState(false);
  const [editClientDialogOpen, setEditClientDialogOpen] = useState(false);

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

  const handleNewClientSuccess = () => {
    setNewClientDialogOpen(false);
  };

  const handleEditClientSuccess = () => {
    setEditClientDialogOpen(false);
    setSelectedClientId(null);
  };

  const handleEditClient = (clientId: string) => {
    setSelectedClientId(clientId);
    setEditClientDialogOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-glow">
            <span className="text-gradient">Clientes</span>
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie seus clientes e visualize informações de contato.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Pesquisar clientes..."
              className="pl-9 bg-white/5 border-white/10 w-full focus:ring-1 focus:ring-pagora-purple/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Dialog open={newClientDialogOpen} onOpenChange={setNewClientDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-pagora-purple to-pagora-purple/80 hover:opacity-90 w-full sm:w-auto btn-hover-fx">
                <Plus className="w-4 h-4 mr-2" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-pagora-dark border-white/10">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
              </DialogHeader>
              <ClientForm onSuccess={handleNewClientSuccess} />
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="glass-card overflow-hidden bg-black/20">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 bg-black/30">
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
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-muted-foreground hover:text-white hover:bg-white/10"
                        onClick={() => handleEditClient(client.id)}
                      >
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
      
      {/* Edit Client Dialog */}
      <Dialog open={editClientDialogOpen} onOpenChange={setEditClientDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-pagora-dark border-white/10">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          {selectedClientId && (
            <ClientEditForm 
              clientId={selectedClientId} 
              onSuccess={handleEditClientSuccess} 
            />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Clientes;
