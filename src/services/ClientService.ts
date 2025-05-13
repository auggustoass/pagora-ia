
import { ApiService } from './ApiService';
import { toast } from '@/components/ui/use-toast';

export class ClientService {
  /**
   * Creates a new client via the secure backend
   */
  static async createClient(clientData: any) {
    try {
      const result = await ApiService.createClient(clientData);
      return result;
    } catch (error: any) {
      toast({
        title: "Erro ao criar cliente",
        description: error.message || "Não foi possível criar o cliente. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  }
  
  /**
   * Lists clients that belong to the current user
   */
  static async listClients(filters?: any) {
    try {
      const result = await ApiService.listClients(filters);
      return result;
    } catch (error: any) {
      toast({
        title: "Erro ao listar clientes",
        description: error.message || "Não foi possível carregar os clientes. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  }
}
