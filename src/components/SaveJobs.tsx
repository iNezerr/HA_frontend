import React, { useState, useEffect, useCallback } from 'react';
import { Bookmark, Loader2, AlertCircle, Filter, X } from 'lucide-react';
import { Job, JobFilters, JobsResponse } from '../jobs/types';
import { JobCard } from '../jobs/components/JobCard';
import { getSavedJobs, toggleSaveJob, applyToJob } from '../jobs/services/jobsApi';

const SaveJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<JobFilters>({
    page: 1,
    page_size: 10,
  });

  const fetchSavedJobs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response: JobsResponse = await getSavedJobs(filters);
      
      console.log('Saved jobs response:', response);
      console.log('Jobs array:', response.results);
      
      const transformedJobs = response.results?.map((item: any) => {
        if (item.opportunity_details) {
          return {
            ...item.opportunity_details,
            id: item.id || item.opportunity_details.id,
            is_saved: item.is_saved ?? true,
            is_applied: item.is_applied ?? false,
          };
        }
        return item;
      }) || [];
      
      console.log('Transformed jobs:', transformedJobs);
      
      setJobs(transformedJobs);
      setTotalCount(response.count || 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch saved jobs';
      setError(errorMessage);
      console.error('Error fetching saved jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  const handleUnsave = async (jobId: string) => {
    try {
      const savedJob = jobs.find(job => job.id === jobId);
      const savedJobId = (savedJob as any)?.saved_job_id || jobId;
      
      await toggleSaveJob(savedJobId);
      
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
      setTotalCount(prev => prev - 1);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove job';
      console.error('Error unsaving job:', err);
      setError(errorMessage);
    }
  };

  const handleApply = async (jobId: string) => {
    try {
      await applyToJob(jobId);
      
      setJobs(prevJobs =>
        prevJobs.map(job =>
          job.id === jobId ? { ...job, is_applied: true } : job
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to apply to job';
      console.error('Error applying to job:', err);
      setError(errorMessage);
    }
  };

  const handleFilterChange = (key: keyof JobFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ page: 1, page_size: 10 });
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Jobs</h1>
              <p className="text-gray-600">
                {totalCount} job{totalCount !== 1 ? 's' : ''} saved for later
              </p>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <select
                  value={filters.employment_type || ''}
                  onChange={(e) => handleFilterChange('employment_type', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Employment Types</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>

                <select
                  value={filters.experience_level || ''}
                  onChange={(e) => handleFilterChange('experience_level', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Experience Levels</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="lead">Lead</option>
                </select>
              </div>
              
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  fetchSavedJobs();
                }}
                className="mt-2 text-sm text-red-700 hover:text-red-800 font-medium"
              >
                Try again
              </button>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && jobs.length === 0 && !error && (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No saved jobs yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start saving jobs you're interested in to view them here later
            </p>
            <a
              href="/dashboard"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Browse Jobs
            </a>
          </div>
        )}

        {/* Jobs List - Using existing JobCard component */}
        {jobs.length > 0 && (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="relative">
                <JobCard
                  job={job}
                  onSave={undefined} // Don't show save button on saved jobs page
                  onApply={handleApply}
                />
                {/* Add unsave button in top right */}
                <button
                  onClick={() => handleUnsave(job.id)}
                  className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                  title="Remove from saved jobs"
                >
                  <X className="w-4 h-4" />
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Loading More */}
        {loading && jobs.length > 0 && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        )}
      </div>
    </div>
  );
};

export default SaveJobs;