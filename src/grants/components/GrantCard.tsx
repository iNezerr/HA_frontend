import React, { useState } from 'react';
import { MapPin, Building2, Calendar, Bookmark, CheckCircle, ExternalLink, DollarSign } from 'lucide-react';
import { Grant } from '../types';

interface GrantCardProps {
  grant: Grant;
  onSave?: (grantId: string) => Promise<void>;
  onApply?: (grantId: string) => Promise<void>;
  className?: string;
}

export const GrantCard: React.FC<GrantCardProps> = ({ 
  grant, 
  onSave, 
  onApply,
  className = '' 
}) => {
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);

  const isExpired = grant.deadline 
    ? new Date(grant.deadline) < new Date() 
    : false;

  const handleSave = async () => {
    if (!onSave || saving) return;
    
    setSaving(true);
    try {
      await onSave(grant.id);
    } catch (error) {
      console.error('Failed to save grant:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleApply = async () => {
    if (grant.application_url) {
      window.open(grant.application_url, '_blank');
    }
    
    if (!onApply || applying) return;
    
    setApplying(true);
    try {
      await onApply(grant.id);
    } catch (error) {
      console.error('Failed to apply to grant:', error);
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
              {grant.title}
              {isExpired && (
                <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                  Expired
                </span>
              )}
            </h3>
            <div className="flex items-center text-gray-600 mb-2">
              <Building2 className="w-4 h-4 mr-1.5 flex-shrink-0" />
              <span className="font-medium truncate">{grant.organization}</span>
            </div>
          </div>
          
          {/* Similarity Score */}
          {grant.similarity_score && (
            <div className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              {Math.round(grant.similarity_score * 100)}% match
            </div>
          )}
        </div>

        {/* Meta Information */}
        <div className="flex flex-wrap gap-4 mb-3 text-sm text-gray-600">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1.5" />
            <span>{grant.location}</span>
          </div>
          
          {grant.deadline && (
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1.5" />
              <span>Deadline: {formatDate(grant.deadline)}</span>
            </div>
          )}
          
          {grant.funding_amount && (
            <div className="flex items-center font-medium text-gray-700">
              <DollarSign className="w-4 h-4 mr-1" />
              <span>{grant.funding_amount}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {grant.description && (
          <p className="text-gray-700 text-sm mb-4 line-clamp-3">
            {grant.description}
          </p>
        )}

        {/* Eligibility */}
        {grant.eligibility && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-50 text-purple-700 rounded-md">
                {grant.eligibility}
              </span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            {grant.created_at && (
              <span>Added {formatDate(grant.created_at)}</span>
            )}
            {grant.deadline && (
              <>
                {grant.created_at && <span>•</span>}
                <span className={isExpired ? 'text-red-600 font-medium' : ''}>
                  {isExpired ? 'Expired' : `Due ${formatDate(grant.deadline)}`}
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
                grant.is_saved
                  ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={grant.is_saved ? 'Remove from saved' : 'Save grant'}
            >
              <Bookmark className={`w-4 h-4 ${grant.is_saved ? 'fill-current' : ''}`} />
            </button>

            {/* Apply Button */}
            {grant.is_applied ? (
              <div className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Applied
              </div>
            ) : (
              <button
                onClick={() => {
                  if (grant.application_url) {
                    window.open(grant.application_url, '_blank');
                  }
                  handleApply();
                }}
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
          </div>
        </div>
      </div>
    </div>
  );
};