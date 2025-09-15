import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaDollarSign, FaCalendar } from 'react-icons/fa';
import SEO from '../components/SEO';

// Define missing types
interface ScholarshipDetail {
  id: number;
  title: string;
  description: string;
  full_description?: string;
  amount: string | null;
  deadline: string;
  created_at: string;
  updated_at: string;
  course?: string;
  location?: string;
  gpa?: string;
  application_link?: string;
  overview?: string;
  provider_details?: {
    website?: string;
  };
  application_process?: string;
  benefits?: string[];
  source?: string;
}

interface Scholarship {
  id: number;
  title: string;
  organization: string;
  amount: string;
  deadline: string;
}

// Placeholder functions
const getScholarship = async (_id: string): Promise<ScholarshipDetail> => {
  // TODO: Implement actual API call
  throw new Error('Scholarship not found');
};

const getScholarships = async (_params: any): Promise<{ results: Scholarship[] }> => {
  // TODO: Implement actual API call
  return { results: [] };
};

const applyToScholarship = async (id: string): Promise<void> => {
  // TODO: Implement actual API call
  console.log('Applying to scholarship:', id);
};

const Tag = ({ children }: { children: React.ReactNode }) => (
  <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">{children}</span>
);

const ScholarshipDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [scholarship, setScholarship] = useState<ScholarshipDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [similar, setSimilar] = useState<Scholarship[]>([]);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getScholarship(id)
      .then((data: ScholarshipDetail) => {
        setScholarship(data);
        setLoading(false);
        // Fetch similar scholarships by source, excluding current
        if (data.source) {
          getScholarships({ page_size: 3 })
            .then((res: { results: Scholarship[] }) => setSimilar(res.results || []));
        }
        // If the user has already applied, set applied to true (if this info is available in data)
        // For now, default to false; you can enhance this with backend info later
      })
      .catch((_err: any) => {
        setError('Failed to load scholarship details.');
        setLoading(false);
      });
  }, [id]);

  const handleApply = async () => {
    if (!id) return;
    try {
      await applyToScholarship(id);
      setApplied(true);
    } catch (e) {
      // Optionally handle error
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading scholarship details...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }
  if (!scholarship) {
    return <div className="p-8 text-center text-gray-500">Scholarship not found.</div>;
  }

  return (
    <>
      <SEO
        title={scholarship ? `${scholarship.title} | Hues Apply` : 'Scholarship Details | Hues Apply'}
        description={scholarship ? `${scholarship.title} - ${scholarship.full_description?.substring(0, 150)}...` : 'Find and apply to scholarships on Hues Apply'}
        keywords={`scholarship, ${scholarship?.course || ''}, ${scholarship?.location || ''}, education funding, student aid, scholarship application`}
        url={`https://huesapply.com/dashboard/scholarships/${id}`}
        type="article"
      />
      <div className="flex flex-col md:flex-row gap-8 p-6 max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="flex-1 bg-white rounded-lg shadow p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-700">Scholarship</h2>
              <div className="mt-2">
                <h1 className="text-2xl font-bold text-gray-900">{scholarship.title}</h1>
                <div className="flex flex-wrap mt-1">
                  {/* Example tags, replace with real tags if available */}
                  {scholarship.course && <Tag>{scholarship.course}</Tag>}
                  {scholarship.gpa && <Tag>GPA: {scholarship.gpa}</Tag>}
                  {/* Add more tags as needed */}
                </div>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <span className="mr-2">{scholarship.location}</span>
                  {/* Fit score placeholder, replace with real value if available */}
                </div>
                {scholarship.deadline && (
                  <div className="text-sm text-gray-500 mt-1">
                    Due: <span className="font-semibold">{scholarship.deadline}</span>
                  </div>
                )}
              </div>
            </div>
            {scholarship.application_link && (
              <button
                onClick={handleApply}
                disabled={applied}
                className={`px-6 py-2 rounded font-semibold text-white ${applied ? 'bg-green-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {applied ? 'Applied' : 'Apply now'}
              </button>
            )}
          </div>
          {/* About */}
          <section className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-1">About this scholarship</h3>
            <p className="text-gray-700 whitespace-pre-line">{scholarship.full_description || ''}</p>
          </section>
          {/* Overview */}
          {scholarship.overview && (
            <div className="mt-3 text-base text-gray-700 font-medium bg-gray-50 rounded p-3 mb-6">
              {scholarship.overview}
            </div>
          )}
          {/* Benefits */}
          {scholarship.benefits && scholarship.benefits.length > 0 && (
            <section className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-1">Benefits</h3>
              <ul className="list-disc ml-6 text-gray-700">
                {scholarship.benefits.map((item: string, i: number) => <li key={i}>{item}</li>)}
              </ul>
            </section>
          )}
          {/* Application Process */}
          {scholarship.application_process && (
            <section className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-1">Application Process</h3>
              <p className="text-gray-700 whitespace-pre-line">{scholarship.application_process}</p>
            </section>
          )}
          {/* Attachments & Links */}
          {scholarship.provider_details?.website && (
            <section>
              <h3 className="font-semibold text-gray-800 mb-1">Attachments & Links</h3>
              <ul className="list-disc ml-6 text-blue-700">
                <li><a href={scholarship.provider_details.website} className="hover:underline" target="_blank" rel="noopener noreferrer">Official Scholarship Website</a></li>
              </ul>
            </section>
          )}
        </div>
        {/* Sidebar */}
        <aside className="w-full md:w-96 bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Similar Scholarships</h3>
          {similar.length === 0 ? (
            <div className="text-gray-400 text-sm">No similar scholarships found.</div>
          ) : (
            <div className="space-y-4">
              {similar.map(s => (
                <div key={s.id} className="border rounded-lg p-4 flex flex-col gap-2 bg-gray-50">
                  <div className="font-semibold text-gray-900 text-sm">{s.title}</div>
                  <div className="flex items-center text-xs text-gray-500 gap-4">
                    {s.amount && (
                      <span className="flex items-center">
                        <FaDollarSign className="mr-1" />
                        {s.amount}
                      </span>
                    )}
                    {s.deadline && (
                      <span className="flex items-center">
                        <FaCalendar className="mr-1" />
                        {s.deadline}
                      </span>
                    )}
                  </div>
                  <a href={`/dashboard/scholarships/${s.id}`} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm font-semibold self-start">View Details</a>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </>
  );
};

export default ScholarshipDetails;
