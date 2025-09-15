/**
 * Profile-specific Hook
 * Manages user profile data with backend integration following the new API pattern
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { userAPI } from '../services/userAPI_new';

// Backend API types based on the actual models
export interface UserProfile {
  id: string;
  firebase_uid: string;
  email: string;
  name: string;
  user_type: 'job' | 'scholarship' | 'grant';
  onboarded: boolean;
  profile_data: Record<string, any>;
  created_at: string;
  updated_at: string;
  profile?: ProfileData;
}

export interface ProfileData {
  summary: string;
  skills: string[];
  education: any[];
  experience_years: number;
  gpa: number | null;
  location: string;
  last_parsed_at: string | null;
}

export interface Document {
  id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  content_type: string;
  document_type: 'cv' | 'cover_letter' | 'transcript' | 'proposal' | 'other';
  gcs_url: string;
  uploaded_at: string;
}

export interface ProfileCompletion {
  percentage: number;
  missingFields: string[];
  completedSections: string[];
  totalSections: number;
  completedCount: number;
}

interface UseProfileResult {
  // Data
  user: UserProfile | null;
  profileCompletion: ProfileCompletion | null;
  documents: Document[];
  
  // Loading states
  loading: boolean;
  uploading: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  refreshProfile: () => Promise<void>;
  updateProfile: (profileData: Partial<ProfileData>) => Promise<void>;
  updateUser: (userData: Partial<UserProfile>) => Promise<void>;
  uploadDocument: (file: File, documentType?: 'cv' | 'cover_letter' | 'transcript' | 'proposal' | 'other') => Promise<void>;
}

export function useProfile(): UseProfileResult {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [profileCompletion, setProfileCompletion] = useState<ProfileCompletion | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    if (!authUser) {
      setUser(null);
      setProfileCompletion(null);
      setDocuments([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use the profile-specific API service
      const userResponse = await userAPI.getCurrentUser();
      setUser(userResponse);

      // Fetch profile completion
      try {
        const completionResponse = await userAPI.getProfileCompletion();
        setProfileCompletion(completionResponse);
      } catch (completionError) {
        console.warn('Profile completion endpoint not available:', completionError);
        setProfileCompletion(null);
      }

      // Fetch documents
      try {
        const documentsResponse = await userAPI.getDocuments();
        console.log('Documents API response:', {
          type: typeof documentsResponse,
          isArray: Array.isArray(documentsResponse),
          value: documentsResponse
        });
        
        // Ensure documents is always an array
        if (Array.isArray(documentsResponse)) {
          setDocuments(documentsResponse);
        } else {
          console.warn('Documents API returned non-array:', documentsResponse);
          setDocuments([]);
        }
      } catch (documentsError) {
        console.warn('Documents endpoint not available:', documentsError);
        setDocuments([]);
      }

    } catch (err: any) {
      console.error('Failed to fetch profile data:', err);
      setError(err.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  const updateProfile = useCallback(async (profileData: Partial<ProfileData>) => {
    setLoading(true);
    setError(null);

    try {
      const updatedUser = await userAPI.updateProfile(profileData);
      setUser(updatedUser);
      
      // Refresh completion after update
      await refreshProfile();
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshProfile]);

  const updateUser = useCallback(async (userData: Partial<UserProfile>) => {
    setLoading(true);
    setError(null);

    try {
      const updatedUser = await userAPI.updateUser(userData);
      setUser(updatedUser);
      
      // Refresh completion after update
      await refreshProfile();
    } catch (err: any) {
      console.error('Failed to update user:', err);
      setError(err.message || 'Failed to update user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshProfile]);

  const uploadDocument = useCallback(async (file: File, documentType: 'cv' | 'cover_letter' | 'transcript' | 'proposal' | 'other' = 'cv') => {
    setUploading(true);
    setError(null);

    try {
      const document = await userAPI.uploadDocument(file, documentType);
      setDocuments(prev => [...prev.filter(d => d.document_type !== documentType), document]);
      
      // Refresh profile to get updated completion
      await refreshProfile();
    } catch (err: any) {
      console.error('Failed to upload document:', err);
      setError(err.message || 'Failed to upload document');
      throw err;
    } finally {
      setUploading(false);
    }
  }, [refreshProfile]);

  // Load profile data on mount and auth changes
  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  return {
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
  };
}

export default useProfile;
