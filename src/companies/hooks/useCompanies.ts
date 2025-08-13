/**
 * Companies Hook
 * Manages company data and operations
 */

import { useCallback } from 'react';
import { useAPI } from '../../hooks/useAPI';
import { useMutation } from '../../hooks/useMutation';
import { 
  CompanyAPI, 
  Company,
  CompanySearchParams,
  CompanyReview,
  CreateReviewRequest 
} from '../services/companyAPI';
import { ApiError } from '../../services/apiClient';

export interface UseCompaniesOptions {
  onFollowSuccess?: (company: Company) => void;
  onReviewSuccess?: (review: CompanyReview) => void;
  onError?: (error: ApiError) => void;
}

export interface UseCompaniesResult {
  // Data
  trendingCompanies: Company[] | null;
  followedCompanies: Company[] | null;
  
  // Loading states
  isLoadingTrending: boolean;
  isLoadingFollowed: boolean;
  
  // Error states
  trendingError: ApiError | null;
  followedError: ApiError | null;
  
  // Actions
  searchCompanies: (params: CompanySearchParams) => Promise<any>;
  getCompanyById: (companyId: string) => Promise<Company>;
  getCompanyByName: (companyName: string) => Promise<Company>;
  getCompanyJobs: (companyId: string, page?: number, limit?: number) => Promise<any>;
  getCompanyReviews: (companyId: string, page?: number, limit?: number, sortBy?: string) => Promise<any>;
  createReview: (reviewData: CreateReviewRequest) => Promise<CompanyReview>;
  followCompany: (companyId: string) => Promise<{ success: boolean }>;
  unfollowCompany: (companyId: string) => Promise<{ success: boolean }>;
  
  // Refresh functions
  refreshTrending: () => Promise<void>;
  refreshFollowed: () => Promise<void>;
  
  // Mutation states
  followMutation: {
    isLoading: boolean;
    error: ApiError | null;
    isSuccess: boolean;
  };
  reviewMutation: {
    isLoading: boolean;
    error: ApiError | null;
    isSuccess: boolean;
  };
}

export function useCompanies(options: UseCompaniesOptions = {}): UseCompaniesResult {
  const { onFollowSuccess, onReviewSuccess, onError } = options;

  // Get trending companies
  const {
    data: trendingCompanies,
    isLoading: isLoadingTrending,
    error: trendingError,
    refetch: refreshTrending,
  } = useAPI(
    () => CompanyAPI.getTrendingCompanies(10),
    'trending-companies',
    {
      enabled: true,
      refetchOnMount: true,
      staleTime: 30 * 60 * 1000, // 30 minutes
      onError,
    }
  );

  // Get followed companies
  const {
    data: followedCompaniesData,
    isLoading: isLoadingFollowed,
    error: followedError,
    refetch: refreshFollowed,
  } = useAPI(
    () => CompanyAPI.getFollowedCompanies(1, 50),
    'followed-companies',
    {
      enabled: true,
      refetchOnMount: true,
      staleTime: 10 * 60 * 1000, // 10 minutes
      onError,
    }
  );

  // Follow company mutation
  const followMutation = useMutation(
    ({ companyId, action }: { companyId: string; action: 'follow' | 'unfollow' }) => {
      return action === 'follow' 
        ? CompanyAPI.followCompany(companyId)
        : CompanyAPI.unfollowCompany(companyId);
    },
    {
      onSuccess: async (_result: { success: boolean }, { companyId }) => {
        // Refresh followed companies list
        await refreshFollowed();
        
        // Get company details and call success callback
        try {
          const company = await CompanyAPI.getCompanyById(companyId);
          onFollowSuccess?.(company);
        } catch (error) {
          console.error('Error fetching company details:', error);
        }
      },
      onError,
    }
  );

  // Create review mutation
  const reviewMutation = useMutation(
    (reviewData: CreateReviewRequest) => CompanyAPI.createReview(reviewData),
    {
      onSuccess: async (review: CompanyReview) => {
        onReviewSuccess?.(review);
      },
      onError,
    }
  );

  // Search companies function
  const searchCompanies = useCallback(async (params: CompanySearchParams) => {
    return CompanyAPI.searchCompanies(params);
  }, []);

  // Get company by ID function
  const getCompanyById = useCallback(async (companyId: string): Promise<Company> => {
    return CompanyAPI.getCompanyById(companyId);
  }, []);

  // Get company by name function
  const getCompanyByName = useCallback(async (companyName: string): Promise<Company> => {
    return CompanyAPI.getCompanyByName(companyName);
  }, []);

  // Get company jobs function
  const getCompanyJobs = useCallback(async (
    companyId: string, 
    page: number = 1, 
    limit: number = 20
  ) => {
    return CompanyAPI.getCompanyJobs(companyId, page, limit);
  }, []);

  // Get company reviews function
  const getCompanyReviews = useCallback(async (
    companyId: string, 
    page: number = 1, 
    limit: number = 20,
    sortBy?: string
  ) => {
    const validSortBy = ['newest', 'oldest', 'helpful', 'rating'].includes(sortBy || 'newest') 
      ? (sortBy as 'newest' | 'oldest' | 'helpful' | 'rating') 
      : 'newest';
    return CompanyAPI.getCompanyReviews(companyId, page, limit, validSortBy);
  }, []);

  // Action functions
  const createReview = useCallback(async (reviewData: CreateReviewRequest): Promise<CompanyReview> => {
    return reviewMutation.mutate(reviewData);
  }, [reviewMutation.mutate]);

  const followCompany = useCallback(async (companyId: string): Promise<{ success: boolean }> => {
    return followMutation.mutate({ companyId, action: 'follow' });
  }, [followMutation.mutate]);

  const unfollowCompany = useCallback(async (companyId: string): Promise<{ success: boolean }> => {
    return followMutation.mutate({ companyId, action: 'unfollow' });
  }, [followMutation.mutate]);

  const followedCompanies = followedCompaniesData?.companies || null;

  return {
    // Data
    trendingCompanies,
    followedCompanies,
    
    // Loading states
    isLoadingTrending,
    isLoadingFollowed,
    
    // Error states
    trendingError,
    followedError,
    
    // Actions
    searchCompanies,
    getCompanyById,
    getCompanyByName,
    getCompanyJobs,
    getCompanyReviews,
    createReview,
    followCompany,
    unfollowCompany,
    
    // Refresh functions
    refreshTrending,
    refreshFollowed,
    
    // Mutation states
    followMutation: {
      isLoading: followMutation.isLoading,
      error: followMutation.error,
      isSuccess: followMutation.isSuccess,
    },
    reviewMutation: {
      isLoading: reviewMutation.isLoading,
      error: reviewMutation.error,
      isSuccess: reviewMutation.isSuccess,
    },
  };
}

export default useCompanies;
