import { useState, useEffect, useCallback } from 'react';
import { Job, JobFilters } from '../types';
import { getDashboardJobs, getJobs, toggleSaveJob, applyToJob, getSavedJobs } from '../services/jobsApi';

export const useJobs = (filters: JobFilters = {}, useDashboard: boolean = true) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchJobs = useCallback(async (additionalFilters: JobFilters = {}) => {
  setLoading(true);
  setError(null);

  try {
    const mergedFilters = { ...filters, ...additionalFilters };
    const response = useDashboard 
      ? await getDashboardJobs(mergedFilters)
      : await getJobs(mergedFilters, true); // Pass true for public access

    // For public access, don't fetch saved jobs
    if (!useDashboard) {
      const jobsWithSavedStatus = response.results.map((job: Job) => ({
        ...job,
        is_saved: false, // Default false for public view
        is_applied: false
      }));

      setJobs(jobsWithSavedStatus);
      setTotalCount(response.count || 0);
      setHasMore(!!response.next);
    } else {
      // Get saved jobs to mark which ones are saved (only for authenticated users)
      const savedJobsResponse = await getSavedJobs({ page: 1, page_size: 1000 });
      const savedJobIds = new Set(
        savedJobsResponse.results?.map((item: any) => 
          String(item.opportunity_details?.id || item.id)
        ) || []
      );

      const jobsWithSavedStatus = response.results.map((job: Job) => ({
        ...job,
        is_saved: savedJobIds.has(String(job.id))
      }));

      setJobs(jobsWithSavedStatus);
      setTotalCount(response.count || 0);
      setHasMore(!!response.next);
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
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
            ? { 
                ...job, 
                is_saved: response.is_saved !== undefined 
                  ? response.is_saved 
                  : !job.is_saved  
              }
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
