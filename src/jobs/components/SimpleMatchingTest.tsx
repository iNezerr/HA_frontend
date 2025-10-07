/**
 * Test component to verify simple matching integration
 * Run this in the browser console to test API integration
 */

import React from 'react';
import { useJobMatching } from '../hooks/useSimpleMatching';

const SimpleMatchingTest: React.FC = () => {
  const { jobMatches, loading, error, loadJobMatches } = useJobMatching({
    autoLoad: true,
    limit: 5
  });

  const handleTestAPI = async () => {
    console.log('🧪 Testing Simple Matching API...');
    await loadJobMatches(3);
  };

  if (loading) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-medium text-yellow-800">🔄 Testing Simple Matching...</h3>
        <p className="text-sm text-yellow-600">Loading job matches from backend...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="font-medium text-red-800">❌ Test Failed</h3>
        <p className="text-sm text-red-600 mb-2">Error: {error}</p>
        <button 
          onClick={handleTestAPI}
          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
        >
          Retry Test
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <h3 className="font-medium text-green-800">✅ Simple Matching Working!</h3>
      <p className="text-sm text-green-600 mb-2">
        Found {jobMatches.length} job matches from backend
      </p>
      
      {jobMatches.length > 0 && (
        <div className="mt-3 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Sample Matches:</h4>
          {jobMatches.slice(0, 3).map((job: any, index: number) => (
            <div key={index} className="text-xs bg-white p-2 rounded border">
              <div className="font-medium">{job.title || 'No title'}</div>
              <div className="text-gray-500">
                {job.company || 'No company'} • 
                {job.match_score ? ` ${Math.round(job.match_score * 100)}% match` : ' No score'}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <button 
        onClick={handleTestAPI}
        className="mt-3 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
      >
        Run Test Again
      </button>
    </div>
  );
};

export default SimpleMatchingTest;
