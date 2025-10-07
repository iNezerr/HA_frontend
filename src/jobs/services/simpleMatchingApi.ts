/**
 * Simple Matching API Service for Demo
 * Integrates with the working backend simple matching endpoint
 */

import { apiClient } from '../../services/apiClient';
import { Job } from '../types';

export interface SimpleMatchRequest {
  user_id?: string;
  limit?: number;
  opportunity_type?: 'job' | 'scholarship' | 'grant' | 'all';
}

export interface SimpleMatchResponse {
  opportunities: MatchedOpportunity[];
  total_found: number;
  user_type: string;
  matching_method: string;
}

export interface MatchedOpportunity {
  id: string;
  title: string;
  company?: string;
  organization?: string;
  location: string;
  employment_type?: string;
  experience_level?: string;
  description: string;
  salary_range?: string;
  similarity: number;
  match_score: number;
  opportunity_type: 'job' | 'scholarship' | 'grant';
}

/**
 * Get simple AI matches for current user using vector similarity
 */
export const getSimpleMatches = async (
  request: SimpleMatchRequest = {}
): Promise<MatchedOpportunity[]> => {
  try {
    const requestData = {
      limit: 20,
      opportunity_type: 'job',
      ...request
    };

    console.log('🔍 Requesting simple matches:', requestData);

    const response = await apiClient.post<SimpleMatchResponse>(
      '/opportunities/match/simple_match/',
      requestData
    );

    console.log('✅ Simple matches received:', response);

    return response.opportunities || [];
  } catch (error) {
    console.error('❌ Simple matching failed:', error);
    throw error;
  }
};

/**
 * Get job matches specifically (convenience method)
 */
export const getJobMatches = async (limit: number = 20): Promise<Job[]> => {
  try {
    const matches = await getSimpleMatches({
      opportunity_type: 'job',
      limit
    });

    // Convert to Job format for compatibility
    return matches
      .filter(match => match.opportunity_type === 'job')
      .map(match => ({
        id: match.id,
        title: match.title,
        company: match.company || 'Unknown Company',
        location: match.location,
        employment_type: (match.employment_type as any) || 'full-time',
        experience_level: (match.experience_level as any) || 'entry',
        salary_range: match.salary_range,
        description: match.description,
        requirements: [],
        skills_required: [],
        created_at: new Date().toISOString(),
        is_active: true,
        similarity_score: match.match_score,
        opportunity_type: 'job' as const
      }));
  } catch (error) {
    console.error('❌ Job matching failed:', error);
    return [];
  }
};

/**
 * Get scoring information from backend
 */
export const getScoringInfo = async () => {
  try {
    console.log('📊 Getting scoring info...');
    
    const response = await apiClient.get('/opportunities/match/scoring_info/');
    
    console.log('✅ Scoring info received:', response);
    
    return response;
  } catch (error) {
    console.error('❌ Failed to get scoring info:', error);
    return {
      available_methods: [],
      default_weights: {},
      available_factors: [],
      opportunity_types: ['job', 'scholarship', 'grant']
    };
  }
};
