import React, { useState } from 'react';
import { MapPin, Calendar, Bookmark, CheckCircle, ExternalLink, GraduationCap } from 'lucide-react';
import { Scholarship } from '../types';

interface ScholarshipCardProps {
  scholarship: Scholarship;
  onSave?: (scholarshipId: string) => Promise<void>;
  onApply?: (scholarshipId: string) => Promise<void>;
  className?: string;
}

export const ScholarshipCard: React.FC<ScholarshipCardProps> = ({ 
  scholarship, 
  onSave, 
  onApply,
  className = '' 
}) => {
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);

  const isExpired = scholarship.deadline 
    ? new Date(scholarship.deadline) < new Date() 
    : false;

  const handleSave = async () => {
    if (!onSave || saving) return;
    
    setSaving(true);
    try {
      await onSave(scholarship.id);
    } catch (error) {
      console.error('Failed to save scholarship:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleApply = async () => {
    if (!onApply || applying) return;
    
    setApplying(true);
    try {
      await onApply(scholarship.id);
    } catch (error) {
      console.error('Failed to apply to scholarship:', error);
    } finally {
      setApplying(false);
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

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 ${isExpired ? 'border-red-300' : ''} ${className}`}>
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
              {scholarship.title}
              {isExpired && (
                <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                  Expired
                </span>
              )}
            </h3>
            <div className="flex items-center text-gray-600 mb-2">
              <GraduationCap className="w-4 h-4 mr-1.5 flex-shrink-0" />
              <span className="font-medium truncate">{scholarship.source}</span>
            </div>
          </div>
          
          {/* Similarity Score */}
          {scholarship.similarity_score && (
            <div className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              {Math.round(scholarship.similarity_score * 100)}% match
            </div>
          )}
        </div>

        {/* Meta Information */}
        <div className="flex flex-wrap gap-4 mb-3 text-sm text-gray-600">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1.5" />
            <span>{scholarship.location}</span>
          </div>
          
          {scholarship.deadline && (
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1.5" />
              <span>Deadline: {formatDate(scholarship.deadline)}</span>
            </div>
          )}
          
          {scholarship.amount && (
            <div className="font-medium text-gray-700">
              {scholarship.amount}
            </div>
          )}
        </div>

        {/* Description */}
        {scholarship.description && (
          <p className="text-gray-700 text-sm mb-4 line-clamp-3">
            {scholarship.description}
          </p>
        )}

        {/* Additional Info */}
        {(scholarship.course || scholarship.gpa) && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1.5">
              {scholarship.course && (
                <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-50 text-purple-700 rounded-md">
                  {scholarship.course}
                </span>
              )}
              {scholarship.gpa && (
                <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-md">
                  GPA: {scholarship.gpa}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            {scholarship.scraped_at && (
              <span>Added {formatDate(scholarship.scraped_at)}</span>
            )}
            {scholarship.deadline && (
              <>
                {scholarship.scraped_at && <span>•</span>}
                <span className={isExpired ? 'text-red-600 font-medium' : ''}>
                  {isExpired ? 'Expired' : `Due ${formatDate(scholarship.deadline)}`}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                scholarship.is_saved
                  ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={scholarship.is_saved ? 'Remove from saved' : 'Save scholarship'}
            >
              <Bookmark className={`w-4 h-4 ${scholarship.is_saved ? 'fill-current' : ''}`} />
            </button>

            {/* Apply Button */}
            {scholarship.is_applied ? (
              <div className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Applied
              </div>
            ) : (
              <button
                onClick={handleApply}
                disabled={applying || isExpired}
                className={`flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200 ${
                  (applying || isExpired) ? 'opacity-50 cursor-not-allowed' : ''
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

            {/* External Link */}
            {scholarship.application_link && !scholarship.is_applied && (
              <a
                href={scholarship.application_link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                title="Open application link"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};