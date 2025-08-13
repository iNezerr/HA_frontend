/**
 * Onboarding API Service
 * Handles onboarding flow and user type-specific operations
 */

import { apiClient } from './apiClient';

// Types for onboarding
export interface OnboardingStep {
  stepId: string;
  title: string;
  description: string;
  fields: {
    name: string;
    type: 'text' | 'textarea' | 'select' | 'file' | 'multiselect' | 'number' | 'date';
    label: string;
    required: boolean;
    options?: string[];
    validation?: {
      min?: number;
      max?: number;
      pattern?: string;
      message?: string;
    };
  }[];
  isCompleted: boolean;
}

export interface OnboardingFlow {
  userType: 'job' | 'scholarship' | 'grant';
  steps: OnboardingStep[];
  currentStep: number;
  totalSteps: number;
  completionPercentage: number;
}

export interface OnboardingSubmission {
  stepId: string;
  data: Record<string, any>;
  files?: File[];
}

export interface OnboardingCompletion {
  isCompleted: boolean;
  completedSteps: string[];
  nextStep?: OnboardingStep;
  redirectTo?: string;
}

// Onboarding API Service
export class OnboardingAPI {
  private static readonly BASE_PATH = '/onboarding';

  /**
   * Get onboarding flow for current user
   */
  static async getOnboardingFlow(): Promise<OnboardingFlow> {
    return apiClient.get(`${this.BASE_PATH}/flow`);
  }

  /**
   * Submit onboarding step data
   */
  static async submitStep(submission: OnboardingSubmission): Promise<OnboardingCompletion> {
    const formData = new FormData();
    formData.append('stepId', submission.stepId);
    formData.append('data', JSON.stringify(submission.data));
    
    if (submission.files) {
      submission.files.forEach((file, index) => {
        formData.append(`files[${index}]`, file);
      });
    }

    return apiClient.post(`${this.BASE_PATH}/submit-step`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Complete entire onboarding process
   */
  static async completeOnboarding(): Promise<{ success: boolean; redirectTo: string }> {
    return apiClient.post(`${this.BASE_PATH}/complete`);
  }

  /**
   * Get onboarding status
   */
  static async getOnboardingStatus(): Promise<{
    isCompleted: boolean;
    completionPercentage: number;
    currentStep?: number;
    missingSteps: string[];
  }> {
    return apiClient.get(`${this.BASE_PATH}/status`);
  }

  /**
   * Skip onboarding step (if optional)
   */
  static async skipStep(stepId: string): Promise<OnboardingCompletion> {
    return apiClient.post(`${this.BASE_PATH}/skip-step`, { stepId });
  }

  /**
   * Go back to previous step
   */
  static async goToPreviousStep(): Promise<OnboardingStep> {
    return apiClient.post(`${this.BASE_PATH}/previous-step`);
  }

  /**
   * Reset onboarding (start over)
   */
  static async resetOnboarding(): Promise<OnboardingFlow> {
    return apiClient.post(`${this.BASE_PATH}/reset`);
  }

  /**
   * Save progress without completing step
   */
  static async saveProgress(stepId: string, data: Record<string, any>): Promise<{ success: boolean }> {
    return apiClient.post(`${this.BASE_PATH}/save-progress`, { stepId, data });
  }
}

export default OnboardingAPI;
