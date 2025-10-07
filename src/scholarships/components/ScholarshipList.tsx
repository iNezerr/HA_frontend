import React from 'react';
import { ScholarshipFilters } from '../types';
import { ScholarshipCard } from './ScholarshipCard';
import { useScholarships } from '../hooks/useScholarships';

interface ScholarshipListProps {
  filters?: ScholarshipFilters;
  useDashboard?: boolean;
  title?: string;
  className?: string;
  showLoadMore?: boolean;
}

export const ScholarshipList: React.FC<ScholarshipListProps> = ({
  filters = {},
  useDashboard = true,
  title,
  className = '',
  showLoadMore = false
}) => {
  const { 
    scholarships, 
    loading, 
    error, 
    totalCount, 
    hasMore, 
    saveScholarship, 
    applyScholarship, 
    fetchScholarships 
  } = useScholarships(filters, useDashboard);

  const handleSave = async (scholarshipId: string) => {
    await saveScholarship(scholarshipId);
  };

  const handleApply = async (scholarshipId: string) => {
    await applyScholarship(scholarshipId);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchScholarships({ ...filters, page: Math.floor(scholarships.length / 10) + 1 });
    }
  };

  if (loading && scholarships.length === 0) {
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
          <div className="text-red-600 mb-2">Error loading scholarships</div>
          <div className="text-sm text-gray-600">{error}</div>
          <button
            onClick={() => fetchScholarships()}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (scholarships.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        )}
        <div className="text-center py-8">
          <div className="text-gray-600 mb-2">No scholarships found</div>
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
          <div className="text-sm text-gray-600">
            {totalCount} scholarship{totalCount !== 1 ? 's' : ''} found
          </div>
        </div>
      )}

      <div className="space-y-4">
        {scholarships.map((scholarship) => (
          <ScholarshipCard
            key={scholarship.id}
            scholarship={scholarship}
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
      {loading && scholarships.length > 0 && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};