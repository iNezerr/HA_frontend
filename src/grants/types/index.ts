// Grant interface
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
  saved_grant_id?: string;
}

// GrantFilters interface
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

// GrantsResponse interface
export interface GrantsResponse {
  results: Grant[];
  count: number;
  next: string | null;
  previous: string | null;
}

// GrantInteraction interface
export interface GrantInteraction {
  grant_id: string;
  is_saved: boolean;
  is_applied: boolean;
  saved_at?: string;
  applied_at?: string;
}
