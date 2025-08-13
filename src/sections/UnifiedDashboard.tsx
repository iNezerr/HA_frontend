import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserType } from '../types/user';
import OnboardingService from '../services/onboarding';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaGraduationCap, FaDollarSign } from 'react-icons/fa';

// Import existing components that we'll repurpose
import JobPortal from './JobPortal';

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

  useEffect(() => {
    // Check if user has completed onboarding
    const isOnboardingComplete = OnboardingService.isOnboardingComplete();
    const currentUserType = OnboardingService.getUserType();
    
    if (!isOnboardingComplete || !currentUserType) {
      // Redirect to onboarding if not complete
      navigate('/onboarding', { replace: true });
      return;
    }
    
    setUserType(currentUserType);
    setLoading(false);
  }, [navigate]);

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
      return <JobPortal />;
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
