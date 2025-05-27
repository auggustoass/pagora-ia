
import { useState, useEffect } from 'react';
import { AdminCreditsService, UserCredit, CreditTransaction } from '@/services/AdminCreditsService';

export function useAdminCredits() {
  const [userCredits, setUserCredits] = useState<UserCredit[]>([]);
  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>([]);
  const [creditStats, setCreditStats] = useState({
    totalCreditsInCirculation: 0,
    usersWithZeroCredits: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchUserCredits = async () => {
    setLoading(true);
    try {
      const credits = await AdminCreditsService.fetchAllUserCredits();
      setUserCredits(credits);
    } finally {
      setLoading(false);
    }
  };

  const fetchCreditStats = async () => {
    const stats = await AdminCreditsService.getCreditStats();
    setCreditStats(stats);
  };

  const fetchCreditTransactions = async (userId?: string) => {
    const transactions = await AdminCreditsService.fetchCreditTransactions(userId);
    setCreditTransactions(transactions);
  };

  const updateUserCredits = async (
    userId: string, 
    newAmount: number, 
    transactionType: 'add' | 'remove' | 'set',
    reason?: string
  ) => {
    const success = await AdminCreditsService.updateUserCredits(
      userId, 
      newAmount, 
      transactionType, 
      reason
    );
    
    if (success) {
      await fetchUserCredits();
      await fetchCreditStats();
      await fetchCreditTransactions();
    }
    
    return success;
  };

  useEffect(() => {
    fetchUserCredits();
    fetchCreditStats();
    fetchCreditTransactions();
  }, []);

  return {
    userCredits,
    creditTransactions,
    creditStats,
    loading,
    updateUserCredits,
    fetchCreditTransactions,
    refetch: () => {
      fetchUserCredits();
      fetchCreditStats();
      fetchCreditTransactions();
    }
  };
}
