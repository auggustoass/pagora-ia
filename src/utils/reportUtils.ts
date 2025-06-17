import { toast } from 'sonner';

export { formatCurrency } from './currency';

export const exportData = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    toast.error('Não há dados para exportar');
    return;
  }
  
  // Transformar dados em CSV
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(item => Object.values(item).join(','));
  const csv = [headers, ...rows].join('\n');
  
  // Criar e baixar arquivo
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  toast.success(`Relatório ${filename} exportado com sucesso`);
};
