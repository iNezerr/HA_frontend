import { useState, useEffect } from "react";
import OpportunityList from "../components/OpportunityList";
import { Opportunity } from "../types/opportunities";
import SEO from '../components/SEO';
import { useAuth } from '../auth/context/AuthContext';
import { FaGraduationCap } from 'react-icons/fa';

export default function JobPortal() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'search' | 'match'>('jobs');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const [hasSearched, setHasSearched] = useState(false);
  const { user, getIdToken } = useAuth();

  useEffect(() => {
    if (activeTab === 'jobs') {
      fetchJobs();
    } else {
      setOpportunities([]);
      // setHasSearched(false);
    }
  }, [user, activeTab]);

  const fetchJobs = async () => {
    if (!user) {
      setOpportunities([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const token = await getIdToken();
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const API_BASE = 'http://localhost:8000/api';
      const endpoint = `${API_BASE}/opportunities/jobs/`;
      
      const res = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!res.ok) throw new Error('Failed to fetch jobs');
      const data = await res.json();
      setOpportunities(data.results || data);
    } catch {
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  {/* this is coming when AI search and AI match started */}

  // const handleSearch = async (e?: React.FormEvent) => {
  //   if (e) e.preventDefault();
    
  //   if (!user) return;

  //   if (!user.user_type) {
  //     setError('User profile incomplete. Please complete your onboarding.');
  //     return;
  //   }

  //   setLoading(true);
  //   setError(null);
    
  //   try {
  //     const token = await getIdToken();
      
  //     if (!token) {
  //       throw new Error('No authentication token available');
  //     }

  //     const API_BASE = 'http://localhost:8000/api';
  //     const endpoint = `${API_BASE}/opportunities/search/unified_search/`;
      
  //     const searchData = {
  //       user_embedding: null,
  //       user_type: user.user_type,
  //       limit: 20
  //     };

  //     const res = await fetch(endpoint, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify(searchData)
  //     });
      
  //     if (!res.ok) throw new Error('Search failed');
  //     const data = await res.json();
  //     setOpportunities(data.results || data);
  //     setHasSearched(true);
  //     console.log("search results: ", data);
  //   } catch (err) {
  //     setError('Search failed');
  //     console.error('Search error:', err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleMatch = async () => {
  //   if (!user) return;

  //   setLoading(true);
  //   setError(null);
    
  //   try {
  //     const token = await getIdToken();
      
  //     if (!token) {
  //       throw new Error('No authentication token available');
  //     }

  //     const API_BASE = 'http://localhost:8000/api';
  //     const endpoint = `${API_BASE}/opportunities/match/match_opportunities/`;
      
  //     const res = await fetch(endpoint, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({}) // Empty body, backend will use user profile
  //     });
      
  //     if (!res.ok) throw new Error('AI matching failed');
  //     const data = await res.json();
  //     setOpportunities(data.results || data);
  //     console.log("AI matched opportunities: ", data);
  //   } catch (err) {
  //     setError('AI matching failed');
  //     console.error('Match error:', err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleTabChange = (tab: 'jobs' | 'search' | 'match') => {
    setActiveTab(tab);
    setError(null);
    
    // Clear search state when switching tabs
    if (tab !== 'search') {
      // setHasSearched(false);
      };
  };

  const getSEOMeta = () => {
    switch (activeTab) {
      case 'jobs':
        return {
          title: 'Find Jobs & Career Opportunities | Hues Apply',
          description: 'Discover thousands of job opportunities worldwide. Find remote jobs, internships, and career positions tailored to your skills and experience. Apply with one click.',
          keywords: 'jobs, career opportunities, remote jobs, job search, employment, internships, job applications, career development',
          tags: ['jobs', 'career', 'opportunities', 'employment', 'remote work']
        };
      case 'search':
        return {
          title: 'Search Opportunities | Hues Apply',
          description: 'Search jobs, scholarships, and grants tailored to your profile.',
          keywords: 'search, jobs, scholarships, grants, opportunities',
          tags: ['search', 'jobs', 'scholarships', 'grants']
        };
      case 'match':
        return {
          title: 'AI Match Opportunities | Hues Apply',
          description: 'AI-powered matching for jobs, scholarships, and grants.',
          keywords: 'ai match, jobs, scholarships, grants, opportunities',
          tags: ['ai', 'match', 'jobs', 'scholarships', 'grants']
        };
      default:
        return {
          title: 'Career Dashboard | Hues Apply',
          description: 'Your personalized career dashboard. Find jobs, scholarships, and grants tailored to your profile. Track applications and discover new opportunities.',
          keywords: 'career dashboard, job search, scholarship search, grant opportunities, career platform',
          tags: ['career', 'dashboard', 'opportunities', 'applications']
        };
    }
  };

  const seoMeta = getSEOMeta();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'search':
        return (
          <div className="p-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">AI-Powered Search</h2>
              <div className="text-center py-8">
                <FaGraduationCap className="text-4xl mb-4 mx-auto text-blue-600" />
                <p className="text-gray-600 mb-6">
                  Find opportunities based on your profile and preferences using AI.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-700">
                    <strong>Coming Soon:</strong> AI-powered search based on your academic background, 
                    GPA, field of study, and career goals.
                  </p>
                </div>
              </div>
              
            </div>
          </div>
        );

      case 'match':
        return (
          <div className="p-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">AI-Powered Opportunity Matching</h2>
              <div className="text-center py-8">
                <FaGraduationCap className="text-4xl mb-4 mx-auto text-blue-600" />
                <p className="text-gray-600 mb-6">
                  Let our AI find the perfect opportunities based on your profile, skills, and preferences.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-700">
                    <strong>Coming Soon:</strong> AI-powered Job matching based on your academic background, 
                    GPA, field of study, and career goals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default: // jobs
        return (
          <div>
            <OpportunityList
              opportunities={opportunities.map(opp => ({
                ...opp,
                id: opp.id ? String(opp.id) : undefined
              }))}
              filters={{}}
              title="Your Job Matches"
            />
          </div>
        );
    }
  };

  return (
    <>
      <SEO
        title={seoMeta.title}
        description={seoMeta.description}
        keywords={seoMeta.keywords}
        url={`https://huesapply.com/dashboard?tab=${activeTab}`}
        type="website"
      />
      <div className="min-h-screen bg-gray-50">
        <main className="flex-1 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">
              {activeTab === 'jobs' && 'Job Dashboard'}
              {activeTab === 'search' && 'Search Opportunities'}
              {activeTab === 'match' && 'AI Match Opportunities'}
            </h1>
            <div className="flex space-x-2">
              <button
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'jobs' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 border'
                }`}
                onClick={() => handleTabChange('jobs')}
                type="button"
              >
                Jobs
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'search' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 border'
                }`}
                onClick={() => handleTabChange('search')}
                type="button"
              >
                Search
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'match' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 border'
                }`}
                onClick={() => handleTabChange('match')}
                type="button"
              >
                AI Match
              </button>
            </div>
          </div>

          {/* Loading and Error States */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Tab Content */}
          {!loading && !error && (
            <div className="space-y-6">
              {renderTabContent()}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
