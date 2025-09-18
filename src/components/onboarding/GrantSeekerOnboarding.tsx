import React, { useState, useEffect } from 'react';
import { DollarSign, Building, UploadCloud } from 'lucide-react';
import OnboardingService from '../../services/onboarding';
import { GrantSeekerProfile } from '../../types/user';

interface GrantSeekerOnboardingProps {
  currentStep: number;
  totalSteps: number;
  onStepComplete: (stepData: any) => void;
  onStepBack: () => void;
  error?: string;
}

const GrantSeekerOnboarding: React.FC<GrantSeekerOnboardingProps> = ({
  currentStep,
  totalSteps,
  onStepComplete,
  onStepBack,
  error
}) => {
  const [formData, setFormData] = useState<Partial<GrantSeekerProfile>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    // Load existing data
    const existingData = OnboardingService.getProfileData() as Partial<GrantSeekerProfile>;
    if (existingData) {
      setFormData(existingData);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    }
  };

  const handleProjectDetailsChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      project_details: {
        project_title: '',
        project_description: '',
        project_goals: '',
        project_timeline: '',
        requested_amount: 0,
        ...prev.project_details,
        [field]: value
      }
    }));
  };

  const handleOrganizationInfoChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      organization_info: {
        organization_name: '',
        organization_type: 'nonprofit' as const,
        ...prev.organization_info,
        [field]: value
      }
    }));
  };

  const handlePersonalInfoChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      personal_info: {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        ...prev.personal_info,
        [field]: value
      }
    }));
  };

  const handleNext = async () => {
    console.log("current step: ", currentStep);
    console.log("form step: ", formData);
    console.log("Org info: ", formData.organization_info);
    console.log("org name: ", formData.organization_info?.organization_name);
    console.log("org type: ", formData.organization_info?.organization_type);
    console.log("is loading: ", isLoading);
    setIsLoading(true);
    
    try {
      let updatedData = { ...formData };
      
      if (currentStep === 2 && file) {
        // Upload proposal/CV file
        const cvUrl = await OnboardingService.saveCVFile(file);
        updatedData.cv_file_url = cvUrl;
      }
      
      onStepComplete(updatedData);
    } catch (err: any) {
      console.error('Step completion error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderProjectDetailsStep();
      case 2:
        return renderOrganizationInfoStep();
      default:
        return null;
    }
  };

  const renderProjectDetailsStep = () => (
    <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
      <div className="text-center mb-6">
        <DollarSign className="mx-auto text-blue-500 mb-4" size={48} />
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Project Details
        </h2>
        <p className="text-gray-600">
          Tell us about your project and funding requirements
        </p>
      </div>

      <div className="space-y-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Title *
          </label>
          <input
            type="text"
            value={formData.project_details?.project_title || ''}
            onChange={(e) => handleProjectDetailsChange('project_title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your project title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Description *
          </label>
          <textarea
            value={formData.project_details?.project_description || ''}
            onChange={(e) => handleProjectDetailsChange('project_description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Provide a detailed description of your project, its purpose, and methodology..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Goals & Expected Outcomes
          </label>
          <textarea
            value={formData.project_details?.project_goals || ''}
            onChange={(e) => handleProjectDetailsChange('project_goals', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="What are the main goals and expected outcomes of your project?"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Timeline
            </label>
            <input
              type="text"
              value={formData.project_details?.project_timeline || ''}
              onChange={(e) => handleProjectDetailsChange('project_timeline', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 12 months, 2 years"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Requested Amount (USD)
            </label>
            <input
              type="number"
              value={formData.project_details?.requested_amount || ''}
              onChange={(e) => handleProjectDetailsChange('requested_amount', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 50000"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={formData.personal_info?.first_name || ''}
              onChange={(e) => handlePersonalInfoChange('first_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your first name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={formData.personal_info?.last_name || ''}
              onChange={(e) => handlePersonalInfoChange('last_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your last name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.personal_info?.email || ''}
              onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={formData.personal_info?.phone || ''}
              onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your phone number"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onStepBack}
          className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={
            !formData.project_details?.project_title ||
            !formData.project_details?.project_description ||
            !formData.personal_info?.first_name ||
            !formData.personal_info?.last_name ||
            !formData.personal_info?.email ||
            isLoading
          }
          className="flex-1 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
        >
          {isLoading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );

  const renderOrganizationInfoStep = () => (
    <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
      <div className="text-center mb-6">
        <Building className="mx-auto text-blue-500 mb-4" size={48} />
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Organization Information
        </h2>
        <p className="text-gray-600">
          Provide details about your organization or upload supporting documents
        </p>
      </div>

      <div className="space-y-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organization Name *
          </label>
          <input
            type="text"
            value={formData.organization_info?.organization_name || ''}
            onChange={(e) => handleOrganizationInfoChange('organization_name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter organization name or 'Individual' if applying as an individual"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organization Type *
          </label>
          <select
            value={formData.organization_info?.organization_type || ''}
            onChange={(e) => handleOrganizationInfoChange('organization_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select organization type</option>
            <option value="nonprofit">Nonprofit Organization</option>
            <option value="for-profit">For-Profit Company</option>
            <option value="academic">Academic Institution</option>
            <option value="government">Government Agency</option>
            <option value="individual">Individual</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tax ID / Registration Number
            </label>
            <input
              type="text"
              value={formData.organization_info?.tax_id || ''}
              onChange={(e) => handleOrganizationInfoChange('tax_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Organization tax ID or registration number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization Website
            </label>
            <input
              type="url"
              value={formData.organization_info?.website || ''}
              onChange={(e) => handleOrganizationInfoChange('website', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Supporting Document (Optional)
          </label>
          <div className="relative bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <UploadCloud className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-sm font-medium text-gray-700 mb-1">
              Upload CV, Proposal, or Supporting Document
            </p>
            <p className="text-xs text-gray-500 mb-2">
              PDF format only
            </p>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {file && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
              <p className="text-sm text-green-700">
                ✓ Selected: {file.name}
              </p>
            </div>
          )}

          {formData.cv_file_url && !file && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
              <p className="text-sm text-blue-700">
                ✓ Document already uploaded
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onStepBack}
          className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={
            !formData.organization_info?.organization_name ||
            !formData.organization_info?.organization_type ||
            isLoading
          }
          className="flex-1 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
        >
          {isLoading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center">
      {/* Progress bar */}
      <div className="w-full max-w-md mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</span>
          <span className="text-sm text-gray-500">{Math.round((currentStep / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-6 w-full max-w-2xl text-center">
          {error}
        </div>
      )}

      {renderStep()}
    </div>
  );
};

export default GrantSeekerOnboarding;
