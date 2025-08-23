import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserType } from '../types/user';
import OnboardingService from '../services/onboarding';
import { useAuth } from '../auth/context/AuthContext';

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
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      navigate('/auth/login', { replace: true });
      return;
    }

    // Check if user has already started onboarding
    const existingState = OnboardingService.getOnboardingState();
    const existingUserType = OnboardingService.getUserType();
    
    // Check if user already has a user_type from backend
    if (user?.user_type && !existingUserType) {
      // User has already selected user type in backend, continue from where they left off
      setUserType(user.user_type);
      setTotalSteps(OnboardingService.getTotalSteps(user.user_type));
      OnboardingService.initializeOnboarding(user.user_type);
      setCurrentStep(1);
    } else if (existingState && existingUserType) {
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
  }, [navigate, isAuthenticated, user]);

  const handleUserTypeSelection = async (selectedType: UserType) => {
    setError('');
    setLoading(true);
    
    try {
      // Save user type to backend
      await OnboardingService.saveUserTypeToBackend(selectedType);
      
      setUserType(selectedType);
      setTotalSteps(OnboardingService.getTotalSteps(selectedType));
      
      // Initialize onboarding state
      OnboardingService.initializeOnboarding(selectedType);
      
      // Move to first step
      setCurrentStep(1);
    } catch (err: any) {
      setError(err.message || 'Failed to save user type. Please try again.');
      console.error('User type selection error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStepComplete = async (stepData: any) => {
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
        // Complete onboarding with backend integration
        setLoading(true);
        try {
          await OnboardingService.completeOnboardingProcess();
          
          // Always redirect to dashboard - UnifiedDashboard will handle routing based on user type
          navigate('/dashboard', { replace: true });
        } catch (err: any) {
          setError(err.message || 'Failed to complete onboarding. Please try again.');
          setLoading(false);
        }
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
          loading={loading}
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
