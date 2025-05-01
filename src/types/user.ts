
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  created_at: string;
  is_admin: boolean;
}

export interface UserFilters {
  search: string;
  role: string | null;
}
