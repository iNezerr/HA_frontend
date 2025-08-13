// Mock data types and interfaces for UI-only interface

// Core data types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login: string;
  role: 'user' | 'admin';
  is_new_user: boolean;
  google_data?: {
    picture?: string;
  };
}

export interface PersonalInfo {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  name?: string;
}

export interface CareerProfile {
  current_role: string;
  career_level: string;
  industry: string;
  skills: string[];
  preferred_roles: string[];
  jobTitle?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  gpa?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  description: string;
  skills_used: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  start_date: string;
  end_date: string;
  url?: string;
  github_url?: string;
}

export interface AIPreferences {
  ai_assistance_enabled: boolean;
  preferred_communication_style: string;
  job_alert_frequency: string;
  opportunities: string[];
  prioritizeBy: string;
  salaryExpectation: number;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary_range: string;
  type: string;
  posted_date: string;
  application_deadline: string;
  skills_required: string[];
}

export interface JobFormData {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary_range: string;
  type: string;
  application_deadline: string;
  skills_required: string[];
}

export interface Scholarship {
  id: number;
  title: string;
  source: string;
  location: string;
  amount: string;
  course: string;
  gpa: string;
  deadline: string;
  description: string;
  benefits: string[];
}

export interface ScholarshipFormData {
  title: string;
  source: string;
  location: string;
  amount: string;
  course: string;
  gpa: string;
  deadline: string;
  description: string;
  benefits: string[];
}

export interface ScholarshipDetail extends Scholarship {
  benefits: string[];
  requirements: string[];
}

export interface Opportunity {
  id: number;
  title: string;
  company: string;
  location: string;
  type: 'job' | 'internship';
  description: string;
  skills_required: string[];
  salary_range?: string;
  posted_date: string;
  application_deadline: string;
}

export interface ParsedCVData {
  personal: PersonalInfo;
  education: Education[];
  experience: Experience[];
  skills: string[];
  projects: Project[];
}

export interface Resume {
  filename: string;
  content: string;
  parsed_data?: ParsedCVData;
}

export interface CompletionStatus {
  personal: number;
  education: number;
  experience: number;
  overall: number;
}

// Mock data
export const mockUsers: User[] = [
  {
    id: 1,
    email: 'demo@huesapply.com',
    first_name: 'Demo',
    last_name: 'User',
    is_active: true,
    is_staff: false,
    is_superuser: false,
    date_joined: new Date().toISOString(),
    last_login: new Date().toISOString(),
    role: 'user',
    is_new_user: false,
  }
];

export const mockJobs: Job[] = [
  {
    id: 1,
    title: 'Frontend Developer',
    company: 'Tech Corp',
    location: 'San Francisco, CA',
    description: 'Build amazing user interfaces',
    requirements: ['React', 'TypeScript', 'CSS'],
    salary_range: '$80,000 - $120,000',
    type: 'Full-time',
    posted_date: '2024-01-15',
    application_deadline: '2024-02-15',
    skills_required: ['React', 'TypeScript', 'CSS']
  }
];

export const mockScholarships: Scholarship[] = [
  {
    id: 1,
    title: 'Tech Excellence Scholarship',
    source: 'University Foundation',
    location: 'California, USA',
    amount: '$10,000',
    course: 'Computer Science',
    gpa: '3.5',
    deadline: '2024-03-01',
    description: 'For outstanding computer science students',
    benefits: ['Tuition assistance', 'Mentorship program']
  }
];

export const mockOpportunities: Opportunity[] = [
  {
    id: 1,
    title: 'Software Engineering Internship',
    company: 'Innovation Labs',
    location: 'Remote',
    type: 'internship',
    description: 'Learn and grow with our engineering team',
    skills_required: ['JavaScript', 'React', 'Node.js'],
    posted_date: '2024-01-10',
    application_deadline: '2024-02-28'
  }
];

// Mock API functions - underscore prefix for unused parameters
export const mockAPI = {
  // Auth functions
  registerUser: async (_data: any) => ({ success: true, user: mockUsers[0] }),
  exchangeGoogleAuthCode: async (_code: string) => ({ 
    data: { 
      access_token: 'mock_token', 
      refresh_token: 'mock_refresh', 
      user: mockUsers[0] 
    } 
  }),
  getUserRole: async () => 'user',
  signOut: async () => ({ success: true }),

  // Job functions
  getJobs: async (_filters?: any) => ({ results: mockJobs, count: mockJobs.length }),
  getJob: async (id: number) => mockJobs.find(j => j.id === id),
  createJob: async (data: JobFormData) => ({ ...data, id: Date.now() }),
  updateJob: async (id: number, data: JobFormData) => ({ ...data, id }),

  // Scholarship functions
  getScholarships: async (_filters?: any) => ({ results: mockScholarships, count: mockScholarships.length }),
  getScholarship: async (id: number) => mockScholarships.find(s => s.id === id),
  createScholarship: async (data: ScholarshipFormData) => ({ ...data, id: Date.now() }),
  updateScholarship: async (id: number, data: ScholarshipFormData) => ({ ...data, id }),
  applyToScholarship: async (_id: number) => ({ success: true }),
  getScholarshipApplicationStatus: async () => new Set(['1']),
  toggleSaveScholarship: async (_id: number) => ({ saved: true }),
  getMatchedScholarships: async () => ({ results: mockScholarships }),

  // Opportunity functions
  getOpportunities: async (_filters?: any) => ({ results: mockOpportunities, count: mockOpportunities.length }),
  getAIMatches: async (_filters?: any) => ({ results: mockOpportunities }),

  // Profile functions
  getUserProfileById: async (id: number) => mockUsers.find(u => u.id === id),
  getProfileCompletionStatus: async () => ({ personal: 80, education: 60, experience: 70, overall: 70 }),
  updateUserGoals: async (_goals: string[]) => ({ success: true }),
  updateParsedProfile: async (_data: ParsedCVData) => ({ success: true }),
  uploadDocument: async (file: File) => ({ url: 'mock_url', filename: file.name }),

  // Onboarding functions
  transformResumeData: (_resume: Resume): ParsedCVData => ({
    personal: {
      first_name: 'Demo',
      last_name: 'User',
      email: 'demo@example.com',
      phone: '1234567890',
      location: 'Demo City',
      bio: 'Demo bio'
    },
    education: [],
    experience: [],
    skills: ['React', 'TypeScript'],
    projects: []
  })
};

// LinkedIn Job Crawler mock
export const LinkedInJobCrawler = {
  getJobsFromLocalStorage: () => mockJobs,
  crawlJobs: async (_filters: any) => ({ results: mockJobs, count: mockJobs.length })
};
