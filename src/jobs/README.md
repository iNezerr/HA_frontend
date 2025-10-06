# Jobs Module

This module contains all job-related functionality for the Hues Apply frontend.

## Structure

```
jobs/
├── components/
│   ├── JobCard.tsx          # Individual job opportunity card
│   └── JobList.tsx          # List of job opportunities with pagination
├── hooks/
│   └── useJobs.ts           # Hook for managing job data and interactions
├── services/
│   └── jobsApi.ts           # API calls for job opportunities
├── types/
│   └── index.ts             # TypeScript types for jobs
└── index.ts                 # Module exports
```

## API Endpoints

The module integrates with the following backend endpoints:

- `GET /api/opportunities/jobs/` - Get all job opportunities with filters
- `GET /api/applications/dashboard/` - Get AI-matched job opportunities for dashboard
- `GET /api/opportunities/jobs/{id}/` - Get specific job details
- `POST /api/applications/opportunities/{id}/save/` - Save/unsave a job
- `POST /api/applications/opportunities/{id}/apply/` - Apply to a job
- `GET /api/applications/saved/` - Get saved jobs
- `GET /api/applications/applications/` - Get applied jobs

## Usage

### In UnifiedDashboard

The JobList component is used in the UnifiedDashboard for users with `user_type: 'job'`:

```tsx
import { JobList } from '../jobs';

// AI-matched jobs from dashboard endpoint
<JobList
  useDashboard={true}
  title="AI-Matched Jobs for You"
  filters={{ ordering: '-created_at', show_expired: false }}
  showLoadMore={true}
/>

// Regular job listings
<JobList
  useDashboard={false}
  title="Recently Posted Jobs"
  filters={{ ordering: '-created_at', show_expired: false }}
/>
```

### Standalone Usage

```tsx
import { useJobs, JobList, JobCard } from '../jobs';

// Using the hook directly
const { jobs, loading, error, saveJob, applyJob } = useJobs(filters, useDashboard);

// Using components
<JobCard job={job} onSave={saveJob} onApply={applyJob} />
<JobList filters={filters} useDashboard={true} />
```

## Features

- ✅ AI-powered job matching via dashboard endpoint
- ✅ Job filtering and pagination
- ✅ Save/unsave functionality
- ✅ One-click job application
- ✅ Responsive design with mobile optimization
- ✅ Loading states and error handling
- ✅ Similarity score display for AI matches
- ✅ Skills and metadata display
- ✅ Integration with existing ProfileCompletion component
