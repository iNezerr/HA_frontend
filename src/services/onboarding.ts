import { UserType, UserProfile, OnboardingState } from '../types/user';

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
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          address: '',
        }
      }
    };

    this.saveOnboardingState(initialState);
    this.saveUserType(userType);
    
    return initialState;
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
        return 3; // 1: CV Upload, 2: Skills & Experience, 3: Review
      case 'scholarship':
        return 3; // 1: Academic Background, 2: CV Upload, 3: Review
      case 'grant':
        return 3; // 1: Project Details, 2: Organization Info, 3: Review
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

  // Save CV file data (mock for now)
  static saveCVFile(file: File): Promise<string> {
    return new Promise((resolve) => {
      // Mock CV upload - in real implementation, this would upload to backend
      const mockUrl = `mock://cv/${file.name}`;
      
      const currentState = this.getOnboardingState();
      if (currentState) {
        currentState.current_data.cv_file_url = mockUrl;
        this.saveOnboardingState(currentState);
      }
      
      // Simulate upload delay
      setTimeout(() => resolve(mockUrl), 1000);
    });
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
      case 2: // Skills & Experience
        if (!data.personal_info?.first_name) errors.push('First name is required');
        if (!data.personal_info?.last_name) errors.push('Last name is required');
        if (!data.personal_info?.email) errors.push('Email is required');
        break;
    }
    return { isValid: errors.length === 0, errors };
  }

  private static validateScholarshipSeekerStep(step: number, data: Partial<UserProfile>, errors: string[]): { isValid: boolean; errors: string[] } {
    switch (step) {
      case 1: // Academic Background
        const scholarshipData = data as any;
        if (!scholarshipData.academic_background?.current_level) {
          errors.push('Current academic level is required');
        }
        if (!scholarshipData.academic_background?.field_of_study) {
          errors.push('Field of study is required');
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
    switch (step) {
      case 1: // Project Details
        const grantData = data as any;
        if (!grantData.project_details?.project_title) {
          errors.push('Project title is required');
        }
        if (!grantData.project_details?.project_description) {
          errors.push('Project description is required');
        }
        break;
      case 2: // Organization Info
        if (!grantData.organization_info?.organization_name) {
          errors.push('Organization name is required');
        }
        break;
    }
    return { isValid: errors.length === 0, errors };
  }
}

export default OnboardingService;
