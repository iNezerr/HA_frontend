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
    limit: 12 // Show more opportunities in grid
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
        <h3 className="text-xl font-semibold text-gray-800 mb-6">{title}</h3>
        <div className="job-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-3 mb-4">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
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
      <h3 className="text-xl font-semibold text-gray-800 mb-6">{title}</h3>
      
      {/* Grid Layout for Job Cards */}
      <div className="job-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {opportunities.map((opportunity) => (
          <div key={opportunity.id} className="job-card-hover bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 relative">
            {/* Save/Bookmark Button - Top Right */}
            <button
              onClick={() => toggleSave(opportunity.id)}
              className={`absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors ${
                savedOpportunities.has(opportunity.id) ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <svg className="w-5 h-5" fill={savedOpportunities.has(opportunity.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>

            {/* Company Logo/Icon */}
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-lg mr-4 flex-shrink-0">
                {opportunity.company.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-lg leading-tight line-clamp-2">
                  {opportunity.company}
                </h4>
                {opportunity.match_percentage && (
                  <div className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold match-badge ${
                    opportunity.match_percentage >= 90 ? 'bg-green-100 text-green-700' :
                    opportunity.match_percentage >= 70 ? 'bg-blue-100 text-blue-700' :
                    opportunity.match_percentage >= 50 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {opportunity.match_percentage}% Match
                  </div>
                )}
              </div>
            </div>

            {/* Job Details */}
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">Role</span>
                <span className="font-semibold text-gray-900 text-right flex-1 ml-4 line-clamp-2">
                  {opportunity.title}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">Location</span>
                <span className="font-semibold text-gray-900 text-right flex-1 ml-4">
                  {opportunity.location}
                </span>
              </div>

              {opportunity.salary_range && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">Salary</span>
                  <span className="font-semibold text-gray-900 text-right flex-1 ml-4">
                    {opportunity.salary_range}
                  </span>
                </div>
              )}
            </div>

            {/* Closing Date and Apply Button */}
            <div className="border-t border-gray-100 pt-4 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Closing today</span>
              </div>
              
              <button
                onClick={() => handleApply(opportunity)}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Apply
              </button>
            </div>

            {/* Skills Tags */}
            {opportunity.skills_required && opportunity.skills_required.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex flex-wrap gap-1">
                  {opportunity.skills_required.slice(0, 3).map((skill: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                      {skill}
                    </span>
                  ))}
                  {opportunity.skills_required.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">
                      +{opportunity.skills_required.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
