import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserType } from '../types/user';
import OnboardingService from '../services/onboarding';

// Import step components
import {
  UserTypeSelection,
  JobSeekerOnboarding,
  ScholarshipSeekerOnboarding,
  GrantSeekerOnboarding,
  OnboardingReview
} from '../components/onboarding';
import LoadingSpinner from '../components/LoadingSpinner';

const UnifiedOnboarding: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(3);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has already started onboarding
    const existingState = OnboardingService.getOnboardingState();
    const existingUserType = OnboardingService.getUserType();
    
    if (existingState && existingUserType) {
      // Continue existing onboarding
      setUserType(existingUserType);
      setCurrentStep(existingState.step);
      setTotalSteps(OnboardingService.getTotalSteps(existingUserType));
      
      // If onboarding is complete, redirect to dashboard
      if (existingState.is_complete) {
        navigate('/dashboard', { replace: true });
        return;
      }
    } else {
      // Start fresh onboarding - show user type selection
      setCurrentStep(0);
    }
    
    setLoading(false);
  }, [navigate]);

  const handleUserTypeSelection = (selectedType: UserType) => {
    setUserType(selectedType);
    setTotalSteps(OnboardingService.getTotalSteps(selectedType));
    
    // Initialize onboarding state
    OnboardingService.initializeOnboarding(selectedType);
    
    // Move to first step
    setCurrentStep(1);
  };

  const handleStepComplete = (stepData: any) => {
    setError('');
    
    if (!userType) return;
    
    try {
      // Update profile data
      OnboardingService.updateProfileData(stepData);
      
      // Validate current step
      const profileData = OnboardingService.getProfileData();
      const validation = OnboardingService.validateCurrentStep(userType, currentStep, profileData || {});
      
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return;
      }
      
      // Move to next step
      const nextStep = currentStep + 1;
      
      if (nextStep > totalSteps) {
        // Complete onboarding
        OnboardingService.completeOnboarding();
        navigate('/dashboard', { replace: true });
      } else {
        setCurrentStep(nextStep);
        OnboardingService.updateStep(nextStep);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while processing your information');
    }
  };

  const handleStepBack = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      OnboardingService.updateStep(prevStep);
    } else if (currentStep === 1) {
      // Go back to user type selection
      setCurrentStep(0);
      setUserType(null);
      OnboardingService.clearOnboardingData();
    }
  };

  const renderCurrentStep = () => {
    if (currentStep === 0) {
      return (
        <UserTypeSelection 
          onUserTypeSelect={handleUserTypeSelection}
          error={error}
        />
      );
    }

    if (!userType) return null;

    // Final review step
    if (currentStep === totalSteps) {
      return (
        <OnboardingReview
          userType={userType}
          onComplete={handleStepComplete}
          onBack={handleStepBack}
          error={error}
        />
      );
    }

    // Render user-type specific onboarding steps
    switch (userType) {
      case 'job':
        return (
          <JobSeekerOnboarding
            currentStep={currentStep}
            totalSteps={totalSteps}
            onStepComplete={handleStepComplete}
            onStepBack={handleStepBack}
            error={error}
          />
        );
      case 'scholarship':
        return (
          <ScholarshipSeekerOnboarding
            currentStep={currentStep}
            totalSteps={totalSteps}
            onStepComplete={handleStepComplete}
            onStepBack={handleStepBack}
            error={error}
          />
        );
      case 'grant':
        return (
          <GrantSeekerOnboarding
            currentStep={currentStep}
            totalSteps={totalSteps}
            onStepComplete={handleStepComplete}
            onStepBack={handleStepBack}
            error={error}
          />
        );
      default:
        return (
          <div className="text-center">
            <p className="text-red-500">Invalid user type</p>
            <button 
              onClick={() => setCurrentStep(0)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Start Over
            </button>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <div className="absolute top-6 left-6 text-lg font-semibold text-sky-500">
        Hues Apply
      </div>
      
      {/* Progress indicator (only show if user type is selected) */}
      {userType && currentStep > 0 && (
        <div className="absolute top-6 right-6 text-sm text-gray-500">
          Step {currentStep} of {totalSteps}
        </div>
      )}
      
      {/* Main content */}
      <div className="flex items-center justify-center min-h-screen px-4">
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default UnifiedOnboarding;
