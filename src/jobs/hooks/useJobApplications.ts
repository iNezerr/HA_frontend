/**
 * Job Applications Hook
 * Manages job-related data and operations
 */

import { useCallback } from 'react';
import { useAPI } from '../../hooks/useAPI';
import { useMutation } from '../../hooks/useMutation';
import { 
  JobAPI, 
  JobOpportunity, 
  JobApplication, 
  SavedJob,
  JobSearchParams, 
  ApplyToJobRequest,
  UpdateApplicationRequest 
} from '../services/jobAPI';
import { ApiError } from '../../services/apiClient';

export interface UseJobApplicationsOptions {
  onApplySuccess?: (application: JobApplication) => void;
  onSaveSuccess?: (savedJob: SavedJob) => void;
  onError?: (error: ApiError) => void;
}

export interface UseJobApplicationsResult {
  // Data
  recommendations: JobOpportunity[] | null;
  applications: JobApplication[] | null;
  savedJobs: SavedJob[] | null;
  
  // Loading states
  isLoadingRecommendations: boolean;
  isLoadingApplications: boolean;
  isLoadingSavedJobs: boolean;
  
  // Error states
  recommendationsError: ApiError | null;
  applicationsError: ApiError | null;
  savedJobsError: ApiError | null;
  
  // Actions
  searchJobs: (params: JobSearchParams) => Promise<any>;
  getJobById: (jobId: string) => Promise<JobOpportunity>;
  applyToJob: (applicationData: ApplyToJobRequest) => Promise<JobApplication>;
  saveJob: (jobId: string) => Promise<SavedJob>;
  unsaveJob: (jobId: string) => Promise<void>;
  updateApplication: (applicationId: string, updateData: UpdateApplicationRequest) => Promise<JobApplication>;
  withdrawApplication: (applicationId: string) => Promise<void>;
  
  // Refresh functions
  refreshRecommendations: () => Promise<void>;
  refreshApplications: () => Promise<void>;
  refreshSavedJobs: () => Promise<void>;
  
  // Mutation states
  applyMutation: {
    isLoading: boolean;
    error: ApiError | null;
    isSuccess: boolean;
  };
  saveMutation: {
    isLoading: boolean;
    error: ApiError | null;
    isSuccess: boolean;
  };
}

export function useJobApplications(options: UseJobApplicationsOptions = {}): UseJobApplicationsResult {
  const { onApplySuccess, onSaveSuccess, onError } = options;

  // Get job recommendations
  const {
    data: recommendations,
    isLoading: isLoadingRecommendations,
    error: recommendationsError,
    refetch: refreshRecommendations,
  } = useAPI(
    () => JobAPI.getRecommendations(10),
    'job-recommendations',
    {
      enabled: true,
      refetchOnMount: true,
      staleTime: 15 * 60 * 1000, // 15 minutes
      onError,
    }
  );

  // Get user's job applications
  const {
    data: applicationsData,
    isLoading: isLoadingApplications,
    error: applicationsError,
    refetch: refreshApplications,
  } = useAPI(
    () => JobAPI.getMyApplications(1, 50),
    'job-applications',
    {
      enabled: true,
      refetchOnMount: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError,
    }
  );

  // Get saved jobs
  const {
    data: savedJobsData,
    isLoading: isLoadingSavedJobs,
    error: savedJobsError,
    refetch: refreshSavedJobs,
  } = useAPI(
    () => JobAPI.getSavedJobs(1, 50),
    'saved-jobs',
    {
      enabled: true,
      refetchOnMount: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError,
    }
  );

  // Apply to job mutation
  const applyMutation = useMutation(
    (applicationData: ApplyToJobRequest) => JobAPI.applyToJob(applicationData),
    {
      onSuccess: async (application: JobApplication) => {
        // Refresh applications list
        await refreshApplications();
        onApplySuccess?.(application);
      },
      onError,
    }
  );

  // Save job mutation
  const saveMutation = useMutation(
    (jobId: string) => JobAPI.saveJob(jobId),
    {
      onSuccess: async (savedJob: SavedJob) => {
        // Refresh saved jobs list
        await refreshSavedJobs();
        onSaveSuccess?.(savedJob);
      },
      onError,
    }
  );

  // Unsave job mutation
  const unsaveMutation = useMutation(
    (jobId: string) => JobAPI.unsaveJob(jobId),
    {
      onSuccess: async () => {
        // Refresh saved jobs list
        await refreshSavedJobs();
      },
      onError,
    }
  );

  // Update application mutation
  const updateApplicationMutation = useMutation(
    ({ applicationId, updateData }: { applicationId: string; updateData: UpdateApplicationRequest }) => 
      JobAPI.updateApplication(applicationId, updateData),
    {
      onSuccess: async () => {
        // Refresh applications list
        await refreshApplications();
      },
      onError,
    }
  );

  // Withdraw application mutation
  const withdrawApplicationMutation = useMutation(
    (applicationId: string) => JobAPI.withdrawApplication(applicationId),
    {
      onSuccess: async () => {
        // Refresh applications list
        await refreshApplications();
      },
      onError,
    }
  );

  // Search jobs function
  const searchJobs = useCallback(async (params: JobSearchParams) => {
    return JobAPI.searchJobs(params);
  }, []);

  // Get job by ID function
  const getJobById = useCallback(async (jobId: string): Promise<JobOpportunity> => {
    return JobAPI.getJobById(jobId);
  }, []);

  // Action functions
  const applyToJob = useCallback(async (applicationData: ApplyToJobRequest): Promise<JobApplication> => {
    return applyMutation.mutate(applicationData);
  }, [applyMutation.mutate]);

  const saveJob = useCallback(async (jobId: string): Promise<SavedJob> => {
    return saveMutation.mutate(jobId);
  }, [saveMutation.mutate]);

  const unsaveJob = useCallback(async (jobId: string): Promise<void> => {
    return unsaveMutation.mutate(jobId);
  }, [unsaveMutation.mutate]);

  const updateApplication = useCallback(async (
    applicationId: string, 
    updateData: UpdateApplicationRequest
  ): Promise<JobApplication> => {
    return updateApplicationMutation.mutate({ applicationId, updateData });
  }, [updateApplicationMutation.mutate]);

  const withdrawApplication = useCallback(async (applicationId: string): Promise<void> => {
    return withdrawApplicationMutation.mutate(applicationId);
  }, [withdrawApplicationMutation.mutate]);

  const applications = applicationsData?.applications || null;
  const savedJobs = savedJobsData?.savedJobs || null;

  return {
    // Data
    recommendations,
    applications,
    savedJobs,
    
    // Loading states
    isLoadingRecommendations,
    isLoadingApplications,
    isLoadingSavedJobs,
    
    // Error states
    recommendationsError,
    applicationsError,
    savedJobsError,
    
    // Actions
    searchJobs,
    getJobById,
    applyToJob,
    saveJob,
    unsaveJob,
    updateApplication,
    withdrawApplication,
    
    // Refresh functions
    refreshRecommendations,
    refreshApplications,
    refreshSavedJobs,
    
    // Mutation states
    applyMutation: {
      isLoading: applyMutation.isLoading,
      error: applyMutation.error,
      isSuccess: applyMutation.isSuccess,
    },
    saveMutation: {
      isLoading: saveMutation.isLoading,
      error: saveMutation.error,
      isSuccess: saveMutation.isSuccess,
    },
  };
}

export default useJobApplications;
