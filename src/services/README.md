# API Client Development Guidelines

## Environment Variables

The API client uses environment variables for configuration. Ensure the following variables are set in your `.env` file:

```bash
# API Configuration
VITE_API_BASE_URL=https://backend.huesapply.com

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here

# Debug Configuration
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=info
```

## TypeScript Support

The API client is fully typed and ready for TypeScript. All services export comprehensive types:

```typescript
import { JobAPI, JobOpportunity, JobSearchParams } from '../services/api';

// Type-safe API calls
const searchJobs = async (params: JobSearchParams): Promise<JobOpportunity[]> => {
  const response = await JobAPI.searchJobs(params);
  return response.jobs;
};
```

## Testing Guidelines

### Mocking API Calls

```typescript
// Mock the entire API client
jest.mock('../services/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock specific API services
jest.mock('../services/api', () => ({
  JobAPI: {
    searchJobs: jest.fn(),
    getJobById: jest.fn(),
  },
}));
```

### Testing Hooks

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useJobApplications } from '../hooks/useJobApplications';

test('should fetch job recommendations', async () => {
  const { result } = renderHook(() => useJobApplications());
  
  await waitFor(() => {
    expect(result.current.recommendations).toBeDefined();
  });
});
```

## Consistent Patterns

### Using API Hooks

All API hooks follow the same pattern:

```typescript
import { useJobApplications } from '../services/api';

function JobsPage() {
  const {
    recommendations,
    isLoadingRecommendations,
    recommendationsError,
    applyToJob,
    applyMutation,
  } = useJobApplications({
    onApplySuccess: (application) => {
      console.log('Applied successfully:', application);
    },
    onError: (error) => {
      console.error('API Error:', error);
    },
  });

  if (isLoadingRecommendations) return <div>Loading...</div>;
  if (recommendationsError) return <div>Error: {recommendationsError.message}</div>;

  return (
    <div>
      {recommendations?.map(job => (
        <div key={job.id}>
          <h3>{job.title}</h3>
          <button 
            onClick={() => applyToJob({ jobId: job.id })}
            disabled={applyMutation.isLoading}
          >
            {applyMutation.isLoading ? 'Applying...' : 'Apply'}
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Error Handling

```typescript
// Centralized error handling
const handleAPIError = (error: ApiError) => {
  switch (error.status) {
    case 401:
      // Redirect to login
      window.location.href = '/auth/login';
      break;
    case 403:
      // Show permission denied message
      toast.error('You do not have permission to perform this action');
      break;
    case 422:
      // Handle validation errors
      if (error.errors) {
        Object.entries(error.errors).forEach(([field, messages]) => {
          toast.error(`${field}: ${messages.join(', ')}`);
        });
      }
      break;
    default:
      toast.error(error.message || 'An unexpected error occurred');
  }
};

// Use in components
const { applyToJob } = useJobApplications({
  onError: handleAPIError,
});
```

### Loading States

```typescript
// Consistent loading state handling
function MyComponent() {
  const { data, isLoading, error } = useAPI(
    () => JobAPI.getRecommendations(),
    'job-recommendations'
  );

  return (
    <div>
      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage error={error} />}
      {data && <DataDisplay data={data} />}
    </div>
  );
}
```

## Best Practices

1. **Always handle loading and error states**
2. **Use TypeScript types for all API interactions**
3. **Implement proper error boundaries**
4. **Cache data appropriately with stale time**
5. **Cancel requests on component unmount**
6. **Use optimistic updates where appropriate**
7. **Provide user feedback for all mutations**
8. **Test API integrations thoroughly**

## Extension Guidelines

To add a new API endpoint:

1. Add the endpoint to the appropriate service file
2. Export types for request/response
3. Update the main `api.ts` export file
4. Create or update the related hook if needed
5. Add tests for the new functionality
6. Update documentation

Example:

```typescript
// In jobAPI.ts
export interface NewJobRequest {
  title: string;
  description: string;
}

export class JobAPI {
  static async createJob(jobData: NewJobRequest): Promise<JobOpportunity> {
    return apiClient.post(`${this.BASE_PATH}`, jobData);
  }
}

// In useJobApplications.ts
const createJobMutation = useMutation(
  (jobData: NewJobRequest) => JobAPI.createJob(jobData),
  {
    onSuccess: () => {
      // Refresh job list
      refreshRecommendations();
    },
  }
);

const createJob = useCallback(async (jobData: NewJobRequest) => {
  return createJobMutation.mutate(jobData);
}, [createJobMutation.mutate]);
```
