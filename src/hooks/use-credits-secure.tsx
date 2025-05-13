
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { CreditsService } from '@/services/CreditsService';

export function useSecureCredits() {
  const { user } = useAuth();
  const [credits, setCredits] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCredits = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userCredits = await CreditsService.getCredits();
      setCredits(userCredits);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch credits'));
      console.error('Error fetching credits:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch credits when user changes
  useEffect(() => {
    fetchCredits();
  }, [user]);

  return {
    credits,
    loading,
    error,
    refetch: fetchCredits
  };
}
