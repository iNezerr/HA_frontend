import { useState, useEffect } from 'react';
import { useJobMatching } from '../jobs/hooks/useSimpleMatching';
import { getSavedJobs, toggleSaveJob } from '../jobs/services/jobsApi';

// Local Opportunity shape for UI display
type Opportunity = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary_range?: string;
  match_percentage?: number;
  skills_required?: string[];
  apply_link?: string;
  application_url?: string;
};

interface RecommendedOpportunitiesProps {
  className?: string;
  title?: string;
}

export default function RecommendedOpportunities({
  className = '',
  title = 'Recommended for You'
}: RecommendedOpportunitiesProps) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [savedOpportunities, setSavedOpportunities] = useState<Set<string>>(new Set());
  
  // Use our working simple matching hook
  const { jobMatches, loading, error, loadJobMatches, clearError } = useJobMatching({
    autoLoad: true,
    limit: 10
  });

  // Convert job matches to opportunities format when data loads
  useEffect(() => {
  const markSavedJobs = async () => {
    if (jobMatches.length > 0) {
      // First map the jobs
      const mapped = jobMatches.map((job: any): Opportunity => ({
        id: String(job.id),
        title: job.title || job.job_title || '',
        company: job.company || job.company_name || job.organization || '',
        location: job.location || job.city || job.country || 'Remote',
        salary_range: job.salary_range || 
          (job.salary_min && job.salary_max ? 
            `${job.salary_min}-${job.salary_max} ${job.salary_currency || 'USD'}`.trim() : 
            undefined),
        match_percentage: job.match_score ? Math.round(job.match_score * 100) : undefined,
        skills_required: job.skills_required || job.skills || job.requirements || [],
        apply_link: job.apply_link || job.application_url || job.url || job.link || undefined,
        application_url: job.application_url || job.apply_link || job.url || job.link || undefined,
      }));

      // Fetch saved jobs and mark them
      try {
        const savedResponse = await getSavedJobs({ page: 1, page_size: 1000 });
        const savedIds = new Set(
          savedResponse.results?.map((item: any) => 
            String(item.opportunity_details?.id || item.id)
          ) || []
        );
        
        setSavedOpportunities(savedIds); 
      } catch (err) {
        console.error('Error fetching saved status:', err);
      }

      setOpportunities(mapped);
    }
  };

  markSavedJobs();
}, [jobMatches]);

  useEffect(() => {
    fetchSavedOpportunities();
  }, []);

  const fetchRecommendedOpportunities = async () => {
    clearError();
    await loadJobMatches();
  };

  const fetchSavedOpportunities = async () => {
  try {
    // Call API to get saved job IDs from backend
    const response = await getSavedJobs({ page: 1, page_size: 1000 });
    const savedIds = response.results?.map((item: any) => 
      String(item.opportunity_details?.id || item.id)
    ) || [];
    setSavedOpportunities(new Set(savedIds));
  } catch (err) {
    console.error('Error fetching saved opportunities:', err);
  }
};

  const toggleSave = async (opportunityId: string) => {
  try {
    // Call the actual API to save/unsave
    await toggleSaveJob(opportunityId);
    
    // Update local state
    const newSaved = new Set(savedOpportunities);
    if (newSaved.has(opportunityId)) {
      newSaved.delete(opportunityId);
    } else {
      newSaved.add(opportunityId);
    }
    setSavedOpportunities(newSaved);
  } catch (err) {
    console.error('Error toggling save:', err);
  }
};

  const handleApply = async (opportunity: Opportunity) => {
    try {
      const applyUrl = opportunity.apply_link || opportunity.application_url;
      
      if (applyUrl) {
        // Open the job application link in a new tab
        window.open(applyUrl, '_blank', 'noopener,noreferrer');
        console.log('Opening application URL:', applyUrl);
      } else {
        // Fallback: if no link, just log
        console.log('No application URL available for opportunity:', opportunity.id);
        alert('Application link not available for this job.');
      }
    } catch (err) {
      console.error('Error applying to opportunity:', err);
    }
  };

  const getMatchColor = (percentage?: number) => {
    if (!percentage) return 'text-gray-500';
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="text-center text-gray-500">
          <p>⚠️ {error}</p>
          <button
            onClick={fetchRecommendedOpportunities}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (opportunities.length === 0 && !loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="text-center text-gray-500">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6.5"/>
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-700 mb-2">🔍 Looking for opportunities...</p>
          <p className="text-sm">Complete your profile to get AI-powered job recommendations.</p>
          <button
            onClick={fetchRecommendedOpportunities}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Recommendations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-xl font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="space-y-4">
        {opportunities.map((opportunity) => (
          <div key={opportunity.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-gray-900 line-clamp-2">
                {opportunity.title}
              </h4>
              <button
                onClick={() => toggleSave(opportunity.id)}
                className={`ml-2 p-1 rounded-full hover:bg-gray-100 ${savedOpportunities.has(opportunity.id) ? 'text-blue-600' : 'text-gray-400'
                  }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-2">{opportunity.company}</p>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {opportunity.location}
                </span>
                {opportunity.salary_range && (
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    {opportunity.salary_range}
                  </span>
                )}
              </div>

              {opportunity.match_percentage && (
                <span className={`text-sm font-medium ${getMatchColor(opportunity.match_percentage)}`}>
                  {opportunity.match_percentage}% match
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {opportunity.skills_required?.slice(0, 3).map((skill: string, index: number) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {skill}
                  </span>
                ))}
                {opportunity.skills_required && opportunity.skills_required.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    +{opportunity.skills_required.length - 3} more
                  </span>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleApply(opportunity)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}