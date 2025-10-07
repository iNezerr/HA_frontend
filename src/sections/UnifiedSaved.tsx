import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserType } from '../types/user';
import { OnboardingService } from '../services/onboarding';
import { useAuth } from '../auth/context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import SaveJobs from '../components/SaveJobs';
import SaveScholarships from '../components/SaveScholarships';
import SaveGrants from '../components/SaveGrants';

const UnifiedSavedPage: React.FC = () => {
  const [userType, setUserType] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Check onboarding status from backend (stored in auth context)
    // This is the source of truth, not sessionStorage
    const isOnboardingComplete = user?.is_onboarding_complete === true;
    const currentUserType = user?.user_type as UserType | undefined;
    
    console.log('🔍 Saved Page onboarding check:', { 
      isOnboardingComplete, 
      currentUserType,
      user: user ? { uid: user.uid, email: user.email } : null
    });
    
    if (!isOnboardingComplete || !currentUserType) {
      // Redirect to onboarding if not complete
      console.log('⚠️ Redirecting to onboarding: incomplete or no user type');
      navigate('/onboarding', { replace: true });
      return;
    }
    
    // Also sync to local storage for offline reference (but backend is source of truth)
    OnboardingService.saveUserType(currentUserType);
    
    setUserType(currentUserType);
    setLoading(false);
  }, [navigate, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!userType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Unable to determine user type</p>
          <button
            onClick={() => navigate('/onboarding')}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Complete Onboarding
          </button>
        </div>
      </div>
    );
  }

  // Render the appropriate saved page based on user type
  switch (userType) {
    case 'job':
      return <SaveJobs />;
    case 'scholarship':
      return <SaveScholarships />;
    case 'grant':
      return <SaveGrants />;
    default:
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Unknown user type: {userType}</p>
            <button
              onClick={() => navigate('/onboarding')}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Reset Onboarding
            </button>
          </div>
        </div>
      );
  }
};

export default UnifiedSavedPage;