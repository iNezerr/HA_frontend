export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  employment_type: 'full-time' | 'part-time' | 'contract' | 'internship';
  experience_level: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  salary_range?: string;
  description: string;
  requirements?: string[];
  skills_required?: string[];
  application_deadline?: string;
  url?: string;
  saved_job_id?: string;
  created_at: string;
  is_active: boolean;
  is_saved?: boolean;
  is_applied?: boolean;
  apply_link?: string;
  application_url?:  string;
  similarity_score?: number;
  opportunity_type: 'job';
}

export interface JobFilters {
  search?: string;
  location?: string;
  employment_type?: string;
  experience_level?: string;
  salary_min?: number;
  salary_max?: number;
  company?: string;
  skills?: string[];
  ordering?: string;
  show_expired?: boolean;
  page?: number;
  page_size?: number;
}

export interface JobsResponse {
  results: Job[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface JobInteraction {
  job_id: string;
  is_saved: boolean;
  is_applied: boolean;
  saved_at?: string;
  applied_at?: string;
}
