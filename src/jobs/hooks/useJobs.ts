import { useState, useEffect, useCallback } from 'react';
import { Job, JobFilters, JobsResponse } from '../types';
import { getDashboardJobs, getJobs, toggleSaveJob, applyToJob } from '../services/jobsApi';

export const useJobs = (filters: JobFilters = {}, useDashboard: boolean = true) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchJobs = useCallback(async (filterParams: JobFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response: JobsResponse = useDashboard 
        ? await getDashboardJobs({ ...filters, ...filterParams })
        : await getJobs({ ...filters, ...filterParams });

      setJobs(response.results || []);
      setTotalCount(response.count || 0);
      setHasMore(!!response.next);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch jobs';
      setError(errorMessage);
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, useDashboard]);

  const saveJob = useCallback(async (jobId: string) => {
    try {
      const response = await toggleSaveJob(jobId);
      
      // Update the job in state
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId 
            ? { ...job, is_saved: response.is_saved }
            : job
        )
      );

      return response;
    } catch (err) {
      console.error('Error saving job:', err);
      throw err;
    }
  }, []);

  const applyJob = useCallback(async (jobId: string, applicationData?: any) => {
    try {
      const response = await applyToJob(jobId, applicationData);
      
      // Update the job in state
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId 
            ? { ...job, is_applied: true }
            : job
        )
      );

      return response;
    } catch (err) {
      console.error('Error applying to job:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return {
    jobs,
    loading,
    error,
    totalCount,
    hasMore,
    fetchJobs,
    saveJob,
    applyJob,
    refetch: () => fetchJobs()
  };
};
