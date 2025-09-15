/**
 * User Profile Hook
 * Manages user profile data with the actual backend endpoints
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/context/AuthContext';
import { apiClient } from '../services/apiClient';

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
  uploadDocument: (file: File, documentType?: string) => Promise<void>;
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
      // Fetch current user data
      const userResponse = await apiClient.get('/users/me/');
      setUser(userResponse);

      // Fetch profile completion
      try {
        const completionResponse = await apiClient.get('/users/profile/completion/');
        setProfileCompletion(completionResponse);
      } catch (completionError) {
        console.warn('Failed to fetch profile completion:', completionError);
        // Set default completion data if endpoint fails
        setProfileCompletion({
          percentage: 0,
          missingFields: [],
          completedSections: [],
          totalSections: 6,
          completedCount: 0
        });
      }

      // For documents, we would need a separate endpoint
      // For now, we'll initialize empty documents array
      setDocuments([]);

    } catch (err: any) {
      console.error('Failed to fetch profile:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  const updateProfile = useCallback(async (profileData: Partial<ProfileData>) => {
    if (!authUser) throw new Error('User not authenticated');

    setLoading(true);
    setError(null);

    try {
      await apiClient.patch('/users/profile/update/', profileData);
      await refreshProfile();
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err.response?.data?.error || err.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authUser, refreshProfile]);

  const updateUser = useCallback(async (userData: Partial<UserProfile>) => {
    if (!authUser) throw new Error('User not authenticated');

    setLoading(true);
    setError(null);

    try {
      await apiClient.patch('/users/me/update/', userData);
      await refreshProfile();
    } catch (err: any) {
      console.error('Failed to update user:', err);
      setError(err.response?.data?.error || err.message || 'Failed to update user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authUser, refreshProfile]);

  const uploadDocument = useCallback(async (file: File, documentType: string = 'cv') => {
    if (!authUser) throw new Error('User not authenticated');

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType);

      await apiClient.post('/users/profile/upload-document-file/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      await refreshProfile();
    } catch (err: any) {
      console.error('Failed to upload document:', err);
      setError(err.response?.data?.error || err.message || 'Failed to upload document');
      throw err;
    } finally {
      setUploading(false);
    }
  }, [authUser, refreshProfile]);

  // Effect to load profile when auth user changes
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
