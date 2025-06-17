
export interface DateRange {
  from: Date;
  to: Date;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  message?: string;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
}

export interface FormFieldProps {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'date' | 'textarea';
}
