import React from 'react';
import { ArrowLeft, Briefcase, Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminJobsPlaceholder: React.FC = () => {
  const navigate = useNavigate();

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
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Jobs Management</h1>
              <p className="text-gray-600">Manage job opportunities (Feature in development)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Briefcase className="h-12 w-12 text-gray-400" />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Jobs Management Coming Soon
          </h2>
          
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            The jobs management feature is currently under development. You'll be able to create, 
            edit, and manage job opportunities from this interface.
          </p>

          {/* Mock Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              disabled
              className="flex items-center gap-2 px-6 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
            >
              <Plus size={20} />
              Add New Job (Coming Soon)
            </button>
            
            <button 
              disabled
              className="flex items-center gap-2 px-6 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
            >
              <Search size={20} />
              Search Jobs (Coming Soon)
            </button>
          </div>

          {/* Features Preview */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Bulk Operations</h3>
              <p className="text-sm text-gray-600">
                Upload multiple jobs via CSV, bulk edit, and manage large datasets efficiently.
              </p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Smart Matching</h3>
              <p className="text-sm text-gray-600">
                AI-powered job matching with user profiles and skills for better recommendations.
              </p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Analytics</h3>
              <p className="text-sm text-gray-600">
                Track application rates, view performance metrics, and optimize job postings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminJobsPlaceholder;
