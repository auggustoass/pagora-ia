import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useInvoices } from '@/hooks/useInvoices';
import { PaymentService } from '@/services/PaymentService';
import { NotificationsService } from '@/services/NotificationsService';
import { formatCurrency, formatDate } from '@/utils/currency';
import { LoadingTableRow, EmptyState } from '@/components/ui/loading-states';
import { InvoiceTableHeader } from './InvoiceTableHeader';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { InvoiceActions } from './InvoiceActions';
import { Invoice } from '@/types/invoice';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface InvoiceTableProps {
  onEditInvoice?: (invoiceId: string) => void;
}

export function InvoiceTable({ onEditInvoice }: InvoiceTableProps) {
  const [filter, setFilter] = useState<'all' | 'pendente' | 'aprovado' | 'rejeitado'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();
  const itemsPerPage = 10;

  const { invoices, isLoading, refetch } = useInvoices({
    status: filter,
    searchTerm: searchTerm || undefined
  });

  const filteredInvoices = invoices;
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const currentInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEditClick = (invoiceId: string) => {
    if (onEditInvoice) {
      onEditInvoice(invoiceId);
    }
  };

  const handleGeneratePaymentLink = async (invoiceId: string) => {
    if (!user) return;

    try {
      setProcessingPayment(invoiceId);
      const result = await PaymentService.generatePaymentLink(invoiceId);
      
      if (result.success) {
        const invoice = invoices.find(inv => inv.id === invoiceId);
        if (invoice) {
          await NotificationsService.createNotification({
            userId: user.id,
            type: 'payment_update',
            title: 'Link de pagamento gerado',
            content: `O link de pagamento para a fatura de ${formatCurrency(invoice.valor)} do cliente ${invoice.nome} foi gerado com sucesso.`,
            relatedId: invoiceId
          });
        }
        refetch();
      }
    } finally {
      setProcessingPayment(null);
    }
  };
  
  if (!user) {
    return <div className="text-center py-4 text-gray-400">Você precisa estar logado para visualizar faturas.</div>;
  }

  return (
    <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
      <InvoiceTableHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filter={filter}
        onFilterChange={setFilter}
      />
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-black/20">
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Cliente</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Descrição</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Valor</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Vencimento</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Status</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <LoadingTableRow columns={6} />
            ) : (
              currentInvoices.length > 0 ? (
                currentInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-white/5 hover:bg-white/5 transition-all duration-200">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-white">{invoice.nome}</p>
                        <p className="text-sm text-gray-400">{invoice.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-300 max-w-xs truncate">{invoice.descricao}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-green-400">
                        {formatCurrency(invoice.valor)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {formatDate(invoice.vencimento)}
                    </td>
                    <td className="px-6 py-4">
                      <InvoiceStatusBadge status={invoice.status} />
                    </td>
                    <td className="px-6 py-4">
                      <InvoiceActions
                        invoiceId={invoice.id}
                        paymentUrl={invoice.payment_url}
                        onEdit={handleEditClick}
                        onGeneratePayment={handleGeneratePaymentLink}
                        isGeneratingPayment={processingPayment === invoice.id}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <EmptyState 
                      message="Nenhuma fatura encontrada."
                      icon={<Eye className="w-8 h-8 text-gray-500" />}
                    />
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && filteredInvoices.length > 0 && (
        <div className="py-4 px-6 border-t border-white/10">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={cn(
                    "border-white/10 bg-white/5 hover:bg-white/10 text-white", 
                    currentPage === 1 && "pointer-events-none opacity-50"
                  )}
                  aria-disabled={currentPage === 1}
                />
              </PaginationItem>
              
              {totalPages <= 5 ? (
                [...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i + 1}>
                    <PaginationLink
                      onClick={() => handlePageChange(i + 1)}
                      isActive={currentPage === i + 1}
                      className={cn(
                        "border-white/10 text-white",
                        currentPage === i + 1 
                          ? "bg-green-600 hover:bg-green-700" 
                          : "bg-white/5 hover:bg-white/10"
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
                      onClick={() => handlePageChange(1)}
                      isActive={currentPage === 1}
                      className={cn(
                        "border-white/10 text-white",
                        currentPage === 1 
                          ? "bg-green-600 hover:bg-green-700" 
                          : "bg-white/5 hover:bg-white/10"
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
                    if (
                      pageNum !== 1 && 
                      pageNum !== totalPages && 
                      pageNum >= currentPage - 1 && 
                      pageNum <= currentPage + 1
                    ) {
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => handlePageChange(pageNum)}
                            isActive={currentPage === pageNum}
                            className={cn(
                              "border-white/10 text-white",
                              currentPage === pageNum 
                                ? "bg-green-600 hover:bg-green-700" 
                                : "bg-white/5 hover:bg-white/10"
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
                      onClick={() => handlePageChange(totalPages)}
                      isActive={currentPage === totalPages}
                      className={cn(
                        "border-white/10 text-white",
                        currentPage === totalPages 
                          ? "bg-green-600 hover:bg-green-700" 
                          : "bg-white/5 hover:bg-white/10"
                      )}
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  className={cn(
                    "border-white/10 bg-white/5 hover:bg-white/10 text-white",
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
  );
}
