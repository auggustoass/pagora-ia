
import React from 'react';
import { UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { cn } from '@/lib/utils';

interface Client {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  cpf_cnpj: string;
}

interface ClientsTabProps {
  clients: Client[];
  loading: boolean;
  searchTerm: string;
  currentPage: number;
  itemsPerPage: number;
  onEditClient: (clientId: string) => void;
  onPageChange: (page: number) => void;
}

export function ClientsTab({
  clients,
  loading,
  searchTerm,
  currentPage,
  itemsPerPage,
  onEditClient,
  onPageChange
}: ClientsTabProps) {
  const filteredClients = clients.filter(client => {
    if (!searchTerm) return true;
    return client.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
           client.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
           client.cpf_cnpj.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const currentClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  return (
    <div className="glass-card bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-white/10 rounded-2xl">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-1">Lista de Clientes</h3>
            <p className="text-sm text-gray-400">Gerencie todos os seus contatos cadastrados</p>
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 bg-black/30">
              <TableHead className="text-gray-400">Nome</TableHead>
              <TableHead className="text-gray-400">E-mail</TableHead>
              <TableHead className="text-gray-400">WhatsApp</TableHead>
              <TableHead className="text-gray-400">CPF/CNPJ</TableHead>
              <TableHead className="text-gray-400 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : currentClients.length > 0 ? (
              currentClients.map(client => (
                <TableRow key={client.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="font-medium text-white">{client.nome}</TableCell>
                  <TableCell className="text-gray-300">{client.email}</TableCell>
                  <TableCell className="text-gray-300">{client.whatsapp}</TableCell>
                  <TableCell className="text-gray-300">{client.cpf_cnpj}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-400 hover:text-white hover:bg-white/10" 
                      onClick={() => onEditClient(client.id)}
                    >
                      <UserCog className="w-4 h-4 mr-1" />
                      Gerenciar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                  {searchTerm ? "Nenhum cliente encontrado com este termo." : "Nenhum cliente cadastrado."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        {!loading && filteredClients.length > 0 && (
          <div className="py-4 border-t border-white/10">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))} 
                    className={cn(
                      "border-white/10 bg-white/5 hover:bg-white/10",
                      currentPage === 1 && "pointer-events-none opacity-50"
                    )} 
                    aria-disabled={currentPage === 1} 
                  />
                </PaginationItem>
                
                {totalPages <= 5 ? (
                  [...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i + 1}>
                      <PaginationLink 
                        onClick={() => onPageChange(i + 1)} 
                        isActive={currentPage === i + 1} 
                        className={cn(
                          "border-white/10",
                          currentPage === i + 1 ? "bg-white/20" : "bg-white/5 hover:bg-white/10"
                        )}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))
                ) : (
                  <>
                    <PaginationItem>
                      <PaginationLink 
                        onClick={() => onPageChange(1)} 
                        isActive={currentPage === 1} 
                        className={cn(
                          "border-white/10",
                          currentPage === 1 ? "bg-white/20" : "bg-white/5 hover:bg-white/10"
                        )}
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                    
                    {currentPage > 3 && (
                      <PaginationItem>
                        <PaginationEllipsis className="text-white/50" />
                      </PaginationItem>
                    )}
                    
                    {[...Array(totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      if (pageNum !== 1 && pageNum !== totalPages && pageNum >= currentPage - 1 && pageNum <= currentPage + 1) {
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink 
                              onClick={() => onPageChange(pageNum)} 
                              isActive={currentPage === pageNum} 
                              className={cn(
                                "border-white/10",
                                currentPage === pageNum ? "bg-white/20" : "bg-white/5 hover:bg-white/10"
                              )}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}
                    
                    {currentPage < totalPages - 2 && (
                      <PaginationItem>
                        <PaginationEllipsis className="text-white/50" />
                      </PaginationItem>
                    )}
                    
                    <PaginationItem>
                      <PaginationLink 
                        onClick={() => onPageChange(totalPages)} 
                        isActive={currentPage === totalPages} 
                        className={cn(
                          "border-white/10",
                          currentPage === totalPages ? "bg-white/20" : "bg-white/5 hover:bg-white/10"
                        )}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} 
                    className={cn(
                      "border-white/10 bg-white/5 hover:bg-white/10",
                      currentPage === totalPages && "pointer-events-none opacity-50"
                    )} 
                    aria-disabled={currentPage === totalPages} 
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
