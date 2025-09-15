import { useState } from 'react';
import {
  User,
  ExternalLink,
  Clipboard,
  Camera,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../auth/context/AuthContext';
import { useProfile } from '../profile/hooks/useProfile';
import PersonalTab from '../profile/components/PersonalTab';
import CareerProfileTab from '../profile/components/CareerProfileTab';
import EducationTab from '../profile/components/EducationTab';
import ExperienceTab from '../profile/components/ExperienceTab';
import ProjectsTab from '../profile/components/ProjectsTab';
import AITab from '../profile/components/AITab';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('Personal');
  const { user: _authUser } = useAuth();
  
  // Use the real profile hook from the profile module
  const {
    user,
    profileCompletion,
    documents,
    loading,
    uploading,
    error,
    refreshProfile,
    updateProfile,
    updateUser,
    uploadDocument,
  } = useProfile();

  // Transform the backend data to match the component expectations
  const transformedData = {
    loading,
    error,
    validationErrors: {} as Record<string, string[]>,
    profileData: {
      profile_picture: '/hero/userprofile.svg', // TODO: Add profile picture support
      bio: user?.profile?.summary || '',
      linkedin_url: user?.profile_data?.linkedin_url || '',
      github_url: user?.profile_data?.github_url || '',
      website: user?.profile_data?.website || ''
    },
    personalInfo: {
      first_name: user?.name?.split(' ')[0] || '',
      last_name: user?.name?.split(' ').slice(1).join(' ') || '',
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.profile_data?.phone || '',
      location: user?.profile?.location || '',
      country: user?.profile?.location || '',
      bio: user?.profile?.summary || '',
      goal: user?.profile_data?.career_goal || ''
    },
    cvFile: documents.find(doc => doc.document_type === 'cv') ? {
      filename: documents.find(doc => doc.document_type === 'cv')?.filename || '',
      uploadedAt: documents.find(doc => doc.document_type === 'cv')?.uploaded_at || '',
      downloadUrl: documents.find(doc => doc.document_type === 'cv')?.gcs_url || ''
    } : undefined,
    careerProfile: {
      current_role: user?.profile_data?.current_role || '',
      career_level: user?.profile_data?.career_level || '',
      industry: user?.profile_data?.industry || '',
      skills: user?.profile?.skills || [],
      preferred_roles: user?.profile_data?.preferred_roles || []
    },
    education: user?.profile?.education || [],
    experience: user?.profile_data?.experience || [],
    projects: user?.profile_data?.projects || [],
    aiPreferences: {
      ai_assistance_enabled: user?.profile_data?.ai_assistance_enabled ?? true,
      preferred_communication_style: user?.profile_data?.preferred_communication_style || 'Professional',
      job_alert_frequency: user?.profile_data?.job_alert_frequency || 'Weekly',
      opportunities: user?.profile_data?.opportunities || [],
      prioritizeBy: user?.profile_data?.prioritizeBy || [],
      salaryExpectation: user?.profile_data?.salaryExpectation || ''
    },
    // Optimized action functions that use the new API pattern
    setPersonalInfo: async (newPersonalInfo: any) => {
      try {
        const name = newPersonalInfo.name || [
          newPersonalInfo.first_name,
          newPersonalInfo.last_name,
        ].filter(Boolean).join(' ');

        await updateUser({ name });

        await updateProfile({
          location: newPersonalInfo.location || newPersonalInfo.country,
          summary: newPersonalInfo.bio,
        });

        if (newPersonalInfo.phone || newPersonalInfo.goal) {
          const updatedProfileData = {
            ...user?.profile_data,
            phone: newPersonalInfo.phone,
            career_goal: newPersonalInfo.goal,
          };

          await updateUser({
            profile_data: updatedProfileData,
          });
        }
      } catch (err) {
        console.error('Failed to update personal info:', err);
        throw err;
      }
    },
    setCareerProfile: async (newCareerProfile: any) => {
      try {
        await updateProfile({
          skills: newCareerProfile.skills,
        });

        const updatedProfileData = {
          ...user?.profile_data,
          current_role: newCareerProfile.current_role,
          career_level: newCareerProfile.career_level,
          industry: newCareerProfile.industry,
          preferred_roles: newCareerProfile.preferred_roles,
        };

        await updateUser({
          profile_data: updatedProfileData,
        });
      } catch (err) {
        console.error('Failed to update career profile:', err);
        throw err;
      }
    },
    setEducation: async (newEducation: any) => {
      try {
        await updateProfile({
          education: newEducation,
        });
      } catch (err) {
        console.error('Failed to update education:', err);
      }
    },
    setExperience: async (newExperience: any) => {
      try {
        const updatedProfileData = {
          ...user?.profile_data,
          experience: newExperience,
        };
        
        await updateUser({
          profile_data: updatedProfileData,
        });
      } catch (err) {
        console.error('Failed to update experience:', err);
      }
    },
    setProjects: async (newProjects: any) => {
      try {
        const updatedProfileData = {
          ...user?.profile_data,
          projects: newProjects,
        };
        
        await updateUser({
          profile_data: updatedProfileData,
        });
      } catch (err) {
        console.error('Failed to update projects:', err);
      }
    },
    setAIPreferences: async (newAIPreferences: any) => {
      try {
        const updatedProfileData = {
          ...user?.profile_data,
          ai_assistance_enabled: newAIPreferences.ai_assistance_enabled,
          preferred_communication_style: newAIPreferences.preferred_communication_style,
          job_alert_frequency: newAIPreferences.job_alert_frequency,
        };
        
        await updateUser({
          profile_data: updatedProfileData,
        });
      } catch (err) {
        console.error('Failed to update AI preferences:', err);
      }
    },
    fetchProfileData: refreshProfile,
    handleSave: (_tab?: string) => {}, // Individual saves are handled by each setter
    addEducation: () => {},
    deleteEducationEntry: async (_id: string, _index: number) => {},
    addExperience: () => {},
    deleteExperienceEntry: async (_id: string, _index: number) => {},
    addProject: () => {},
    deleteProjectEntry: (_id: string, _index: number) => {}
  };

  // Use the transformed data
  const {
    loading: isLoading,
    error: profileError,
    validationErrors,
    profileData,
    personalInfo,
    cvFile,
    careerProfile,
    education,
    experience,
    projects,
    aiPreferences,
    setPersonalInfo,
    setCareerProfile,
    setEducation,
    setExperience,
    setProjects,
    setAIPreferences,
    fetchProfileData,
    handleSave,
    addEducation,
    deleteEducationEntry,
    addExperience,
    deleteExperienceEntry,
    addProject,
    deleteProjectEntry
  } = transformedData;

  const tabs = ['Personal', 'Career Profile', 'Education', 'Experience', 'Projects', 'AI'];

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-100 items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="flex min-h-screen bg-gray-100 items-center justify-center p-4">
        <div className="text-center bg-white p-6 sm:p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-500 mb-4">
            <AlertCircle className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Profile</h3>
          <p className="text-gray-600 mb-4 text-sm">{profileError}</p>
          <button
            onClick={fetchProfileData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full sm:w-auto transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const ProfileSidebar = ({ className = "" }) => (
    <div className={`bg-white rounded-xl shadow-sm p-4 sm:p-6 border-0 ${className}`}>
      {/* Profile Image */}
      <div className="text-center">
        <div className="relative w-20 sm:w-24 h-20 sm:h-24 rounded-full mx-auto overflow-hidden border-4 border-white shadow-md">
          {profileData?.profile_picture ? (
            <img
              src={profileData.profile_picture || '/hero/userprofile.svg'}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <User size={32} className="text-gray-500" />
            </div>
          )}

          {/* Camera Icon Overlay */}
          <div className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-md">
            <Camera size={14} className="text-blue-600" />
          </div>
        </div>

        {/* Name & Title */}
        <h3 className="mt-3 sm:mt-4 font-semibold text-base sm:text-lg text-gray-900">
          {user?.name || 'User'}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500">
          {careerProfile.current_role || `${user?.user_type || 'User'} Seeker`}
        </p>
        
        {/* Profile Completion Progress */}
        {profileCompletion && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-blue-900">Profile Completion</span>
              <span className="text-xs font-bold text-blue-600">{profileCompletion.percentage}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${profileCompletion.percentage}%` }}
              ></div>
            </div>
            {profileCompletion.missingFields.length > 0 && (
              <p className="text-xs text-blue-700 mt-2">
                Complete {profileCompletion.missingFields.length} more sections to boost your profile
              </p>
            )}
          </div>
        )}
      </div>

      {/* CV File Section */}
      {cvFile && (
        <div className="mt-6 sm:mt-8 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">{cvFile.filename}</p>
                {cvFile.uploadedAt && (
                  <p className="text-xs text-gray-500">
                    Uploaded {new Date(cvFile.uploadedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            {cvFile.downloadUrl && (
              <a
                href={cvFile.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-xs font-medium"
              >
                View
              </a>
            )}
          </div>
        </div>
      )}

      {/* Upload CV Section - Show if no CV uploaded */}
      {!cvFile && (
        <div className="mt-6 sm:mt-8 p-3 bg-orange-50 rounded-lg border border-orange-200">
          <div className="text-center">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-xs text-orange-700 mb-2">Upload your CV/Resume</p>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    await uploadDocument(file, 'cv');
                  } catch (error) {
                    console.error('Upload failed:', error);
                  }
                }
              }}
              className="hidden"
              id="cv-upload"
            />
            <label
              htmlFor="cv-upload"
              className="text-xs text-orange-600 hover:text-orange-700 cursor-pointer font-medium"
            >
              Choose File
            </label>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mt-6 sm:mt-12 space-y-3 sm:space-y-5 text-xs sm:text-sm">
        <div className="flex justify-between text-gray-700">
          <span>Profile completion</span>
          <span className="font-medium text-blue-600">{profileCompletion?.percentage || 0}%</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Account type</span>
          <span className="font-medium text-green-600 capitalize">{user?.user_type || 'User'}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Member since</span>
          <span className="font-medium text-gray-600">
            {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently'}
          </span>
        </div>
        {user?.profile?.skills && user.profile.skills.length > 0 && (
          <div className="flex justify-between text-gray-700">
            <span>Skills listed</span>
            <span className="font-medium text-purple-600">{user.profile.skills.length}</span>
          </div>
        )}
      </div>

      {/* View Profile Button */}
      <button className="w-full mt-6 sm:mt-32 py-2 text-xs sm:text-sm text-black font-medium border border-gray-600 rounded-md hover:bg-gray-50 transition">
        View public profile
      </button>

      {/* Profile Link */}
      <div className="mt-3 sm:mt-4 bg-gray-100 text-blue-600 text-xs rounded-md p-2 flex items-center justify-between">
        <div className="truncate flex items-center">
          <ExternalLink size={10} className="mr-1 flex-shrink-0" />
          <span className="truncate">https://www.abc...</span>
        </div>
        <Clipboard size={10} className="ml-2 cursor-pointer flex-shrink-0" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden relative px-4 py-4 bg-gradient-to-r from-blue-600 to-blue-400 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero/path-to-star-texture.png')" }}>
        <div className="absolute inset-0 bg-gradient-to-r"></div>
        <div className="relative z-10">
          <h1 className="text-xl font-semibold text-white">
            Welcome, {user?.name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-blue-100 text-sm">
            {profileCompletion && profileCompletion.percentage < 100 
              ? 'Complete your profile for better matches'
              : 'Your profile is complete!'
            }
          </p>
          {uploading && (
            <div className="mt-2 flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span className="text-blue-100 text-xs">Uploading...</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex">
        {/* Desktop Layout */}
        <div className="hidden lg:block lg:w-full">
          {/* Desktop Header */}
          <div className="h-56 relative bg-gradient-to-r from-blue-600 to-blue-400 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/hero/path-to-star-texture.png')" }}>
            <div className="absolute inset-0 bg-gradient-to-r"></div>
            <div className="relative z-10 px-12 pt-10">
              <h1 className="text-3xl font-semibold text-white">
                Welcome back, {user?.name?.split(' ')[0] || 'User'}!
              </h1>
              <p className="text-blue-100 mt-1 text-sm">
                {profileCompletion && profileCompletion.percentage < 100 
                  ? `Your profile is ${profileCompletion.percentage}% complete`
                  : 'Your profile is looking great!'
                }
              </p>
              {uploading && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span className="text-blue-100">Uploading document...</span>
                </div>
              )}
            </div>

            {/* Desktop Content */}
            <div className="flex mx-6 mt-16 gap-6 relative">
              {/* Desktop Sidebar */}
              <div className="w-80 flex-shrink-0">
                <ProfileSidebar />
              </div>

              {/* Desktop Profile Form */}
              <div className="flex-1 p-6 bg-white rounded-xl shadow-sm border-0">
                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-3 -mb-px text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === tab
                        ? 'border-black text-black'
                        : 'border-transparent text-gray-500 hover:text-black hover:border-gray-300'
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-lg p-6">
                  {activeTab === 'Personal' && (
                    <PersonalTab
                      personalInfo={personalInfo}
                      setPersonalInfo={setPersonalInfo}
                      validationErrors={validationErrors.personal || []}
                    />
                  )}

                  {activeTab === 'Career Profile' && (
                    <CareerProfileTab
                      careerProfile={careerProfile}
                      setCareerProfile={setCareerProfile}
                      cvFile={cvFile}
                      onCvUpload={() => {
                        // Refresh profile data after CV upload
                        fetchProfileData();
                      }}
                      validationErrors={validationErrors.career || []}
                    />
                  )}

                  {activeTab === 'Education' && (
                    <EducationTab
                      education={education}
                      setEducation={setEducation}
                      addEducation={addEducation}
                      deleteEducationEntry={deleteEducationEntry}
                    />
                  )}

                  {activeTab === 'Experience' && (
                    <ExperienceTab
                      experience={experience}
                      setExperience={setExperience}
                      addExperience={addExperience}
                      deleteExperienceEntry={deleteExperienceEntry}
                    />
                  )}

                  {activeTab === 'Projects' && (
                    <ProjectsTab
                      projects={projects}
                      setProjects={setProjects}
                      addProject={addProject}
                      deleteProjectEntry={deleteProjectEntry}
                    />
                  )}

                  {activeTab === 'AI' && (
                    <AITab
                      aiPreferences={aiPreferences}
                      setAIPreferences={setAIPreferences}
                    />
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 pt-6 border-t">
                    <button className="px-6 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                      Previous
                    </button>
                    <button
                      onClick={() => handleSave(activeTab)}
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : (activeTab === 'AI' ? 'Save' : 'Next')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden w-full">
          <div className="p-4 space-y-4">
            {/* Mobile Profile Sidebar */}
            <ProfileSidebar />

            {/* Mobile Profile Form */}
            <div className="bg-white rounded-xl shadow-sm border-0">
              {/* Mobile Tab Navigation */}
              <div className="border-b border-gray-200">
                <div className="flex overflow-x-auto pb-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === tab
                        ? 'border-black text-black'
                        : 'border-transparent text-gray-500'
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Tab Content */}
              <div className="p-4">
                {activeTab === 'Personal' && (
                  <PersonalTab
                    personalInfo={personalInfo}
                    setPersonalInfo={setPersonalInfo}
                  />
                )}

                {activeTab === 'Career Profile' && (
                  <CareerProfileTab
                    careerProfile={careerProfile}
                    setCareerProfile={setCareerProfile}
                    cvFile={cvFile}
                    onCvUpload={() => {
                      // Refresh profile data after CV upload
                      fetchProfileData();
                    }}
                  />
                )}

                {activeTab === 'Education' && (
                  <EducationTab
                    education={education}
                    setEducation={setEducation}
                    addEducation={addEducation}
                    deleteEducationEntry={deleteEducationEntry}
                  />
                )}

                {activeTab === 'Experience' && (
                  <ExperienceTab
                    experience={experience}
                    setExperience={setExperience}
                    addExperience={addExperience}
                    deleteExperienceEntry={deleteExperienceEntry}
                  />
                )}

                {activeTab === 'Projects' && (
                  <ProjectsTab
                    projects={projects}
                    setProjects={setProjects}
                    addProject={addProject}
                    deleteProjectEntry={deleteProjectEntry}
                  />
                )}

                {activeTab === 'AI' && (
                  <AITab
                    aiPreferences={aiPreferences}
                    setAIPreferences={setAIPreferences}
                  />
                )}

                {/* Mobile Action Buttons */}
                <div className="flex flex-col gap-3 mt-6 pt-6 border-t">
                  <button
                    onClick={() => handleSave(activeTab)}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : (activeTab === 'AI' ? 'Save' : 'Next')}
                  </button>
                  <button className="w-full px-6 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                    Previous
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
