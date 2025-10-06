import React, { useState, useEffect } from 'react';
import { GraduationCap, UploadCloud, FileText } from 'lucide-react';
import { FaCheck } from 'react-icons/fa';
import OnboardingService from '../../services/onboarding';
import { ScholarshipSeekerProfile } from '../../types/user';

interface ScholarshipSeekerOnboardingProps {
  currentStep: number;
  totalSteps: number;
  onStepComplete: (stepData: any) => void;
  onStepBack: () => void;
  error?: string;
}

const ScholarshipSeekerOnboarding: React.FC<ScholarshipSeekerOnboardingProps> = ({
  currentStep,
  totalSteps,
  onStepComplete,
  onStepBack,
  error
}) => {
  const [formData, setFormData] = useState<Partial<ScholarshipSeekerProfile>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    // Load existing data
    const existingData = OnboardingService.getProfileData() as Partial<ScholarshipSeekerProfile>;
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

  const handleAcademicBackgroundChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      academic_background: {
        current_level: 'undergraduate',
        field_of_study: '',
        current_institution: '',
        current_gpa: '',
        graduation_year: '',
        ...prev.academic_background,
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
    setIsLoading(true);
    
    try {
      let updatedData = { ...formData };
      
      if (currentStep === 2 && file) {
        // Upload CV file
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
        return renderAcademicBackgroundStep();
      case 2:
        return renderCVUploadStep();
      default:
        return null;
    }
  };

  const renderAcademicBackgroundStep = () => (
    <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
      <div className="text-center mb-6">
        <GraduationCap className="mx-auto text-blue-500 mb-4" size={48} />
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Academic Background
        </h2>
        <p className="text-gray-600">
          Tell us about your academic journey, goals, and contact information
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Academic Level *
          </label>
          <select
            value={formData.academic_background?.current_level || ''}
            onChange={(e) => handleAcademicBackgroundChange('current_level', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select your level</option>
            <option value="undergraduate">Undergraduate</option>
            <option value="graduate">Graduate</option>
            <option value="phd">PhD</option>
            <option value="postdoc">Postdoc</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Field of Study *
          </label>
          <input
            type="text"
            value={formData.academic_background?.field_of_study || ''}
            onChange={(e) => handleAcademicBackgroundChange('field_of_study', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Computer Science, Biology, Economics"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Institution
          </label>
          <input
            type="text"
            value={formData.academic_background?.current_institution || ''}
            onChange={(e) => handleAcademicBackgroundChange('current_institution', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Your current university or institution"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current GPA
          </label>
          <input
            type="text"
            value={formData.academic_background?.current_gpa || ''}
            onChange={(e) => handleAcademicBackgroundChange('current_gpa', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., 3.8/4.0 or 85%"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expected Graduation Year
          </label>
          <input
            type="text"
            value={formData.academic_background?.graduation_year || ''}
            onChange={(e) => handleAcademicBackgroundChange('graduation_year', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., 2025"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
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
          Academic Goals & Research Interests
        </label>
        <textarea
          value={formData.academic_goals || ''}
          onChange={(e) => handleInputChange('academic_goals', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe your academic goals, research interests, and what you hope to achieve with scholarship funding..."
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
            !formData.academic_background?.current_level ||
            !formData.academic_background?.field_of_study ||
            !formData.personal_info?.phone ||
            isLoading
          }
          className="flex-1 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
        >
          {isLoading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );

  const renderCVUploadStep = () => (
    <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
      <div className="text-center mb-6">
        <FileText className="mx-auto text-blue-500 mb-4" size={48} />
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Upload Your CV/Resume
        </h2>
        <p className="text-gray-600">
          Upload your academic CV to strengthen your scholarship applications
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
          <p className="text-sm text-green-700 flex items-center">
            <FaCheck className="mr-2" />
            Selected: {file.name}
          </p>
        </div>
      )}

      {formData.cv_file_url && !file && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-blue-700 flex items-center">
            <FaCheck className="mr-2" />
            CV already uploaded
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
          {isLoading ? 'Uploading...' : 'Continue'}
        </button>
      </div>

      <div className="text-center mt-4">
        <button
          onClick={handleNext}
          className="text-sm text-gray-500 hover:text-gray-700"
          disabled={isLoading}
        >
          Skip for now
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

export default ScholarshipSeekerOnboarding;
