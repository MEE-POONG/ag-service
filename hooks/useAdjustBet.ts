import { useState, useCallback } from 'react';
import axios from '@/lib/axios';
import { 
  AdjustBet, 
  AdjustBetListResponse, 
  AdjustBetResponse, 
  CreateAdjustBetRequest, 
  UpdateAdjustBetRequest,
  ListAdjustBetRequest 
} from '@/types/adjustBet';

// Interface สำหรับ useAdjustBet hook
export interface UseAdjustBetReturn {
  // State
  adjustBets: AdjustBet[];
  currentAdjustBet: AdjustBet | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;

  // Actions
  fetchAdjustBets: (params?: ListAdjustBetRequest) => Promise<void>;
  fetchAdjustBet: (id: string) => Promise<AdjustBet | null>;
  createAdjustBet: (data: CreateAdjustBetRequest) => Promise<AdjustBet | null>;
  updateAdjustBet: (data: UpdateAdjustBetRequest) => Promise<AdjustBet | null>;
  deleteAdjustBet: (id: string) => Promise<boolean>;
  
  // Utilities
  clearError: () => void;
  clearCurrentAdjustBet: () => void;
  setCurrentAdjustBet: (adjustBet: AdjustBet | null) => void;
}

// Custom hook สำหรับจัดการ Adjust Bet data
export function useAdjustBet(): UseAdjustBetReturn {
  const [adjustBets, setAdjustBets] = useState<AdjustBet[]>([]);
  const [currentAdjustBet, setCurrentAdjustBet] = useState<AdjustBet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // ฟังก์ชันสำหรับดึงรายการ Adjust Bet
  const fetchAdjustBets = useCallback(async (params: ListAdjustBetRequest = {}): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await axios.get(`/api/adjust-bet?${queryParams.toString()}`);
      const data: AdjustBetListResponse = response.data;

      if (data.success && data.data) {
        setAdjustBets(data.data);
        setTotal(data.total || 0);
        setPage(data.page || 1);
        setLimit(data.limit || 10);
      } else {
        setError(data.error || 'Failed to fetch adjust bets');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err.message || 'Failed to fetch adjust bets';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ฟังก์ชันสำหรับดึง Adjust Bet เดียว
  const fetchAdjustBet = useCallback(async (id: string): Promise<AdjustBet | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/adjust-bet/${id}`);
      const data: AdjustBetResponse = response.data;

      if (data.success && data.data) {
        setCurrentAdjustBet(data.data);
        return data.data;
      } else {
        setError(data.error || 'Failed to fetch adjust bet');
        return null;
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err.message || 'Failed to fetch adjust bet';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ฟังก์ชันสำหรับสร้าง Adjust Bet ใหม่
  const createAdjustBet = useCallback(async (data: CreateAdjustBetRequest): Promise<AdjustBet | null> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axios.post('/api/adjust-bet', data);
      const result: AdjustBetResponse = response.data;

      if (result.success && result.data) {
        // Add to current list
        setAdjustBets(prev => [result.data!, ...prev]);
        setTotal(prev => prev + 1);
        return result.data;
      } else {
        setError(result.error || 'Failed to create adjust bet');
        return null;
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err.message || 'Failed to create adjust bet';
      setError(errorMessage);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // ฟังก์ชันสำหรับอัพเดท Adjust Bet
  const updateAdjustBet = useCallback(async (data: UpdateAdjustBetRequest): Promise<AdjustBet | null> => {
    if (!data.id) {
      setError('Adjust Bet ID is required');
      return null;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axios.put(`/api/adjust-bet/${data.id}`, data);
      const result: AdjustBetResponse = response.data;

      if (result.success && result.data) {
        // Update in current list
        setAdjustBets(prev => prev.map(adjustBet => 
          adjustBet.id === data.id ? result.data! : adjustBet
        ));
        
        // Update current adjust bet if it's the same one
        if (currentAdjustBet?.id === data.id) {
          setCurrentAdjustBet(result.data);
        }
        
        return result.data;
      } else {
        setError(result.error || 'Failed to update adjust bet');
        return null;
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err.message || 'Failed to update adjust bet';
      setError(errorMessage);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [currentAdjustBet]);

  // ฟังก์ชันสำหรับลบ Adjust Bet
  const deleteAdjustBet = useCallback(async (id: string): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axios.delete(`/api/adjust-bet/${id}`);
      const result: AdjustBetResponse = response.data;

      if (result.success) {
        // Remove from current list
        setAdjustBets(prev => prev.filter(adjustBet => adjustBet.id !== id));
        setTotal(prev => prev - 1);
        
        // Clear current adjust bet if it's the same one
        if (currentAdjustBet?.id === id) {
          setCurrentAdjustBet(null);
        }
        
        return true;
      } else {
        setError(result.error || 'Failed to delete adjust bet');
        return false;
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err.message || 'Failed to delete adjust bet';
      setError(errorMessage);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [currentAdjustBet]);

  // ฟังก์ชันสำหรับล้าง error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ฟังก์ชันสำหรับล้าง current adjust bet
  const clearCurrentAdjustBet = useCallback(() => {
    setCurrentAdjustBet(null);
  }, []);

  return {
    // State
    adjustBets,
    currentAdjustBet,
    isLoading,
    isSubmitting,
    error,
    total,
    page,
    limit,

    // Actions
    fetchAdjustBets,
    fetchAdjustBet,
    createAdjustBet,
    updateAdjustBet,
    deleteAdjustBet,

    // Utilities
    clearError,
    clearCurrentAdjustBet,
    setCurrentAdjustBet,
  };
}
