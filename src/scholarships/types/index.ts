// ScholarshipFilters interface
export interface ScholarshipFilters {
  search?: string;
  location?: string;
  amount_min?: number;
  amount_max?: number;
  deadline_after?: string;
  course?: string;
  page?: number;
  page_size?: number;
  show_expired?: boolean;
}

// Scholarship interface
export interface Scholarship {
  id: string | number;
  title: string;
  source: string;
  amount?: string;
  deadline?: string;
  location: string;
  course?: string;
  gpa?: string;
  scraped_at?: string;
  application_link?: string;
  url?: string;
  description?: string;
  is_saved?: boolean;
  is_applied?: boolean;
  similarity_score?: number;
}

export interface ScholarshipsResponse {
  results: Scholarship[];
  count: number;
  next?: string;
  previous?: string;
}