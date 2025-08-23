import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, User } from 'lucide-react';
import OnboardingService from '../../services/onboarding';
import { JobSeekerProfile } from '../../types/user';
import { useAuth as useAuthContext } from '../../auth/context/AuthContext';

interface DocumentUploadResponse {
  success: boolean;
  document_id: string;
  parsed_data: any;
}

interface JobSeekerOnboardingProps {
  currentStep: number;
  totalSteps: number;
  onStepComplete: (stepData: any) => void;
  onStepBack: () => void;
  error?: string;
}

const JobSeekerOnboarding: React.FC<JobSeekerOnboardingProps> = ({
  currentStep,
  totalSteps,
  onStepComplete,
  onStepBack,
  error
}) => {
  const { isAuthenticated, getIdToken } = useAuthContext();
  const [formData, setFormData] = useState<Partial<JobSeekerProfile>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    // Load existing data
    const existingData = OnboardingService.getProfileData() as Partial<JobSeekerProfile>;
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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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
    setIsLoading(true);
    setUploadProgress(0);
    
    try {
      let updatedData = { ...formData };
      
      if (currentStep === 1 && file) {
        // Upload CV file to GCS through backend with progress tracking
        const uploadResponse = await uploadDocumentWithProgress(file) as DocumentUploadResponse;
        updatedData.cv_file_url = uploadResponse.document_id;
      }
      
      onStepComplete(updatedData);
    } catch (err: any) {
      console.error('Step completion error:', err);
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  // Upload document with progress tracking
  const uploadDocumentWithProgress = async (file: File): Promise<DocumentUploadResponse> => {
    // Check authentication first
    if (!isAuthenticated) {
      throw new Error('User not authenticated. Please log in first.');
    }

    // Get fresh Firebase token
    const token = await getIdToken(true); // Force refresh
    if (!token) {
      throw new Error('No authentication token available');
    }

    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (e) {
            reject(new Error('Invalid response format'));
          }
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Upload failed'));
      };

      const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://backend.huesapply.com';
      xhr.open('POST', `${baseURL}/users/profile/upload-document-file/`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderCVUploadStep();
      case 2:
        return renderPersonalInfoStep();
      default:
        return null;
    }
  };

  const renderCVUploadStep = () => (
    <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
      <div className="text-center mb-6">
        <FileText className="mx-auto text-blue-500 mb-4" size={48} />
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Upload Your CV
        </h2>
        <p className="text-gray-600">
          Upload your CV to help us match you with the best job opportunities
        </p>
      </div>

      <div className="relative bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
        <UploadCloud className="mx-auto text-gray-400 mb-4" size={40} />
        <p className="text-lg font-medium text-gray-700 mb-2">
          Drag & Drop Your CV
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Or click to browse your files
        </p>
        <p className="text-xs text-gray-500">
          Supported format: PDF only
        </p>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      {file && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-green-700">
            ✓ Selected: {file.name}
          </p>
        </div>
      )}

      {/* Upload Progress Bar */}
      {isLoading && uploadProgress > 0 && (
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">Uploading...</span>
            <span className="text-sm text-gray-600">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {formData.cv_file_url && !file && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-blue-700">
            ✓ CV already uploaded
          </p>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={onStepBack}
          className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!file && !formData.cv_file_url || isLoading}
          className="flex-1 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
        >
          {isLoading ? (uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Uploading...') : 'Continue'}
        </button>
      </div>
    </div>
  );

  const renderPersonalInfoStep = () => (
    <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
      <div className="text-center mb-6">
        <User className="mx-auto text-blue-500 mb-4" size={48} />
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Personal Information
        </h2>
        <p className="text-gray-600">
          Tell us about yourself and your career preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Professional Summary
        </label>
        <textarea
          value={formData.summary || ''}
          onChange={(e) => handleInputChange('summary', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Brief summary of your professional background and career goals..."
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Skills (comma-separated)
        </label>
        <input
          type="text"
          value={formData.skills?.join(', ') || ''}
          onChange={(e) => handleInputChange('skills', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., JavaScript, React, Node.js, Project Management"
        />
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

export default JobSeekerOnboarding;
