
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

export const parseCurrency = (value: string): number => {
  const numericValue = value.replace(/[^\d,]/g, '').replace(',', '.');
  return parseFloat(numericValue) || 0;
};

export const formatCurrencyInput = (value: string): string => {
  const numericValue = value.replace(/\D/g, '');
  const formattedValue = (parseInt(numericValue) / 100).toFixed(2);
  return formattedValue.replace('.', ',');
};
