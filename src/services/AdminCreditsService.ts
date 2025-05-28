
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserCredit {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  credits_remaining: number;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  admin_user_id: string;
  amount: number;
  previous_balance: number;
  new_balance: number;
  transaction_type: 'add' | 'remove' | 'set';
  reason: string | null;
  created_at: string;
}

export class AdminCreditsService {
  static async fetchAllUserCredits(): Promise<UserCredit[]> {
    try {
      // Buscar todos os usuários com seus créditos
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name');

      if (profilesError) throw profilesError;

      // Buscar créditos dos usuários
      const { data: credits, error: creditsError } = await supabase
        .from('user_invoice_credits')
        .select('user_id, credits_remaining, updated_at');

      if (creditsError) throw creditsError;

      // Combinar dados dos usuários com seus créditos
      const userCredits: UserCredit[] = profiles.map(profile => {
        const userCredit = credits.find(c => c.user_id === profile.id);
        return {
          user_id: profile.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: `user-${profile.id.substring(0, 8)}@pagora.app`,
          credits_remaining: userCredit?.credits_remaining || 0,
          updated_at: userCredit?.updated_at || new Date().toISOString()
        };
      });

      return userCredits;
    } catch (error) {
      console.error('Error fetching user credits:', error);
      toast.error('Erro ao carregar créditos dos usuários');
      return [];
    }
  }

  static async updateUserCredits(
    userId: string, 
    newAmount: number, 
    transactionType: 'add' | 'remove' | 'set',
    reason?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('admin_update_user_credits', {
        target_user_id: userId,
        new_amount: newAmount,
        transaction_type: transactionType,
        reason: reason || null
      });

      if (error) throw error;

      toast.success('Créditos atualizados com sucesso');
      return true;
    } catch (error) {
      console.error('Error updating user credits:', error);
      toast.error('Erro ao atualizar créditos');
      return false;
    }
  }

  static async fetchCreditTransactions(userId?: string): Promise<CreditTransaction[]> {
    try {
      let query = supabase
        .from('credit_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fazer type assertion para garantir que transaction_type seja do tipo correto
      return (data || []).map(transaction => ({
        ...transaction,
        transaction_type: transaction.transaction_type as 'add' | 'remove' | 'set'
      }));
    } catch (error) {
      console.error('Error fetching credit transactions:', error);
      toast.error('Erro ao carregar histórico de transações');
      return [];
    }
  }

  static async getCreditStats() {
    try {
      // Total de créditos em circulação
      const { data: totalCredits, error: totalError } = await supabase
        .from('user_invoice_credits')
        .select('credits_remaining');

      if (totalError) throw totalError;

      const totalCreditsInCirculation = totalCredits?.reduce(
        (sum, user) => sum + (user.credits_remaining || 0), 
        0
      ) || 0;

      // Usuários com créditos zerados
      const usersWithZeroCredits = totalCredits?.filter(
        user => (user.credits_remaining || 0) === 0
      ).length || 0;

      return {
        totalCreditsInCirculation,
        usersWithZeroCredits,
        totalUsers: totalCredits?.length || 0
      };
    } catch (error) {
      console.error('Error fetching credit stats:', error);
      return {
        totalCreditsInCirculation: 0,
        usersWithZeroCredits: 0,
        totalUsers: 0
      };
    }
  }
}
