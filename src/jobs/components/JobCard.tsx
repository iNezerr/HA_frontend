import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Building2, Clock, Bookmark, CheckCircle, ExternalLink } from 'lucide-react';
import { Job } from '../types';

interface JobCardProps {
  job: Job;
  onSave?: (jobId: string) => Promise<void>;
  onApply?: (jobId: string) => Promise<void>;
  className?: string;
}

export const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  onSave, 
  onApply,
  className = '' 
}) => {
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);
  const navigate = useNavigate();

  const handleSave = async () => {
    if (!onSave || saving) return;
    
    setSaving(true);
    try {
      await onSave(job.id);
    } catch (error) {
      console.error('Failed to save job:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleApply = async () => {
    if (applying) return;
    
    // Redirect to signup page instead of opening job URL
    navigate('/signup');
    
    // If onApply callback exists, call it
    if (onApply) {
      setApplying(true);
      try {
        await onApply(job.id);
      } catch (error) {
        console.error('Failed to apply to job:', error);
      } finally {
        setApplying(false);
      }
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getSalaryDisplay = (salaryRange?: string) => {
    if (!salaryRange) return null;
    return salaryRange.includes('-') ? salaryRange : `$${salaryRange}`;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 ${className}`}>
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
              {job.title || 'Job Title Not Available'}
            </h3>
            <div className="flex items-center text-gray-600 mb-2">
              <Building2 className="w-4 h-4 mr-1.5 flex-shrink-0" />
              <span className="font-medium truncate">{job.company || 'Company Not Available'}</span>
            </div>
          </div>
          
          {/* Similarity Score */}
          {job.similarity_score && (
            <div className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              {Math.round(job.similarity_score * 100)}% match
            </div>
          )}
        </div>

        {/* Meta Information */}
        <div className="flex flex-wrap gap-4 mb-3 text-sm text-gray-600">
          {job.location && (
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1.5" />
              <span>{job.location}</span>
            </div>
          )}
          
          {job.employment_type && (
            <div className="flex items-center capitalize">
              <Clock className="w-4 h-4 mr-1.5" />
              <span>{job.employment_type?.replace('-', ' ') || 'Not specified'}</span>
            </div>
          )}
          
          {getSalaryDisplay(job.salary_range) && (
            <div className="font-medium text-gray-700">
              {getSalaryDisplay(job.salary_range)}
            </div>
          )}
        </div>

        {/* Description */}
        {job.description && (
          <p className="text-gray-700 text-sm mb-4 line-clamp-3">
            {job.description}
          </p>
        )}

        {/* Skills */}
        {job.skills_required && job.skills_required.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1.5">
              {job.skills_required.slice(0, 5).map((skill, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-md"
                >
                  {skill}
                </span>
              ))}
              {job.skills_required.length > 5 && (
                <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-md">
                  +{job.skills_required.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>Posted {formatDate(job.created_at)}</span>
            {job.application_deadline && (
              <>
                <span>•</span>
                <span>Deadline {formatDate(job.application_deadline)}</span>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                job.is_saved
                  ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={job.is_saved ? 'Remove from saved' : 'Save job'}
            >
              <Bookmark className={`w-4 h-4 ${job.is_saved ? 'fill-current' : ''}`} />
            </button>

            {/* Apply Button */}
            {job.is_applied ? (
              <div className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Applied
              </div>
            ) : (
              <button
                onClick={handleApply}
                disabled={applying}
                className={`flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200 ${
                  applying ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {applying ? (
                  'Applying...'
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 mr-1.5" />
                    Apply
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
