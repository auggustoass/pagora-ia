
import React, { lazy, Suspense, memo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ClientEditForm } from '../forms/ClientEditForm';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load heavy components
const InvoiceTable = lazy(() => 
  import('./InvoiceTable').then(module => ({ default: module.InvoiceTable }))
);

const ClientsTab = lazy(() => 
  import('./ClientsTab').then(module => ({ default: module.ClientsTab }))
);

interface Client {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  cpf_cnpj: string;
}

interface LazyTabsSectionProps {
  clients: Client[];
  loading: boolean;
  searchTerm: string;
  currentPage: number;
  itemsPerPage: number;
  selectedClientId: string | null;
  editClientDialogOpen: boolean;
  onEditClient: (clientId: string) => void;
  onPageChange: (page: number) => void;
  onEditClientDialogChange: (open: boolean) => void;
  onEditClientSuccess: () => void;
}

const LoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-8 w-full" />
  </div>
);

export const LazyTabsSection = memo<LazyTabsSectionProps>(({
  clients,
  loading,
  searchTerm,
  currentPage,
  itemsPerPage,
  selectedClientId,
  editClientDialogOpen,
  onEditClient,
  onPageChange,
  onEditClientDialogChange,
  onEditClientSuccess
}) => {
  return (
    <>
      <Tabs defaultValue="faturas" className="space-y-6">
        <TabsList className="bg-gray-900/50 border border-white/10 rounded-xl p-1">
          <TabsTrigger 
            value="faturas" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-lg transition-all duration-200"
          >
            Faturas
          </TabsTrigger>
          <TabsTrigger 
            value="clientes" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-600 data-[state=active]:to-gray-500 data-[state=active]:text-white rounded-lg transition-all duration-200"
          >
            Clientes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="faturas" className="animate-fade-in">
          <Suspense fallback={<LoadingSkeleton />}>
            <InvoiceTable />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="clientes" className="animate-fade-in">
          <Suspense fallback={<LoadingSkeleton />}>
            <ClientsTab
              clients={clients}
              loading={loading}
              searchTerm={searchTerm}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onEditClient={onEditClient}
              onPageChange={onPageChange}
            />
          </Suspense>
        </TabsContent>
      </Tabs>
      
      {/* Client Edit Dialog */}
      <Dialog open={editClientDialogOpen} onOpenChange={onEditClientDialogChange}>
        <DialogContent className="sm:max-w-[425px] bg-gray-900/95 border border-white/20 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Cliente</DialogTitle>
          </DialogHeader>
          {selectedClientId && (
            <ClientEditForm 
              clientId={selectedClientId} 
              onSuccess={onEditClientSuccess} 
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
});

LazyTabsSection.displayName = 'LazyTabsSection';
