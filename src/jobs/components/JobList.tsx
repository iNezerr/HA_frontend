import React from 'react';
import { JobFilters } from '../types';
import { JobCard } from './JobCard';
import { useJobs } from '../hooks/useJobs';

interface JobListProps {
  filters?: JobFilters;
  useDashboard?: boolean;
  title?: string;
  className?: string;
  showLoadMore?: boolean;
}

export const JobList: React.FC<JobListProps> = ({
  filters = {},
  useDashboard = true,
  title,
  className = '',
  showLoadMore = false
}) => {
  const { 
    jobs, 
    loading, 
    error, 
    hasMore, 
    saveJob, 
    applyJob, 
    fetchJobs 
  } = useJobs(filters, useDashboard);

  const handleSave = async (jobId: string) => {
    await saveJob(jobId);
  };

  const handleApply = async (jobId: string) => {
    await applyJob(jobId);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchJobs({ ...filters, page: Math.floor(jobs.length / 10) + 1 });
    }
  };

  if (loading && jobs.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        )}
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        )}
        <div className="text-center py-8">
          <div className="text-red-600 mb-2">Error loading jobs</div>
          <div className="text-sm text-gray-600">{error}</div>
          <button
            onClick={() => fetchJobs()}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        )}
        <div className="text-center py-8">
          <div className="text-gray-600 mb-2">No jobs found</div>
          <div className="text-sm text-gray-500">
            Try adjusting your filters or check back later for new opportunities.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}

      <div className={useDashboard ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"}>
        {(useDashboard ? jobs : jobs.slice(0, 4)).map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onSave={handleSave}
            onApply={handleApply}
          />
        ))}
      </div>

      {/* Load More Button */}
      {showLoadMore && hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {/* Loading indicator for load more */}
      {loading && jobs.length > 0 && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};
