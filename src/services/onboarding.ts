import { UserType, UserProfile, OnboardingState, PersonalInfo } from '../types/user';
import { apiClient } from './apiClient';

// Storage keys
const STORAGE_KEYS = {
  ONBOARDING_STATE: 'hues_apply_onboarding_state',
  USER_TYPE: 'hues_apply_user_type',
  PROFILE_DATA: 'hues_apply_profile_data',
} as const;

// Secure storage utilities with error handling
const secureStorage = {
  setItem: (key: string, value: string) => {
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.error('Failed to store data:', error);
    }
  },

  getItem: (key: string): string | null => {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.error('Failed to retrieve data:', error);
      return null;
    }
  },

  removeItem: (key: string) => {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove data:', error);
    }
  },

  clear: () => {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }
};

export class OnboardingService {
  
  // Initialize onboarding state
  static initializeOnboarding(userType: UserType): OnboardingState {
    const initialState: OnboardingState = {
      step: 1,
      user_type: userType,
      is_complete: false,
      current_data: {
        user_type: userType,
        personal_info: {
          phone: '',
        } as PersonalInfo
      }
    };

    this.saveOnboardingState(initialState);
    this.saveUserType(userType);
    
    return initialState;
  }

  // Save user type to backend and local storage
  static async saveUserTypeToBackend(userType: UserType): Promise<void> {
    try {
      console.log('Saving user type to backend:', userType);
      
      await apiClient.patch('/users/me/update/', {
        user_type: userType,
        onboarded: false // Mark as not yet onboarded, will be set to true when complete
      });
      
      console.log('Successfully saved user type to backend');
      
      // Save to local storage as well
      this.saveUserType(userType);
    } catch (error: any) {
      console.error('Failed to save user type to backend:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to save user type');
    }
  }

  // Complete onboarding process
  static async completeOnboardingProcess(): Promise<void> {
    const state = this.getOnboardingState();
    const userType = this.getUserType();
    const profileData = this.getProfileData();

    if (!state || !userType || !profileData) {
      throw new Error('Missing onboarding data');
    }

    try {
      console.log('Completing onboarding process for user type:', userType);
      
      // Update user as onboarded in backend
      await apiClient.patch('/users/me/update/', {
        onboarded: true,
        profile_data: profileData
      });

      console.log('Successfully marked user as onboarded in backend');

      // Update profile if needed
      if (profileData.personal_info) {
        await apiClient.patch('/users/profile/update/', {
          summary: (profileData as any).summary || '',
          skills: (profileData as any).skills || [],
          location: profileData.personal_info.address || '',
          // Add other profile fields as needed
        });
        
        console.log('Successfully updated user profile');
      }

      // Mark as complete locally
      this.completeOnboarding();
      
      console.log('Onboarding process completed successfully');
    } catch (error: any) {
      console.error('Failed to complete onboarding in backend:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to complete onboarding');
    }
  }

