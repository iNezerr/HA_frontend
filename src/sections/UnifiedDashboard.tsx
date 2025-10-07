import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserType } from '../types/user';
import { OnboardingService } from '../services/onboarding';
import { useAuth } from '../auth/context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaGraduationCap, FaDollarSign } from 'react-icons/fa';
import { JobList } from '../jobs';
import ProfileCompletion from '../components/ProfileCompletion';
import RecommendedOpportunities from '../components/RecommendedOpportunities';

// Job dashboard with actual functionality
const JobDashboard: React.FC = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Dashboard</h1>
        <p className="text-gray-600">
          Discover AI-matched job opportunities tailored to your skills and experience
        </p>
      </div>

      {/* Profile Completion */}
      <div className="mb-6">
        <ProfileCompletion />
      </div>

      {/* Jobs Section */}
      <div className="space-y-8">
        {/* AI-Powered Job Recommendations */}
        <RecommendedOpportunities 
          title="🎯 AI-Powered Job Matches"
          className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200"
        />

        {/* Latest AI-Matched Jobs */}
        <JobList
          useDashboard={true}
          title="Latest Job Opportunities"
          filters={{
            ordering: '-created_at',
            show_expired: false,
            page_size: 10
          }}
          showLoadMore={true}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        />

        {/* Recently Posted Jobs */}
        <JobList
          useDashboard={false}
          title="Recently Posted Jobs"
          filters={{
            ordering: '-created_at',
            show_expired: false,
            page_size: 6
          }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        />
      </div>
    </div>
  </div>
);

// Placeholder components for scholarship and grant dashboards
const ScholarshipDashboard: React.FC = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-800 mb-6">Scholarship Dashboard</h1>
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Your Scholarship Matches</h2>
      <div className="text-center py-8">
        <FaGraduationCap className="text-4xl mb-4 mx-auto text-blue-600" />
        <p className="text-gray-600 mb-4">
          We're finding the best scholarship opportunities for you based on your academic profile.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-700">
            <strong>Coming Soon:</strong> AI-powered scholarship matching based on your academic background, 
            GPA, field of study, and career goals.
          </p>
        </div>
      </div>
    </div>
  </div>
);

const GrantDashboard: React.FC = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-800 mb-6">Grant Dashboard</h1>
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Your Grant Matches</h2>
      <div className="text-center py-8">
        <FaDollarSign className="text-4xl mb-4 mx-auto text-green-600" />
        <p className="text-gray-600 mb-4">
          We're analyzing grant opportunities that align with your project and organization.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700">
            <strong>Coming Soon:</strong> Smart grant matching based on your project description, 
            funding requirements, and organizational profile.
          </p>
        </div>
      </div>
    </div>
  </div>
);

const UnifiedDashboard: React.FC = () => {
  const [userType, setUserType] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Check onboarding status from backend (stored in auth context)
    // This is the source of truth, not sessionStorage
    const isOnboardingComplete = user?.is_onboarding_complete === true;
    const currentUserType = user?.user_type as UserType | undefined;
    
    console.log('🔍 Dashboard onboarding check:', { 
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

  // Render the appropriate dashboard based on user type
  switch (userType) {
    case 'job':
      return <JobDashboard />;
    case 'scholarship':
      return <ScholarshipDashboard />;
    case 'grant':
      return <GrantDashboard />;
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

export default UnifiedDashboard;
