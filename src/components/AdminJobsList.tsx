import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Plus, Search, Trash2, Eye, AlertCircle, RefreshCw, ArrowLeft, Briefcase } from 'lucide-react';
import { apiClient } from '../services/apiClient';

interface Job {
  id?: string;
  title: string;
  company: string;
  location: string;
  employment_type: string;
  experience_level: string;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string;
  description: string;
  url?: string;
  requirements?: string[];
  skills?: string[];
  benefits?: string[];
  application_deadline?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  salary_range?: string;
}

const AdminJobsList: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const navigate = useNavigate();

  const pageSize = 20;

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  useEffect(() => {
    fetchJobs();
  }, [page, searchTerm]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page,
        page_size: pageSize,
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      // Note: apiClient already extracts response.data in the interceptor
      const data = await apiClient.get('admin/jobs/', { params });
      
      let jobsList: Job[] = [];
      
      if (Array.isArray(data)) {
        jobsList = data;
        setTotalCount(data.length);
        setHasNext(false);
        setHasPrevious(false);
      } else if (data && typeof data === 'object') {
        if (data.results && Array.isArray(data.results)) {
          jobsList = data.results;
        } else if (data.data && Array.isArray(data.data)) {
          jobsList = data.data;
        }
        setTotalCount(data.count || jobsList.length || 0);
        setHasNext(!!data.next);
        setHasPrevious(!!data.previous);
      }
      
      setJobs(Array.isArray(jobsList) ? jobsList : []);
      
    } catch (err: any) {
      console.error('Failed to fetch jobs:', err);
      setError(err.message || 'Failed to load jobs. Please check your API connection.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) {
      return;
    }
    
    try {
      setDeleting(id);
      
      await apiClient.delete(`admin/jobs/${id}/`);
      
      // Remove from local state immediately
      setJobs(prev => prev.filter(j => j.id !== id));
      setTotalCount(prev => prev - 1);
      
      // Show success message
      alert('Job deleted successfully');
      
    } catch (err: any) {
      console.error('Failed to delete job:', err);
      alert(err.response?.data?.detail || 'Failed to delete job. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (job: Job) => {
    navigate(`/admin/jobs/edit/${job.id}`);
  };

  const handleView = (job: Job) => {
    // Navigate to detail view (can be implemented later)
    console.log('View job:', job);
  };

  const formatSalary = (job: Job) => {
    if (job.salary_range) {
      return job.salary_range;
    }
    
    const currency = job.salary_currency || 'USD';
    if (job.salary_min && job.salary_max) {
      return `${currency} ${Number(job.salary_min).toLocaleString()} - ${Number(job.salary_max).toLocaleString()}`;
    } else if (job.salary_min) {
      return `${currency} ${Number(job.salary_min).toLocaleString()}+`;
    } else if (job.salary_max) {
      return `${currency} Up to ${Number(job.salary_max).toLocaleString()}`;
    }
    return 'Not specified';
  };

  const formatEmploymentType = (type: string) => {
    const types: Record<string, string> = {
      'full_time': 'Full Time',
      'part_time': 'Part Time',
      'contract': 'Contract',
      'internship': 'Internship',
      'freelance': 'Freelance',
    };
    return types[type] || type;
  };

  const formatExperienceLevel = (level: string) => {
    const levels: Record<string, string> = {
      'entry': 'Entry Level',
      'junior': 'Junior',
      'mid': 'Mid Level',
      'senior': 'Senior',
      'lead': 'Lead',
      'executive': 'Executive',
    };
    return levels[level] || level;
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'No deadline';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
        </div>
        
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Jobs Management</h1>
              <p className="text-gray-600">
                Manage job opportunities ({totalCount} total)
              </p>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/admin/jobs/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Add New Job
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search jobs by title, company, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 mb-1">Error Loading Jobs</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <button
            onClick={fetchJobs}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading jobs...</p>
          </div>
        </div>
      )}

      {/* Jobs Table */}
      {!loading && !error && jobs.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company & Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salary Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{job.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-2">{job.description?.substring(0, 100)}...</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{job.company}</div>
                      <div className="text-sm text-gray-500">{job.location}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{formatEmploymentType(job.employment_type)}</div>
                      <div className="text-sm text-gray-500">{formatExperienceLevel(job.experience_level)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatSalary(job)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(job.application_deadline)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          job.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {job.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(job)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="View details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(job)}
                          className="text-green-600 hover:text-green-900 transition-colors"
                          title="Edit job"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => job.id && handleDelete(job.id)}
                          disabled={deleting === job.id}
                          className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                          title="Delete job"
                        >
                          {deleting === job.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(page - 1)}
                disabled={!hasPrevious}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={!hasNext}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">{(page - 1) * pageSize + 1}</span>
                  {' '}-{' '}
                  <span className="font-medium">
                    {Math.min(page * pageSize, totalCount)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{totalCount}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={!hasPrevious}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    Page {page}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={!hasNext}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && jobs.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12">
          <div className="text-center">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? 'No jobs match your search criteria. Try adjusting your search.'
                : 'Get started by creating your first job opportunity.'}
            </p>
            <button
              onClick={() => navigate('/admin/jobs/new')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Add New Job
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobsList;
