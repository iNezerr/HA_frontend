import { useState, useEffect, useCallback } from 'react';
import { Grant, GrantFilters, GrantsResponse } from '../types';
import { 
  getDashboardGrants, 
  getGrants, 
  toggleSaveGrant, 
  applyToGrant 
} from '../services/grantsApi';

export const useGrants = (filters: GrantFilters = {}, useDashboard: boolean = true) => {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchGrants = useCallback(async (filterParams: GrantFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response: GrantsResponse = useDashboard 
        ? await getDashboardGrants({ ...filters, ...filterParams })
        : await getGrants({ ...filters, ...filterParams });

      setGrants(response.results || []);
      setTotalCount(response.count || 0);
      setHasMore(!!response.next);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch grants';
      setError(errorMessage);
      console.error('Error fetching grants:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, useDashboard]);

  const saveGrant = useCallback(async (grantId: string) => {
    try {
      const response = await toggleSaveGrant(grantId);
      
      setGrants(prevGrants => 
        prevGrants.map(grant => 
          grant.id === grantId 
            ? { ...grant, is_saved: response.is_saved }
            : grant
        )
      );

      return response;
    } catch (err) {
      console.error('Error saving grant:', err);
      throw err;
    }
  }, []);

  const applyGrant = useCallback(async (grantId: string, applicationData?: any) => {
    try {
      const response = await applyToGrant(grantId, applicationData);
      
      setGrants(prevGrants => 
        prevGrants.map(grant => 
          grant.id === grantId 
            ? { ...grant, is_applied: true }
            : grant
        )
      );

      return response;
    } catch (err) {
      console.error('Error applying to grant:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchGrants();
  }, [fetchGrants]);

  return {
    grants,
    loading,
    error,
    totalCount,
    hasMore,
    fetchGrants,
    saveGrant,
    applyGrant,
    refetch: () => fetchGrants()
  };
};