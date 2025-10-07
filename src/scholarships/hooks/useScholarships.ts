import { useState, useEffect, useCallback } from 'react';
import { Scholarship, ScholarshipFilters, ScholarshipsResponse } from '../types';
import { 
  getDashboardScholarships, 
  getScholarships, 
  toggleSaveScholarship, 
  applyToScholarship 
} from '../services/scholarshipsApi';

export const useScholarships = (filters: ScholarshipFilters = {}, useDashboard: boolean = true) => {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchScholarships = useCallback(async (filterParams: ScholarshipFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response: ScholarshipsResponse = useDashboard 
        ? await getDashboardScholarships({ ...filters, ...filterParams })
        : await getScholarships({ ...filters, ...filterParams });

      setScholarships(response.results || []);
      setTotalCount(response.count || 0);
      setHasMore(!!response.next);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch scholarships';
      setError(errorMessage);
      console.error('Error fetching scholarships:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, useDashboard]);

  const saveScholarship = useCallback(async (scholarshipId: string) => {
    try {
      const response = await toggleSaveScholarship(scholarshipId);
      
      // Update the scholarship in state
      setScholarships(prevScholarships => 
        prevScholarships.map(scholarship => 
          scholarship.id === scholarshipId 
            ? { ...scholarship, is_saved: response.is_saved }
            : scholarship
        )
      );

      return response;
    } catch (err) {
      console.error('Error saving scholarship:', err);
      throw err;
    }
  }, []);

  const applyScholarship = useCallback(async (scholarshipId: string, applicationData?: any) => {
    try {
      const response = await applyToScholarship(scholarshipId, applicationData);
      
      // Update the scholarship in state
      setScholarships(prevScholarships => 
        prevScholarships.map(scholarship => 
          scholarship.id === scholarshipId 
            ? { ...scholarship, is_applied: true }
            : scholarship
        )
      );

      return response;
    } catch (err) {
      console.error('Error applying to scholarship:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchScholarships();
  }, [fetchScholarships]);

  return {
    scholarships,
    loading,
    error,
    totalCount,
    hasMore,
    fetchScholarships,
    saveScholarship,
    applyScholarship,
    refetch: () => fetchScholarships()
  };
};