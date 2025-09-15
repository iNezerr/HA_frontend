import React from 'react';
import { useAuth } from '../auth/context/AuthContext';
import useProfile from '../hooks/useProfile';

const ProfileTest: React.FC = () => {
  const { user: authUser, isAuthenticated } = useAuth();
  const {
    user,
    profileCompletion,
    documents,
    loading,
    uploading,
    error,
    refreshProfile,
  } = useProfile();

  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Profile Test - Not Authenticated</h2>
        <p>Please log in to test profile functionality.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Profile Test Debug</h2>
        <button
          onClick={refreshProfile}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="mb-4 p-3 bg-blue-50 rounded">
          <p className="text-blue-700">Loading profile data...</p>
        </div>
      )}

      {uploading && (
        <div className="mb-4 p-3 bg-yellow-50 rounded">
          <p className="text-yellow-700">Uploading document...</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 rounded">
          <p className="text-red-700">Error: {error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Auth User</h3>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
            {JSON.stringify(authUser, null, 2)}
          </pre>
        </div>

        <div>
          <h3 className="font-medium mb-2">Profile User</h3>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div>
          <h3 className="font-medium mb-2">Profile Completion</h3>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
            {JSON.stringify(profileCompletion, null, 2)}
          </pre>
        </div>

        <div>
          <h3 className="font-medium mb-2">Documents</h3>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
            {JSON.stringify(documents, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ProfileTest;
