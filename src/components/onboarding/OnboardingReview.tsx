import React, { useState, useEffect } from 'react';
import { CheckCircle, Edit3, User, FileText, Building } from 'lucide-react';
import { FaCheck } from 'react-icons/fa';
import OnboardingService from '../../services/onboarding';
import { UserType, UserProfile, JobSeekerProfile, ScholarshipSeekerProfile, GrantSeekerProfile } from '../../types/user';
import { useAuth } from '../../auth/context/AuthContext';

interface OnboardingReviewProps {
  userType: UserType;
  onComplete: (data: any) => void;
  onBack: () => void;
  error?: string;
}

const OnboardingReview: React.FC<OnboardingReviewProps> = ({
  userType,
  onComplete,
  onBack,
  error
}) => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<Partial<UserProfile> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  useEffect(() => {
    const data = OnboardingService.getProfileData();
    if (data) {
      setProfileData(data);
    }
  }, []);

  const handleComplete = async () => {
    if (!profileData) return;
    
    setIsLoading(true);
    try {
      // Mark onboarding as complete
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onComplete(profileData);
    } catch (err: any) {
      console.error('Failed to complete onboarding:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (section: string) => {
    setEditingSection(section);
  };

  const handleSave = (section: string, updatedData: any) => {
    if (profileData) {
      const updated = { ...profileData, [section]: updatedData };
      setProfileData(updated);
      OnboardingService.updateProfileData(updated);
    }
    setEditingSection(null);
  };

  if (!profileData) {
    return (
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const renderPersonalInfoSection = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <User className="text-blue-500 mr-2" size={20} />
          <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
        </div>
        <button
          onClick={() => handleEdit('personal_info')}
          className="text-blue-500 hover:text-blue-600 flex items-center"
        >
          <Edit3 size={16} className="mr-1" />
          Edit
        </button>
      </div>

      {editingSection === 'personal_info' ? (
        <PersonalInfoEditor
          data={profileData.personal_info}
          onSave={(data) => handleSave('personal_info', data)}
          onCancel={() => setEditingSection(null)}
          user={user}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="font-medium">
              {user?.displayName || `${user?.first_name} ${user?.last_name}`.trim() || 'Not provided'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium">{user?.email || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <p className="font-medium">{profileData.personal_info?.phone || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">CV Status</p>
            <p className="font-medium text-green-600 flex items-center">
              {profileData.cv_file_url ? (
                <>
                  <FaCheck className="mr-1" />
                  Uploaded
                </>
              ) : (
                'Not uploaded'
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const renderJobSeekerSpecific = () => {
    const jobData = profileData as JobSeekerProfile;
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FileText className="text-blue-500 mr-2" size={20} />
            <h3 className="text-lg font-semibold text-gray-800">Professional Profile</h3>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Professional Summary</p>
            <p className="font-medium">{jobData.summary || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Skills</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {jobData.skills?.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              )) || <span className="text-gray-500">No skills added</span>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderScholarshipSeekerSpecific = () => {
    const scholarshipData = profileData as ScholarshipSeekerProfile;
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FileText className="text-blue-500 mr-2" size={20} />
            <h3 className="text-lg font-semibold text-gray-800">Academic Profile</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Academic Level</p>
            <p className="font-medium capitalize">
              {scholarshipData.academic_background?.current_level || 'Not specified'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Field of Study</p>
            <p className="font-medium">
              {scholarshipData.academic_background?.field_of_study || 'Not specified'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Current Institution</p>
            <p className="font-medium">
              {scholarshipData.academic_background?.current_institution || 'Not specified'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">GPA</p>
            <p className="font-medium">
              {scholarshipData.academic_background?.current_gpa || 'Not provided'}
            </p>
          </div>
        </div>

        {scholarshipData.academic_goals && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">Academic Goals</p>
            <p className="font-medium">{scholarshipData.academic_goals}</p>
          </div>
        )}
      </div>
    );
  };

  const renderGrantSeekerSpecific = () => {
    const grantData = profileData as GrantSeekerProfile;
    return (
      <>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FileText className="text-blue-500 mr-2" size={20} />
              <h3 className="text-lg font-semibold text-gray-800">Project Details</h3>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Project Title</p>
              <p className="font-medium">{grantData.project_details?.project_title || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Project Description</p>
              <p className="font-medium">{grantData.project_details?.project_description || 'Not specified'}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Timeline</p>
                <p className="font-medium">{grantData.project_details?.project_timeline || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Requested Amount</p>
                <p className="font-medium">
                  {grantData.project_details?.requested_amount 
                    ? `$${grantData.project_details.requested_amount.toLocaleString()}` 
                    : 'Not specified'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Building className="text-blue-500 mr-2" size={20} />
              <h3 className="text-lg font-semibold text-gray-800">Organization Information</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Organization Name</p>
              <p className="font-medium">{grantData.organization_info?.organization_name || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Organization Type</p>
              <p className="font-medium capitalize">
                {grantData.organization_info?.organization_type?.replace('-', ' ') || 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Website</p>
              <p className="font-medium">{grantData.organization_info?.website || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tax ID</p>
              <p className="font-medium">{grantData.organization_info?.tax_id || 'Not provided'}</p>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderUserTypeSpecificSections = () => {
    switch (userType) {
      case 'job':
        return renderJobSeekerSpecific();
      case 'scholarship':
        return renderScholarshipSeekerSpecific();
      case 'grant':
        return renderGrantSeekerSpecific();
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl">
      <div className="text-center mb-8">
        <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Review Your Profile
        </h1>
        <p className="text-gray-600">
          Please review your information before completing your profile setup
        </p>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-6 text-center">
          {error}
        </div>
      )}

      {/* Personal Information Section */}
      {renderPersonalInfoSection()}

      {/* User Type Specific Sections */}
      {renderUserTypeSpecificSections()}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center mt-8">
        <button
          onClick={onBack}
          className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          disabled={isLoading}
        >
          Back
        </button>
        <button
          onClick={handleComplete}
          disabled={isLoading}
          className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-green-300 flex items-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              Completing...
            </>
          ) : (
            <>
              <CheckCircle size={16} className="mr-2" />
              Complete Profile Setup
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Simple inline editor for personal info
const PersonalInfoEditor: React.FC<{
  data: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  user?: any;
}> = ({ data, onSave, onCancel, user }) => {
  const [editData, setEditData] = useState({
    phone: data?.phone || '',
  });

  const handleSave = () => {
    onSave(editData);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={user?.displayName || `${user?.first_name} ${user?.last_name}`.trim() || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-100"
            disabled
            title="Name cannot be edited here. Please update in your account settings."
          />
          <p className="text-xs text-gray-500 mt-1">From your account registration</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={user?.email || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-100"
            disabled
            title="Email cannot be edited here. Please update in your account settings."
          />
          <p className="text-xs text-gray-500 mt-1">From your account registration</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            value={editData.phone}
            onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your phone number"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default OnboardingReview;
