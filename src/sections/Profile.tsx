import { useState, useRef, useMemo, useEffect } from 'react';
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
import { CareerProfileData } from '../profile/services/userAPI_new';
import EducationTab from '../profile/components/EducationTab';
import ExperienceTab from '../profile/components/ExperienceTab';
import ProjectsTab from '../profile/components/ProjectsTab';
import AITab from '../profile/components/AITab';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('Personal');
  const { user: _authUser } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [forceDocuments, setForceDocuments] = useState<any[]>([]);
  
  // Use the profile hook from the profile module
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

  useEffect(() => {
    if (documents && documents.length > 0) {
      setForceDocuments(documents);
    }
  }, [documents]);

  const personalTabRef = useRef<any>(null);
  const aiTabRef = useRef<any>(null);
  const educationTabRef = useRef<any>(null);
  const experienceTabRef = useRef<any>(null);
  const projectTabRef = useRef<any>(null);
  const careerProfileRef = useRef<any>(null);

  // Transform the backend data to match the component expectations
  const transformedData = useMemo(() => ({
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
    cvFile: (() => {
      const allDocs = forceDocuments.length > 0 ? forceDocuments : (documents || []);
      const cvDoc = allDocs.find(doc => doc.document_type === 'cv');
      
      if (cvDoc) {
        return {
          filename: cvDoc.original_filename || cvDoc.filename || 'Resume.pdf',
          uploadedAt: cvDoc.uploaded_at || '',
          downloadUrl: cvDoc.signed_download_url || cvDoc.gcs_url || '',
          hasCvInGcs: !!(cvDoc.signed_download_url || cvDoc.gcs_url)
        };
      }
      
      return undefined;
    })(),
    careerProfile: {
      current_role: user?.profile_data?.current_role || '',
      career_level: user?.profile_data?.career_level || '',
      industry: user?.profile_data?.industry || '',
      skills: user?.profile?.skills || [],
      preferred_roles: user?.profile_data?.preferred_roles || [],
      jobTitle: user?.profile_data?.current_role || '',
      profileSummary: user?.profile?.summary || ''
    } as CareerProfileData,
    education: (user?.profile?.education && user.profile.education.length > 0) 
      ? user.profile.education 
      : [{
          id: 'default',
          degree: '',
          school: '',
          startDate: '',
          endDate: '',
          isStudying: false,
          description: ''
        }],
    experience: (user?.profile_data?.experience && user.profile_data.experience.length > 0)
      ? user.profile_data.experience
      : [{
          id: 'default',
          jobTitle: '',
          companyName: '',
          location: '',
          startDate: '',
          endDate: '',
          isCurrentlyWorking: false,
          description: ''
        }],
    projects: (user?.profile_data?.projects && user.profile_data.projects.length > 0)
      ? user.profile_data.projects
      : [{
          id: 'default',
          projectTitle: '',
          startDate: '',
          endDate: '',
          isCurrentlyWorking: false,
          projectLink: '',
          description: ''
        }],
    aiPreferences: {
      ai_assistance_enabled: user?.profile_data?.ai_assistance_enabled ?? true,
      preferred_communication_style: user?.profile_data?.preferred_communication_style || 'Professional',
      job_alert_frequency: user?.profile_data?.job_alert_frequency || 'Weekly',
      opportunities: user?.profile_data?.opportunities || [],
      prioritizeBy: user?.profile_data?.prioritizeBy || [],
      salaryExpectation: user?.profile_data?.salaryExpectation || ''
    },
    // Optimized action functions following the new API pattern
    setPersonalInfo: async (newPersonalInfo: any) => {
      try {
        // Handle name field - use either the combined name or construct from first/last
        const name = newPersonalInfo.name || 
          [newPersonalInfo.first_name, newPersonalInfo.last_name].filter(Boolean).join(' ');
        
        // Update user basic info
        await updateUser({ 
          name: name,
        });
        
        // Update profile summary and location
        await updateProfile({
          location: newPersonalInfo.location || newPersonalInfo.country,
          summary: newPersonalInfo.bio,
        });

        // Update additional profile_data fields through user update
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
    setCareerProfile: async (newCareerProfile: CareerProfileData) => {
      try {
        const hasChanges = JSON.stringify({
          gcs_url: user?.profile_data?.gcs_url,
          skills: user?.profile?.skills,
          current_role: user?.profile_data?.current_role,
          career_level: user?.profile_data?.career_level,
          industry: user?.profile_data?.industry,
          preferred_roles: user?.profile_data?.preferred_roles,
          jobTitle: user?.profile_data?.current_role,
          profileSummary: user?.profile?.summary
        }) !== JSON.stringify(newCareerProfile);
        
        if (!hasChanges) return;
        
        await updateProfile({
          skills: newCareerProfile.skills,
          summary: newCareerProfile.profileSummary
        });
        
        const updatedProfileData = {
          ...user?.profile_data,
          current_role: newCareerProfile.current_role || newCareerProfile.jobTitle,
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
        await refreshProfile(); // Refresh to get updated data
      } catch (err) {
        console.error('Failed to update education:', err);
        throw err;
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
        await refreshProfile(); // Refresh to get updated data
      } catch (err) {
        console.error('Failed to update experience:', err);
        throw err;
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
        await refreshProfile(); // Refresh to get updated data
      } catch (err) {
        console.error('Failed to update projects:', err);
        throw err;
      }
    },
    setAIPreferences: async (newAIPreferences: any) => {
      try {
        const updatedProfileData = {
          ...user?.profile_data,
          ai_assistance_enabled: newAIPreferences.ai_assistance_enabled,
          preferred_communication_style: newAIPreferences.preferred_communication_style,
          job_alert_frequency: newAIPreferences.job_alert_frequency,
          opportunities: newAIPreferences.opportunities,
          prioritizeBy: newAIPreferences.prioritizeBy,
          salaryExpectation: newAIPreferences.salaryExpectation,
        };
        
        await updateUser({
          profile_data: updatedProfileData,
        });

        await refreshProfile();
      } catch (err) {
        console.error('Failed to update AI preferences:', err);
        throw err;
      }
    },
    fetchProfileData: refreshProfile,
    handleSave: (_tab?: string) => {}, // Individual saves are handled by each setter
    addEducation: async () => {
      try {
        const newEntry = {
          id: `temp-${Date.now()}`,
          degree: '',
          school: '',
          startDate: '',
          endDate: '',
          isStudying: false,
          description: ''
        };
        const updatedEducation = [...(user?.profile?.education || []), newEntry];
        await updateProfile({
          education: updatedEducation,
        });
        await refreshProfile();
      } catch (err) {
        console.error('Failed to add education:', err);
      }
    },
    deleteEducationEntry: async (_id: string, index: number) => {
      try {
        const currentEducation = user?.profile?.education || [];
        // Only allow deletion if there's more than one entry
        if (currentEducation.length > 1) {
          const updatedEducation = currentEducation.filter((_: any, i: number) => i !== index);
          await updateProfile({
            education: updatedEducation,
          });
          await refreshProfile();
        }
      } catch (err) {
        console.error('Failed to delete education:', err);
      }
    },
    addExperience: async () => {
      try {
        const newEntry = {
          id: `temp-${Date.now()}`,
          jobTitle: '',
          companyName: '',
          location: '',
          startDate: '',
          endDate: '',
          isCurrentlyWorking: false,
          description: ''
        };
        const currentExperience = user?.profile_data?.experience || [];
        const updatedExperience = [...currentExperience, newEntry];
        const updatedProfileData = {
          ...user?.profile_data,
          experience: updatedExperience,
        };
        await updateUser({
          profile_data: updatedProfileData,
        });
        await refreshProfile();
      } catch (err) {
        console.error('Failed to add experience:', err);
      }
    },
    deleteExperienceEntry: async (_id: string, index: number) => {
      try {
        const currentExperience = user?.profile_data?.experience || [];
        // Only allow deletion if there's more than one entry
        if (currentExperience.length > 1) {
          const updatedExperience = currentExperience.filter((_: any, i: number) => i !== index);
          const updatedProfileData = {
            ...user?.profile_data,
            experience: updatedExperience,
          };
          await updateUser({
            profile_data: updatedProfileData,
          });
          await refreshProfile();
        }
      } catch (err) {
        console.error('Failed to delete experience:', err);
      }
    },
    addProject: async () => {
      try {
        const newEntry = {
          id: `temp-${Date.now()}`,
          projectTitle: '',
          startDate: '',
          endDate: '',
          isCurrentlyWorking: false,
          projectLink: '',
          description: ''
        };
        const currentProjects = user?.profile_data?.projects || [];
        const updatedProjects = [...currentProjects, newEntry];
        const updatedProfileData = {
          ...user?.profile_data,
          projects: updatedProjects,
        };
        await updateUser({
          profile_data: updatedProfileData,
        });
        await refreshProfile();
      } catch (err) {
        console.error('Failed to add project:', err);
      }
    },
    deleteProjectEntry: async (_id: string, index: number) => {
      try {
        const currentProjects = user?.profile_data?.projects || [];
        // Only allow deletion if there's more than one entry
        if (currentProjects.length > 1) {
          const updatedProjects = currentProjects.filter((_: any, i: number) => i !== index);
          const updatedProfileData = {
            ...user?.profile_data,
            projects: updatedProjects,
          };
          await updateUser({
            profile_data: updatedProfileData,
          });
          await refreshProfile();
        }
      } catch (err) {
        console.error('Failed to delete project:', err);
      }
    }
  }), [user, loading, documents, error, forceDocuments, updateProfile, updateUser, refreshProfile, uploadDocument, refreshKey]);

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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate" title={cvFile.filename}>{cvFile.filename}</p>
                  {cvFile.uploadedAt && (
                    <p className="text-xs text-gray-500">
                      Uploaded {new Date(cvFile.uploadedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-2">
              {cvFile.downloadUrl && (
                <a
                  href={cvFile.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center px-3 py-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium border border-blue-300 rounded hover:bg-blue-50"
                >
                  View
                </a>
              )}
              <label
                htmlFor="cv-sidebar-replace"
                className="flex-1 text-center px-3 py-1.5 text-xs text-orange-600 hover:text-orange-700 font-medium border border-orange-300 rounded hover:bg-orange-50 cursor-pointer"
              >
                Replace
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      await uploadDocument(file, 'cv');
                      await refreshProfile();
                      setRefreshKey(prev => prev + 1);
                    } catch (error) {
                      console.error('Upload failed:', error);
                    }
                  }
                  e.target.value = '';
                }}
                className="hidden"
                id="cv-sidebar-replace"
              />
            </div>
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
                    await refreshProfile();
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
                      ref={personalTabRef}
                      personalInfo={personalInfo}
                      setPersonalInfo={setPersonalInfo}
                      validationErrors={validationErrors.personal || []}
                    />
                  )}

                  {activeTab === 'Career Profile' && (
                    <CareerProfileTab
                      ref={careerProfileRef}
                      careerProfile={careerProfile}
                      setCareerProfile={setCareerProfile}
                      cvFile={cvFile}
                      onCvUpload={async (uploadedDoc) => {
                        if (uploadedDoc) {
                          setForceDocuments(prev => {
                            const filtered = prev.filter(doc => doc.document_type !== 'cv');
                            return [...filtered, uploadedDoc];
                          });
                        }
                        
                        await new Promise(resolve => setTimeout(resolve, 300));
                        await refreshProfile();
                        setRefreshKey(prev => prev + 1);
                      }}
                      validationErrors={validationErrors.career || []}
                    />
                  )}

                  {activeTab === 'Education' && (
                    <EducationTab
                      ref={educationTabRef}
                      education={education}
                      setEducation={setEducation}
                      addEducation={addEducation}
                      deleteEducationEntry={deleteEducationEntry}
                    />
                  )}

                  {activeTab === 'Experience' && (
                    <ExperienceTab
                      ref={experienceTabRef}
                      experience={experience}
                      setExperience={setExperience}
                      addExperience={addExperience}
                      deleteExperienceEntry={deleteExperienceEntry}
                    />
                  )}

                  {activeTab === 'Projects' && (
                    <ProjectsTab
                      ref={projectTabRef}
                      projects={projects}
                      setProjects={setProjects}
                      addProject={addProject}
                      deleteProjectEntry={deleteProjectEntry}
                    />
                  )}

                  {activeTab === 'AI' && (
                    <AITab
                      ref={aiTabRef}
                      aiPreferences={aiPreferences}
                      setAIPreferences={setAIPreferences}
                    />
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 pt-6 border-t">
                    <button
                      onClick={() => {
                        const currentIndex = tabs.indexOf(activeTab);
                        if(currentIndex > 0) {
                          setActiveTab(tabs[currentIndex - 1]);
                        }
                      }}
                      disabled={tabs.indexOf(activeTab) === 0}
                      className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                      Previous
                    </button>
                    <button
                      className='px-6 py-2 text-gray-800 border border-gray-300 rounded-lg hover:bg-white bg-blue-600'
                      onClick={async () => {
                        try {
                          if (activeTab === 'Personal' && personalTabRef.current) {
                            await personalTabRef.current.save();
                          }
                          if (activeTab === 'Career Profile' && careerProfileRef.current) {
                            await careerProfileRef.current.save();
                          }
                          if (activeTab === 'Education' && educationTabRef.current) {
                            await educationTabRef.current.save();
                          }
                          if (activeTab === 'Experience' && experienceTabRef.current) {
                            await experienceTabRef.current.save();
                          }
                          if (activeTab === 'Projects' && projectTabRef.current) {
                            await projectTabRef.current.save();
                          }
                          if (activeTab === 'AI' && aiTabRef.current) {
                            await aiTabRef.current.save();
                          }
                          const currentIndex = tabs.indexOf(activeTab);
                          if (currentIndex < tabs.length - 1) {
                            setActiveTab(tabs[currentIndex + 1]);
                          }
                        } catch (error) {
                          console.error('Save failed:', error);
                        }
                      }}
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : (activeTab === 'AI' ? 'Save' : 'Save & Next')}
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
                    ref={careerProfileRef}
                    careerProfile={careerProfile}
                    setCareerProfile={setCareerProfile}
                    cvFile={cvFile}
                    onCvUpload={async (uploadedDoc) => {
                      if (uploadedDoc) {
                        setForceDocuments(prev => {
                          const filtered = prev.filter(doc => doc.document_type !== 'cv');
                          return [...filtered, uploadedDoc];
                        });
                      }
                  
                      await new Promise(resolve => setTimeout(resolve, 300));
                      await refreshProfile();
                      setRefreshKey(prev => prev + 1);
                    }}
                    validationErrors={validationErrors.career || []}
                  />
                )}

                {activeTab === 'Education' && (
                  <EducationTab
                    ref={educationTabRef}
                    education={education}
                    setEducation={setEducation}
                    addEducation={addEducation}
                    deleteEducationEntry={deleteEducationEntry}
                  />
                )}

                {activeTab === 'Experience' && (
                  <ExperienceTab
                    ref={experienceTabRef}
                    experience={experience}
                    setExperience={setExperience}
                    addExperience={addExperience}
                    deleteExperienceEntry={deleteExperienceEntry}
                  />
                )}

                {activeTab === 'Projects' && (
                  <ProjectsTab
                    ref={projectTabRef}
                    projects={projects}
                    setProjects={setProjects}
                    addProject={addProject}
                    deleteProjectEntry={deleteProjectEntry}
                  />
                )}

                {activeTab === 'AI' && (
                  <AITab
                    ref={aiTabRef}
                    aiPreferences={aiPreferences}
                    setAIPreferences={setAIPreferences}
                  />
                )}

                {/* Mobile Action Buttons */}
                <div className="flex flex-col gap-3 mt-6 pt-6 border-t">
                  <button
                    onClick={async () => {
                      try {
                        if (activeTab === 'Personal' && personalTabRef.current) {
                          await personalTabRef.current.save();
                        }
                        if (activeTab === 'Career Profile' && careerProfileRef.current) {
                          await careerProfileRef.current.save();
                        }
                        if (activeTab === 'Education' && educationTabRef.current) {
                          await educationTabRef.current.save();
                        }
                        if (activeTab === 'Experience' && experienceTabRef.current) {
                          await experienceTabRef.current.save();
                        }
                        if (activeTab === 'Projects' && projectTabRef.current) {
                          await projectTabRef.current.save();
                        }
                        if (activeTab === 'AI' && aiTabRef.current) {
                          await aiTabRef.current.save();
                        }
                        const currentIndex = tabs.indexOf(activeTab);
                        if (currentIndex < tabs.length - 1) {
                          setActiveTab(tabs[currentIndex + 1]);
                        }
                      } catch (error) {
                        console.error('Save failed:', error);
                      }
                    }}
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

