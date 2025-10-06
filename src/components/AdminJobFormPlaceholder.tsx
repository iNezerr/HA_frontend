import React from 'react';
import { ArrowLeft, Briefcase, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const AdminJobFormPlaceholder: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate('/admin/jobs')}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Jobs
          </button>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEdit ? 'Edit Job' : 'Create New Job'}
              </h1>
              <p className="text-gray-600">
                {isEdit ? 'Modify job details (Feature in development)' : 'Add a new job opportunity (Feature in development)'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder Form */}
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Briefcase className="h-12 w-12 text-gray-400" />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Job Form Coming Soon
          </h2>
          
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            The job creation and editing interface is currently under development. 
            You'll be able to {isEdit ? 'edit existing jobs' : 'create new job opportunities'} with a comprehensive form.
          </p>

          {/* Mock Form Preview */}
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="text-left">
                <label className="block text-sm font-medium text-gray-400 mb-2">Job Title</label>
                <div className="h-10 bg-gray-100 rounded-lg border border-gray-200"></div>
              </div>
              
              <div className="text-left">
                <label className="block text-sm font-medium text-gray-400 mb-2">Company</label>
                <div className="h-10 bg-gray-100 rounded-lg border border-gray-200"></div>
              </div>
              
              <div className="text-left">
                <label className="block text-sm font-medium text-gray-400 mb-2">Location</label>
                <div className="h-10 bg-gray-100 rounded-lg border border-gray-200"></div>
              </div>
              
              <div className="text-left">
                <label className="block text-sm font-medium text-gray-400 mb-2">Employment Type</label>
                <div className="h-10 bg-gray-100 rounded-lg border border-gray-200"></div>
              </div>
              
              <div className="text-left md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-2">Job Description</label>
                <div className="h-32 bg-gray-100 rounded-lg border border-gray-200"></div>
              </div>
            </div>

            {/* Mock Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => navigate('/admin/jobs')}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              
              <button 
                disabled
                className="flex items-center gap-2 px-6 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
              >
                <Save size={20} />
                {isEdit ? 'Update Job (Coming Soon)' : 'Create Job (Coming Soon)'}
              </button>
            </div>
          </div>

          {/* Features Preview */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Rich Text Editor</h3>
              <p className="text-sm text-gray-600">
                Format job descriptions with rich text, bullet points, and formatting options.
              </p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Skills Tagging</h3>
              <p className="text-sm text-gray-600">
                Add skill tags for better matching with candidate profiles and AI recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminJobFormPlaceholder;
