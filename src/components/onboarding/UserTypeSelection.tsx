import React, { useState } from 'react';
import { UserType } from '../../types/user';
import { FaBriefcase, FaGraduationCap, FaDollarSign, FaCheck } from 'react-icons/fa';

interface UserTypeSelectionProps {
  onUserTypeSelect: (userType: UserType) => void;
  error?: string;
  loading?: boolean;
}

const UserTypeSelection: React.FC<UserTypeSelectionProps> = ({ onUserTypeSelect, error, loading = false }) => {
  const [selectedType, setSelectedType] = useState<UserType | null>(null);

  const userTypes = [
    {
      type: 'job' as UserType,
      title: 'Job Opportunities',
      description: 'Find relevant job opportunities tailored to your skills and experience',
      icon: <FaBriefcase className="text-4xl" />,
      features: ['AI-powered job matching', 'CV optimization tips', 'Application tracking']
    },
    {
      type: 'scholarship' as UserType,
      title: 'Scholarship Opportunities',
      description: 'Discover scholarships that match your academic background and goals',
      icon: <FaGraduationCap className="text-4xl" />,
      features: ['Academic achievement tracking', 'Deadline reminders', 'Eligibility matching']
    },
    {
      type: 'grant' as UserType,
      title: 'Grant Opportunities',
      description: 'Find grants and funding for your projects and initiatives',
      icon: <FaDollarSign className="text-4xl" />,
      features: ['Project-based matching', 'Funding amount filters', 'Application guidance']
    }
  ];

  const handleSelection = (type: UserType) => {
    setSelectedType(type);
  };

  const handleContinue = () => {
    if (selectedType) {
      onUserTypeSelect(selectedType);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome to Hues Apply
        </h1>
        <p className="text-lg text-gray-600">
          What type of opportunities are you looking for?
        </p>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-6 text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {userTypes.map((userType) => (
          <div
            key={userType.type}
            className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
              selectedType === userType.type
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
            }`}
            onClick={() => handleSelection(userType.type)}
          >
            <div className="text-center mb-4">
              <div className="text-4xl mb-2 text-blue-600">{userType.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {userType.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {userType.description}
              </p>
            </div>
            
            <div className="space-y-2">
              {userType.features.map((feature, index) => (
                <div key={index} className="flex items-center text-sm text-gray-700">
                  <FaCheck className="text-green-500 mr-2" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={handleContinue}
          disabled={!selectedType || loading}
          className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
            selectedType && !loading
              ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </div>
          ) : (
            `Continue with ${selectedType ? userTypes.find(t => t.type === selectedType)?.title : 'Selection'}`
          )}
        </button>
      </div>

      <div className="text-center mt-6">
        <p className="text-sm text-gray-500">
          You can always change your preferences later in your profile settings
        </p>
      </div>
    </div>
  );
};

export default UserTypeSelection;
