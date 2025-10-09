import { apiClient } from '../../services/apiClient';

// Use apiClient directly (it's already the singleton instance)
const client = apiClient;

const SCHOLARSHIPS_API_BASE = '/opportunities/scholarships';
const APPLICATIONS_API_BASE = '/applications';

// Scholarship interface
export interface Scholarship {
  id: string;
  title: string;
  source: string;
  location: string;
  amount?: string;
  deadline?: string;
  course?: string;
  gpa?: string;
  description?: string;
  url?: string;
  scraped_at?: string;
  is_active: boolean;
  is_saved?: boolean;
  is_applied?: boolean;
  similarity_score?: number;
  opportunity_type: 'scholarship';
  saved_scholarship_id?: string;
}

// ScholarshipFilters interface
export interface ScholarshipFilters {
  search?: string;
  location?: string;
  amount_min?: number;
  amount_max?: number;
  deadline_after?: string;
  course?: string;
  gpa?: string;
  source?: string;
  ordering?: string;
  show_expired?: boolean;
  page?: number;
  page_size?: number;
}

// ScholarshipsResponse interface
export interface ScholarshipsResponse {
  results: Scholarship[];
  count: number;
  next: string | null;
  previous: string | null;
}

// ScholarshipInteraction interface
export interface ScholarshipInteraction {
  scholarship_id: string;
  is_saved: boolean;
  is_applied: boolean;
  saved_at?: string;
  applied_at?: string;
}

/**
 * Get scholarships based on filters
 */
export const getScholarships = async (filters: ScholarshipFilters = {}): Promise<ScholarshipsResponse> => {
  const params = new URLSearchParams();

  // Add filter parameters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, v.toString()));
      } else {
        params.append(key, value.toString());
      }
    }
  });

  const queryString = params.toString();
  const endpoint = `${SCHOLARSHIPS_API_BASE}/${queryString ? `?${queryString}` : ''}`;

  return client.get(endpoint);
};

/**
 * Get dashboard feed with AI-matched scholarship opportunities
 * Note: Using same endpoint as getScholarships since backend doesn't have separate dashboard endpoint
 * Backend will return AI-matched scholarships based on user profile automatically
 */
export const getDashboardScholarships = async (filters: ScholarshipFilters = {}): Promise<ScholarshipsResponse> => {
  // Use the same scholarships endpoint - backend should handle AI matching automatically
  // based on authenticated user's profile
  return getScholarships(filters);
};

/**
 * Get a specific scholarship by ID
 */
export const getScholarship = async (scholarshipId: string): Promise<Scholarship> => {
  return client.get(`${SCHOLARSHIPS_API_BASE}/${scholarshipId}/`);
};

/**
 * Create a new scholarship
 */
export const createScholarship = async (scholarshipData: Partial<Scholarship>): Promise<Scholarship> => {
  return client.post(`${SCHOLARSHIPS_API_BASE}/`, scholarshipData);
};

/**
 * Update an existing scholarship (full update)
 */
export const updateScholarship = async (scholarshipId: string, scholarshipData: Partial<Scholarship>): Promise<Scholarship> => {
  return client.put(`${SCHOLARSHIPS_API_BASE}/${scholarshipId}/`, scholarshipData);
};

/**
 * Partially update a scholarship
 */
export const patchScholarship = async (scholarshipId: string, scholarshipData: Partial<Scholarship>): Promise<Scholarship> => {
  return client.patch(`${SCHOLARSHIPS_API_BASE}/${scholarshipId}/`, scholarshipData);
};

/**
 * Delete a scholarship
 */
export const deleteScholarship = async (scholarshipId: string): Promise<void> => {
  return client.delete(`${SCHOLARSHIPS_API_BASE}/${scholarshipId}/`);
};

/**
 * Search for similar scholarships by embedding
 */
export const searchSimilarScholarships = async (searchData: {
  query?: string;
  embedding?: number[];
  top_k?: number;
}): Promise<ScholarshipsResponse> => {
  return client.post(`${SCHOLARSHIPS_API_BASE}/search_similar/`, searchData);
};

/**
 * Save/unsave a scholarship
 */
export const toggleSaveScholarship = async (scholarshipId: string): Promise<ScholarshipInteraction> => {
  return client.post(`${APPLICATIONS_API_BASE}/opportunities/${scholarshipId}/save/`);
};

/**
 * Apply to a scholarship
 */
export const applyToScholarship = async (
  scholarshipId: string, 
  applicationData?: any
): Promise<{ success: boolean; application_id: string }> => {
  return client.post(`${APPLICATIONS_API_BASE}/opportunities/${scholarshipId}/apply/`, applicationData);
};

/**
 * Get saved scholarships
 */
export const getSavedScholarships = async (filters: ScholarshipFilters = {}): Promise<ScholarshipsResponse> => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString());
    }
  });

  const queryString = params.toString();
  const endpoint = `${APPLICATIONS_API_BASE}/saved/${queryString ? `?${queryString}` : ''}`;

  return client.get(endpoint);
};

/**
 * Get applied scholarships
 */
export const getAppliedScholarships = async (): Promise<{
  total_applications: number;
  applications: Array<{
    id: string;
    scholarship: Scholarship;
    status: string;
    applied_at: string;
    last_updated: string;
  }>;
}> => {
  return client.get(`${APPLICATIONS_API_BASE}/applications/`);
};
