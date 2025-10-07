/**
 * Custom hook for simple AI matching
 * Provides easy access to the working simple matching API
 */

import { useState, useEffect, useCallback } from 'react';
import { getSimpleMatches, getJobMatches, getScoringInfo, MatchedOpportunity, SimpleMatchRequest } from '../services/simpleMatchingApi';
import { Job } from '../types';

interface UseSimpleMatchingOptions {
  autoLoad?: boolean;
  opportunityType?: 'job' | 'scholarship' | 'grant' | 'all';
  limit?: number;
}

interface UseSimpleMatchingReturn {
  // Data
  matches: MatchedOpportunity[];
  jobMatches: Job[];
  loading: boolean;
  error: string | null;
  
  // Actions
  loadMatches: (request?: SimpleMatchRequest) => Promise<void>;
  loadJobMatches: (limit?: number) => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
  
  // Metadata
  hasMatches: boolean;
  matchCount: number;
}

export const useSimpleMatching = (options: UseSimpleMatchingOptions = {}): UseSimpleMatchingReturn => {
  const {
    autoLoad = false,
    opportunityType = 'job',
    limit = 20
  } = options;

  const [matches, setMatches] = useState<MatchedOpportunity[]>([]);
  const [jobMatches, setJobMatches] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load general matches
  const loadMatches = useCallback(async (request?: SimpleMatchRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      const requestData = {
        opportunity_type: opportunityType,
        limit,
        ...request
      };

      console.log('🔍 Loading matches with request:', requestData);
      
      const results = await getSimpleMatches(requestData);
      setMatches(results);
      
      console.log('✅ Matches loaded:', results.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load matches';
      setError(errorMessage);
      console.error('❌ Error loading matches:', err);
    } finally {
      setLoading(false);
    }
  }, [opportunityType, limit]);

  // Load job matches specifically
  const loadJobMatches = useCallback(async (jobLimit?: number) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('💼 Loading job matches...');
      
      const results = await getJobMatches(jobLimit || limit);
      setJobMatches(results);
      
      console.log('✅ Job matches loaded:', results.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load job matches';
      setError(errorMessage);
      console.error('❌ Error loading job matches:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  // Refresh current data
  const refresh = useCallback(async () => {
    if (opportunityType === 'job') {
      await loadJobMatches();
    } else {
      await loadMatches();
    }
  }, [opportunityType, loadMatches, loadJobMatches]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      refresh();
    }
  }, [autoLoad, refresh]);

  return {
    // Data
    matches,
    jobMatches,
    loading,
    error,
    
    // Actions
    loadMatches,
    loadJobMatches,
    refresh,
    clearError,
    
    // Metadata
    hasMatches: matches.length > 0 || jobMatches.length > 0,
    matchCount: opportunityType === 'job' ? jobMatches.length : matches.length
  };
};

/**
 * Hook specifically for job matching (convenience)
 */
export const useJobMatching = (options: { autoLoad?: boolean; limit?: number } = {}) => {
  return useSimpleMatching({
    ...options,
    opportunityType: 'job'
  });
};

/**
 * Hook for scoring information
 */
export const useScoringInfo = () => {
  const [scoringInfo, setScoringInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadScoringInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const info = await getScoringInfo();
      setScoringInfo(info);
      
      console.log('✅ Scoring info loaded:', info);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load scoring info';
      setError(errorMessage);
      console.error('❌ Error loading scoring info:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadScoringInfo();
  }, [loadScoringInfo]);

  return {
    scoringInfo,
    loading,
    error,
    refresh: loadScoringInfo
  };
};