  // Get current onboarding state
  static getOnboardingState(): OnboardingState | null {
    const stored = secureStorage.getItem(STORAGE_KEYS.ONBOARDING_STATE);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Failed to parse onboarding state:', error);
        return null;
      }
    }
    return null;
  }

  // Save onboarding state
  static saveOnboardingState(state: OnboardingState): void {
    secureStorage.setItem(STORAGE_KEYS.ONBOARDING_STATE, JSON.stringify(state));
  }

  // Update onboarding step
  static updateStep(step: number): void {
    const currentState = this.getOnboardingState();
    if (currentState) {
      currentState.step = step;
      this.saveOnboardingState(currentState);
    }
  }

  // Update profile data
  static updateProfileData(data: Partial<UserProfile>): void {
    const currentState = this.getOnboardingState();
    if (currentState) {
      currentState.current_data = { ...currentState.current_data, ...data };
      this.saveOnboardingState(currentState);
    }
  }

  // Complete onboarding
  static completeOnboarding(): void {
    const currentState = this.getOnboardingState();
    if (currentState) {
      currentState.is_complete = true;
      this.saveOnboardingState(currentState);
    }
  }

  // Get user type
  static getUserType(): UserType | null {
    const stored = secureStorage.getItem(STORAGE_KEYS.USER_TYPE);
    return stored as UserType | null;
  }

  // Save user type
  static saveUserType(userType: UserType): void {
    secureStorage.setItem(STORAGE_KEYS.USER_TYPE, userType);
  }

  // Check if onboarding is complete
  static isOnboardingComplete(): boolean {
    const state = this.getOnboardingState();
    return state?.is_complete === true;
  }

  // Get total steps for user type
  static getTotalSteps(userType: UserType): number {
    switch (userType) {
      case 'job':
        return 3; // 1: CV Upload, 2: Contact & Career Preferences, 3: Review
      case 'scholarship':
        return 3; // 1: Academic Background & Contact, 2: CV Upload, 3: Review
      case 'grant':
        return 3; // 1: Project Details & Contact, 2: Organization Info, 3: Review
      default:
        return 3;
    }
  }

  // Clear all onboarding data
  static clearOnboardingData(): void {
    secureStorage.removeItem(STORAGE_KEYS.ONBOARDING_STATE);
    secureStorage.removeItem(STORAGE_KEYS.USER_TYPE);
    secureStorage.removeItem(STORAGE_KEYS.PROFILE_DATA);
  }

  // Get profile data for specific user type
  static getProfileData(): Partial<UserProfile> | null {
    const state = this.getOnboardingState();
    return state?.current_data || null;
  }

  // Validate required fields for current step
  static validateCurrentStep(userType: UserType, step: number, data: Partial<UserProfile>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    switch (userType) {
      case 'job':
        return this.validateJobSeekerStep(step, data, errors);
      case 'scholarship':
        return this.validateScholarshipSeekerStep(step, data, errors);
      case 'grant':
        return this.validateGrantSeekerStep(step, data, errors);
      default:
        return { isValid: false, errors: ['Invalid user type'] };
    }
  }

  private static validateJobSeekerStep(step: number, data: Partial<UserProfile>, errors: string[]): { isValid: boolean; errors: string[] } {
    switch (step) {
      case 1: // CV Upload
        if (!data.cv_file_url) {
          errors.push('CV file is required');
        }
        break;
      case 2: // Contact & Career Preferences
        if (!data.personal_info?.phone) errors.push('Phone number is required');
        break;
    }
    return { isValid: errors.length === 0, errors };
  }

  private static validateScholarshipSeekerStep(step: number, data: Partial<UserProfile>, errors: string[]): { isValid: boolean; errors: string[] } {
    switch (step) {
      case 1: // Academic Background & Contact
        const scholarshipData = data as any;
        if (!scholarshipData.academic_background?.current_level) {
          errors.push('Current academic level is required');
        }
        if (!scholarshipData.academic_background?.field_of_study) {
          errors.push('Field of study is required');
        }
        if (!data.personal_info?.phone) {
          errors.push('Phone number is required');
        }
        break;
      case 2: // CV Upload
        if (!data.cv_file_url) {
          errors.push('CV file is required');
        }
        break;
    }
    return { isValid: errors.length === 0, errors };
  }

  private static validateGrantSeekerStep(step: number, data: Partial<UserProfile>, errors: string[]): { isValid: boolean; errors: string[] } {
      const grantData = data as any;
      
      switch (step) {
        case 1: // Project Details & Contact
          if (!grantData.project_details?.project_title) {
            errors.push('Project title is required');
          }
          if (!grantData.project_details?.project_description) {
            errors.push('Project description is required');
          }
          if (!data.personal_info?.phone) {
            errors.push('Phone number is required');
          }
          break;
        case 2: // Organization Info
          if (!grantData.organization_info?.organization_name) {
            errors.push('Organization name is required');
          }
          if (!grantData.organization_info?.organization_type) {
            errors.push('Organization type is required');
          }
          break;
      }
      return { isValid: errors.length === 0, errors };
    }

  // Save CV file
  static async saveCVFile(file: File): Promise<string> {
    console.log('Saving CV file:', file.name);
    // This would normally upload to server and return URL
    return `https://example.com/uploads/${file.name}`;
  }
}

export default OnboardingService;
