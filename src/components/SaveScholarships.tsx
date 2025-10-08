import React, { useState, useEffect, useCallback } from 'react';
import { Bookmark, Loader2, AlertCircle, Filter, X } from 'lucide-react';
import { Scholarship, ScholarshipFilters, ScholarshipsResponse } from '../scholarships/services/scholarshipsApi';
import { ScholarshipCard } from '../scholarships/components/ScholarshipCard';
import { getSavedScholarships, toggleSaveScholarship, applyToScholarship } from '../scholarships/services/scholarshipsApi';

const SaveScholarships: React.FC = () => {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<ScholarshipFilters>({
    page: 1,
    page_size: 10,
  });

  const fetchSavedScholarships = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response: ScholarshipsResponse = await getSavedScholarships(filters);
      
      console.log('Saved scholarships response:', response);
      console.log('Scholarships array:', response.results);
      
      const transformedScholarships = response.results?.map((item: any) => {
        if (item.opportunity_details) {
          return {
            ...item.opportunity_details,
            id: item.id || item.opportunity_details.id,
            is_saved: item.is_saved ?? true,
            is_applied: item.is_applied ?? false,
            saved_scholarship_id: item.id,
          };
        }
        return {
          ...item,
          is_saved: true,
          is_applied: item.is_applied ?? false,
        };
      }) || [];
      
      console.log('Transformed scholarships:', transformedScholarships);
      
      setScholarships(transformedScholarships);
      setTotalCount(response.count || 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch saved scholarships';
      setError(errorMessage);
      console.error('Error fetching saved scholarships:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSavedScholarships();
  }, [fetchSavedScholarships]);

  const handleUnsave = async (scholarshipId: string) => {
    try {
      const savedScholarship = scholarships.find(scholarship => scholarship.id === scholarshipId);
      const savedScholarshipId = (savedScholarship as any)?.saved_scholarship_id || scholarshipId;
      
      await toggleSaveScholarship(savedScholarshipId);
      
      setScholarships(prevScholarships => prevScholarships.filter(scholarship => scholarship.id !== scholarshipId));
      setTotalCount(prev => prev - 1);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove scholarship';
      console.error('Error unsaving scholarship:', err);
      setError(errorMessage);
    }
  };

  const handleApply = async (scholarshipId: string) => {
    try {
      await applyToScholarship(scholarshipId);
      
      setScholarships(prevScholarships =>
        prevScholarships.map(scholarship =>
          scholarship.id === scholarshipId ? { ...scholarship, is_applied: true } : scholarship
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to apply to scholarship';
      console.error('Error applying to scholarship:', err);
      setError(errorMessage);
    }
  };

  const handleFilterChange = (key: keyof ScholarshipFilters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ page: 1, page_size: 10 });
  };

  if (loading && scholarships.length === 0) {
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Scholarships</h1>
              <p className="text-gray-600">
                {totalCount} scholarship{totalCount !== 1 ? 's' : ''} saved for later
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
                  placeholder="Search scholarships..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <input
                  type="text"
                  placeholder="Location..."
                  value={filters.location || ''}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <input
                  type="text"
                  placeholder="Course..."
                  value={filters.course || ''}
                  onChange={(e) => handleFilterChange('course', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                  type="number"
                  placeholder="Min Amount"
                  value={filters.amount_min || ''}
                  onChange={(e) => handleFilterChange('amount_min', parseInt(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <input
                  type="number"
                  placeholder="Max Amount"
                  value={filters.amount_max || ''}
                  onChange={(e) => handleFilterChange('amount_max', parseInt(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <input
                  type="text"
                  placeholder="Min GPA"
                  value={filters.gpa || ''}
                  onChange={(e) => handleFilterChange('gpa', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
                  fetchSavedScholarships();
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
        {!loading && scholarships.length === 0 && !error && (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No saved scholarships yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start saving scholarships you're interested in to view them here later
            </p>
            <a
              href="/dashboard"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Browse Scholarships
            </a>
          </div>
        )}

        {/* Scholarships List - Using ScholarshipCard component */}
        {scholarships.length > 0 && (
          <div className="space-y-4">
            {scholarships.map((scholarship) => (
              <div key={scholarship.id} className="relative">
                <ScholarshipCard
                  scholarship={scholarship}
                  onSave={undefined}
                  onApply={handleApply}
                />
                {/* Add unsave button in top right */}
                <button
                  onClick={() => handleUnsave(scholarship.id)}
                  className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                  title="Remove from saved scholarships"
                >
                  <X className="w-4 h-4" />
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Loading More */}
        {loading && scholarships.length > 0 && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        )}
      </div>
    </div>
  );
};

export default SaveScholarships;