import { apiClient } from '../../services/apiClient';

const client = apiClient;

const GRANTS_API_BASE = '/opportunities/grants';
const APPLICATIONS_API_BASE = '/applications';

export interface Grant {
  id: string;
  title: string;
  organization: string;
  location: string;
  funding_amount?: string;
  deadline?: string;
  description?: string;
  eligibility?: string;
  application_url?: string;
  created_at?: string;
  is_active: boolean;
  is_saved?: boolean;
  is_applied?: boolean;
  similarity_score?: number;
  opportunity_type: 'grant';
}

export interface GrantFilters {
  search?: string;
  location?: string;
  funding_min?: number;
  funding_max?: number;
  deadline_after?: string;
  organization?: string;
  ordering?: string;
  show_expired?: boolean;
  page?: number;
  page_size?: number;
}

export interface GrantsResponse {
  results: Grant[];
  count: number;
  next?: string;
  previous?: string;
}

export interface GrantInteraction {
  grant_id: string;
  is_saved: boolean;
  is_applied: boolean;
  saved_at?: string;
  applied_at?: string;
}

/**
 * Get grants based on filters
 */
export const getGrants = async (filters: GrantFilters = {}): Promise<GrantsResponse> => {
  const params = new URLSearchParams();

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
  const endpoint = `${GRANTS_API_BASE}/${queryString ? `?${queryString}` : ''}`;

  return client.get(endpoint);
};

/**
 * Get dashboard feed with AI-matched grant opportunities
 */
export const getDashboardGrants = async (filters: GrantFilters = {}): Promise<GrantsResponse> => {
  return getGrants(filters);
};

/**
 * Get a specific grant by ID
 */
export const getGrant = async (grantId: string): Promise<Grant> => {
  return client.get(`${GRANTS_API_BASE}/${grantId}/`);
};

/**
 * Create a new grant
 */
export const createGrant = async (grantData: Partial<Grant>): Promise<Grant> => {
  return client.post(`${GRANTS_API_BASE}/`, grantData);
};

/**
 * Update an existing grant (full update)
 */
export const updateGrant = async (grantId: string, grantData: Partial<Grant>): Promise<Grant> => {
  return client.put(`${GRANTS_API_BASE}/${grantId}/`, grantData);
};

/**
 * Partially update a grant
 */
export const patchGrant = async (grantId: string, grantData: Partial<Grant>): Promise<Grant> => {
  return client.patch(`${GRANTS_API_BASE}/${grantId}/`, grantData);
};

/**
 * Delete a grant
 */
export const deleteGrant = async (grantId: string): Promise<void> => {
  return client.delete(`${GRANTS_API_BASE}/${grantId}/`);
};

/**
 * Search for similar grants by embedding
 */
export const searchSimilarGrants = async (searchData: {
  query?: string;
  embedding?: number[];
  top_k?: number;
}): Promise<GrantsResponse> => {
  return client.post(`${GRANTS_API_BASE}/search_similar/`, searchData);
};

/**
 * Save/unsave a grant
 */
export const toggleSaveGrant = async (grantId: string): Promise<GrantInteraction> => {
  return client.post(`${APPLICATIONS_API_BASE}/opportunities/${grantId}/save/`);
};

/**
 * Apply to a grant
 */
export const applyToGrant = async (
  grantId: string,
  applicationData?: any
): Promise<{ success: boolean; application_id: string }> => {
  return client.post(`${APPLICATIONS_API_BASE}/opportunities/${grantId}/apply/`, applicationData);
};

/**
 * Get saved grants
 */
export const getSavedGrants = async (filters: GrantFilters = {}): Promise<GrantsResponse> => {
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
 * Get applied grants
 */
export const getAppliedGrants = async (): Promise<{
  total_applications: number;
  applications: Array<{
    id: string;
    grant: Grant;
    status: string;
    applied_at: string;
    last_updated: string;
  }>;
}> => {
  return client.get(`${APPLICATIONS_API_BASE}/applications/`);
};