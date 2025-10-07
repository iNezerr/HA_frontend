import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, MapPin, User, Briefcase } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';

interface ProfileCompletionProps {
  className?: string;
  context?: 'general' | 'scholarship';
  isScholarshipPage?: boolean;
}

interface CompletionStatus {
  percentage: number;
  missingFields: string[];
  completedSections?: string[];
}

const ProfileCompletion = ({
  className = '',
  context = 'general',
  isScholarshipPage = false
}: ProfileCompletionProps) => {
  const navigate = useNavigate();
  
  const { user, profileCompletion, loading: isLoading } = useProfile();
  
  const [error, setError] = useState<string | null>(null);

  const isScholarshipContext = context === 'scholarship' || isScholarshipPage;

  const completionStatus: CompletionStatus | null = profileCompletion ? {
    percentage: profileCompletion.percentage,
    missingFields: profileCompletion.missingFields,
    completedSections: profileCompletion.completedSections
  } : calculateCompletion(user);

  function calculateCompletion(userData: any): CompletionStatus {
    if (!userData) {
      return { 
        percentage: 0, 
        missingFields: ['personal_info', 'career_profile', 'education', 'experience', 'projects', 'ai_preferences'],
        completedSections: []
      };
    }

    const sections = {
      personal_info: Boolean(userData.name && userData.email && userData.profile?.location),
      career_profile: Boolean(
        userData.profile_data?.current_role && 
        userData.profile?.skills?.length > 0
      ),
      education: Boolean(userData.profile?.education?.length > 0),
      experience: Boolean(userData.profile_data?.experience?.length > 0),
      projects: Boolean(userData.profile_data?.projects?.length > 0),
      ai_preferences: Boolean(userData.profile_data?.ai_assistance_enabled !== undefined),
    };

    const totalSections = Object.keys(sections).length;
    const completedCount = Object.values(sections).filter(Boolean).length;
    const percentage = Math.round((completedCount / totalSections) * 100);

    const missingFields = Object.entries(sections)
      .filter(([_, completed]) => !completed)
      .map(([field]) => field);

    const completedSections = Object.entries(sections)
      .filter(([_, completed]) => completed)
      .map(([field]) => field);

    return {
      percentage,
      missingFields,
      completedSections
    };
  }

  const getScholarshipSpecificSections = (missingSections: string[]) => {
    const scholarshipRelevantSections: Record<string, { icon: any; label: string; priority: string }> = {
      'personal_info': { icon: User, label: 'Personal Information', priority: 'high' },
      'education': { icon: GraduationCap, label: 'Education', priority: 'high' },
      'experience': { icon: Briefcase, label: 'Experience', priority: 'medium' },
      'career_profile': { icon: MapPin, label: 'Career Profile', priority: 'medium' }
    };

    return missingSections
      .filter(section => scholarshipRelevantSections[section])
      .map(section => ({
        ...scholarshipRelevantSections[section],
        key: section
      }))
      .sort((a, _b) => a.priority === 'high' ? -1 : 1);
  };

  const getContextualContent = () => {
    if (isScholarshipContext) {
      return {
        title: 'Complete Profile for Better Scholarship Matches',
        description: 'Complete your profile to get more accurate scholarship recommendations and increase your chances of finding relevant opportunities.',
        buttonText: 'Complete Profile for Scholarships',
        urgencyText: 'Many scholarships require detailed academic and personal information'
      };
    }

    return {
      title: 'Complete Your Profile',
      description: 'Complete your profile to get better opportunity matches and increase your visibility to employers.',
      buttonText: 'Update Profile',
      urgencyText: null
    };
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
          <div className="h-2 bg-gray-200 rounded mb-4"></div>
          <div className="h-3 bg-gray-200 rounded mb-4 w-1/2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500 ${className}`}>
        <div className="text-center">
          <div className="text-red-500 mb-2">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Profile Status</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!completionStatus) {
    return null;
  }

  const { percentage, missingFields } = completionStatus;

  if (percentage >= 100) {
    return null;
  }

  const contextContent = getContextualContent();
  const scholarshipSections = isScholarshipContext ? getScholarshipSpecificSections(missingFields) : [];

  const getColorByPercentage = (pct: number) => {
    if (pct < 30) return 'bg-red-500';
    if (pct < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getBorderColor = () => {
    if (isScholarshipContext) {
      return percentage < 50 ? 'border-orange-500' : 'border-blue-500';
    }
    return 'border-blue-500';
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${getBorderColor()} ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{contextContent.title}</h3>
        <span className="text-2xl font-bold text-blue-600">{percentage}%</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
        <div
          className={`h-3 rounded-full transition-all duration-300 ${getColorByPercentage(percentage)}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        ></div>
      </div>

      <p className="text-gray-600 mb-4">
        {contextContent.description}
      </p>

      {isScholarshipContext && contextContent.urgencyText && percentage < 70 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <GraduationCap className="w-5 h-5 text-orange-600 mr-2 flex-shrink-0" />
            <p className="text-orange-800 text-sm font-medium">
              {contextContent.urgencyText}
            </p>
          </div>
        </div>
      )}

      {isScholarshipContext && scholarshipSections.length > 0 ? (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Critical for scholarship matching:</h4>
          <div className="space-y-2">
            {scholarshipSections.map((section) => {
              const Icon = section.icon;
              return (
                <div
                  key={section.key}
                  className={`flex items-center px-3 py-2 rounded-lg border ${section.priority === 'high'
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                    }`}
                >
                  <Icon className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-sm font-medium">{section.label}</span>
                  {section.priority === 'high' && (
                    <span className="ml-auto text-xs font-bold">Required</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : missingFields.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Missing sections:</h4>
          <div className="flex flex-wrap gap-2">
            {missingFields.map((section, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full"
              >
                {section.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => navigate('/profile')}
        className={`w-full py-2 px-4 rounded-md transition-colors ${isScholarshipContext
          ? 'bg-orange-500 hover:bg-orange-600 text-white'
          : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
      >
        {contextContent.buttonText}
      </button>
    </div>
  );
};

export default ProfileCompletion;