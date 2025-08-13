/**
 * Company API Service
 * Handles all company-related API calls
 */

import { apiClient } from '../../services/apiClient';

// Types for companies
export interface Company {
  id: string;
  name: string;
  description: string;
  website: string;
  logo?: string;
  industry: string;
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  location: {
    headquarters: string;
    offices: string[];
  };
  foundedYear?: number;
  employeeCount?: {
    min: number;
    max: number;
  };
  companyType: 'public' | 'private' | 'nonprofit' | 'government';
  benefits: string[];
  culture: string[];
  socialMedia: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  rating?: {
    overall: number;
    workLifeBalance: number;
    compensation: number;
    culture: number;
    careerOpportunities: number;
    management: number;
    reviewCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CompanySearchParams {
  query?: string;
  industry?: string[];
  size?: Company['size'][];
  location?: string[];
  companyType?: Company['companyType'][];
  hasJobs?: boolean;
  ratingMin?: number;
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'name' | 'rating' | 'size';
  sortOrder?: 'asc' | 'desc';
}

export interface CompanySearchResponse {
  companies: Company[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface CompanyReview {
  id: string;
  companyId: string;
  userId: string;
  rating: {
    overall: number;
    workLifeBalance: number;
    compensation: number;
    culture: number;
    careerOpportunities: number;
    management: number;
  };
  title: string;
  pros: string;
  cons: string;
  advice?: string;
  position: string;
  isCurrentEmployee: boolean;
  workDuration: string;
  isAnonymous: boolean;
  createdAt: string;
  helpful: number;
  company: Pick<Company, 'id' | 'name' | 'logo'>;
}

export interface CreateReviewRequest {
  companyId: string;
  rating: CompanyReview['rating'];
  title: string;
  pros: string;
  cons: string;
  advice?: string;
  position: string;
  isCurrentEmployee: boolean;
  workDuration: string;
  isAnonymous: boolean;
}

// Company API Service
export class CompanyAPI {
  private static readonly BASE_PATH = '/companies';

  /**
   * Search companies with filters
   */
  static async searchCompanies(params: CompanySearchParams): Promise<CompanySearchResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v.toString()));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    return apiClient.get(`${this.BASE_PATH}/search?${queryParams.toString()}`);
  }

  /**
   * Get company details by ID
   */
  static async getCompanyById(companyId: string): Promise<Company> {
    return apiClient.get(`${this.BASE_PATH}/${companyId}`);
  }

  /**
   * Get company by name (slug)
   */
  static async getCompanyByName(companyName: string): Promise<Company> {
    return apiClient.get(`${this.BASE_PATH}/name/${encodeURIComponent(companyName)}`);
  }

  /**
   * Get jobs for a specific company
   */
  static async getCompanyJobs(
    companyId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    jobs: any[]; // JobOpportunity from jobAPI
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }> {
    return apiClient.get(`${this.BASE_PATH}/${companyId}/jobs?page=${page}&limit=${limit}`);
  }

  /**
   * Get company reviews
   */
  static async getCompanyReviews(
    companyId: string,
    page: number = 1,
    limit: number = 20,
    sortBy: 'newest' | 'oldest' | 'helpful' | 'rating' = 'newest'
  ): Promise<{
    reviews: CompanyReview[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    averageRating: CompanyReview['rating'];
  }> {
    return apiClient.get(`${this.BASE_PATH}/${companyId}/reviews?page=${page}&limit=${limit}&sortBy=${sortBy}`);
  }

  /**
   * Create a company review
   */
  static async createReview(reviewData: CreateReviewRequest): Promise<CompanyReview> {
    return apiClient.post(`${this.BASE_PATH}/reviews`, reviewData);
  }

  /**
   * Update a company review
   */
  static async updateReview(
    reviewId: string,
    updateData: Partial<CreateReviewRequest>
  ): Promise<CompanyReview> {
    return apiClient.patch(`${this.BASE_PATH}/reviews/${reviewId}`, updateData);
  }

  /**
   * Delete a company review
   */
  static async deleteReview(reviewId: string): Promise<void> {
    return apiClient.delete(`${this.BASE_PATH}/reviews/${reviewId}`);
  }

  /**
   * Mark review as helpful
   */
  static async markReviewHelpful(reviewId: string): Promise<{ helpful: number }> {
    return apiClient.post(`${this.BASE_PATH}/reviews/${reviewId}/helpful`);
  }

  /**
   * Get top companies by industry
   */
  static async getTopCompaniesByIndustry(
    industry: string,
    limit: number = 10
  ): Promise<Company[]> {
    return apiClient.get(`${this.BASE_PATH}/top?industry=${encodeURIComponent(industry)}&limit=${limit}`);
  }

  /**
   * Get trending companies
   */
  static async getTrendingCompanies(limit: number = 10): Promise<Company[]> {
    return apiClient.get(`${this.BASE_PATH}/trending?limit=${limit}`);
  }

  /**
   * Get companies hiring now
   */
  static async getCompaniesHiring(
    location?: string,
    industry?: string,
    limit: number = 20
  ): Promise<Company[]> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (location) params.append('location', location);
    if (industry) params.append('industry', industry);

    return apiClient.get(`${this.BASE_PATH}/hiring?${params.toString()}`);
  }

  /**
   * Get similar companies
   */
  static async getSimilarCompanies(
    companyId: string,
    limit: number = 5
  ): Promise<Company[]> {
    return apiClient.get(`${this.BASE_PATH}/${companyId}/similar?limit=${limit}`);
  }

  /**
   * Get industry statistics
   */
  static async getIndustryStats(): Promise<{
    industries: {
      name: string;
      companyCount: number;
      jobCount: number;
      averageRating: number;
    }[];
  }> {
    return apiClient.get(`${this.BASE_PATH}/industries/stats`);
  }

  /**
   * Get company size distribution
   */
  static async getCompanySizeStats(): Promise<{
    sizes: {
      size: Company['size'];
      count: number;
      percentage: number;
    }[];
  }> {
    return apiClient.get(`${this.BASE_PATH}/size/stats`);
  }

  /**
   * Follow a company for updates
   */
  static async followCompany(companyId: string): Promise<{ success: boolean }> {
    return apiClient.post(`${this.BASE_PATH}/${companyId}/follow`);
  }

  /**
   * Unfollow a company
   */
  static async unfollowCompany(companyId: string): Promise<{ success: boolean }> {
    return apiClient.delete(`${this.BASE_PATH}/${companyId}/follow`);
  }

  /**
   * Get followed companies
   */
  static async getFollowedCompanies(page: number = 1, limit: number = 20): Promise<{
    companies: Company[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }> {
    return apiClient.get(`${this.BASE_PATH}/followed?page=${page}&limit=${limit}`);
  }

  /**
   * Check if company is followed
   */
  static async isCompanyFollowed(companyId: string): Promise<{ isFollowed: boolean }> {
    return apiClient.get(`${this.BASE_PATH}/${companyId}/follow/check`);
  }

  /**
   * Get company news/updates
   */
  static async getCompanyNews(
    companyId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    news: {
      id: string;
      title: string;
      content: string;
      publishedAt: string;
      source: string;
      url?: string;
    }[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }> {
    return apiClient.get(`${this.BASE_PATH}/${companyId}/news?page=${page}&limit=${limit}`);
  }
}

export default CompanyAPI;
