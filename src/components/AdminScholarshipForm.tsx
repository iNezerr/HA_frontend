import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import { ArrowLeft, Save } from 'lucide-react';
// import { getScholarship, createScholarship, updateScholarship, ScholarshipFormData } from '../services/scholarships';

const AdminScholarshipForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<any>({
    title: '',
    organization: '',
    scholarship_type: 'academic',
    level: 'undergraduate',
    amount: '',
    amount_type: 'fixed',
    description: '',
    url: '',
    eligibility_criteria: [],
    required_documents: [],
    application_deadline: '',
    is_active: true,
  });

  useEffect(() => {
    if (isEdit && id) {
      fetchScholarship();
    }
  }, [id, isEdit]);

  const fetchScholarship = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get(`admin/scholarships/${id}/`);
      setFormData({
        title: data.title || '',
        organization: data.organization || '',
        scholarship_type: data.scholarship_type || 'academic',
        level: data.level || 'undergraduate',
        amount: data.amount ? String(data.amount) : '',
        amount_type: data.amount_type || 'fixed',
        description: data.description || '',
        url: data.url || '',
        eligibility_criteria: Array.isArray(data.eligibility_criteria) ? data.eligibility_criteria : [],
        required_documents: Array.isArray(data.required_documents) ? data.required_documents : [],
        application_deadline: data.application_deadline ? data.application_deadline.split('T')[0] : '',
        is_active: data.is_active !== undefined ? data.is_active : true,
      });
    } catch (err: any) {
      setError('Failed to load scholarship details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.organization) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const submitData: any = {
        ...formData,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        application_deadline: formData.application_deadline ? new Date(formData.application_deadline).toISOString() : null,
      };

      if (isEdit && id) {
        await apiClient.put(`admin/scholarships/${id}/`, submitData);
      } else {
        await apiClient.post('admin/scholarships/', submitData);
      }

      navigate('/admin/scholarships');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save scholarship');
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/scholarships')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Scholarships
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Scholarship' : 'Add New Scholarship'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-full">
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  disabled={saving}
                  placeholder="e.g., Merit-Based Scholarship 2025"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => handleInputChange('organization', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  disabled={saving}
                  placeholder="e.g., University Foundation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scholarship Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.scholarship_type}
                  onChange={(e) => handleInputChange('scholarship_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={saving}
                >
                  <option value="academic">Academic Merit</option>
                  <option value="need_based">Need-Based</option>
                  <option value="athletic">Athletic</option>
                  <option value="minority">Minority</option>
                  <option value="field_specific">Field-Specific</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => handleInputChange('level', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={saving}
                >
                  <option value="undergraduate">Undergraduate</option>
                  <option value="graduate">Graduate</option>
                  <option value="phd">PhD</option>
                  <option value="postdoc">Postdoctoral</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., 5000"
                  step="0.01"
                  min="0"
                  required
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount Type
                </label>
                <select
                  value={formData.amount_type}
                  onChange={(e) => handleInputChange('amount_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={saving}
                >
                  <option value="fixed">Fixed Amount</option>
                  <option value="tuition">Full Tuition</option>
                  <option value="partial">Partial Tuition</option>
                  <option value="variable">Variable Amount</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Deadline <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.application_deadline}
                  onChange={(e) => handleInputChange('application_deadline', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application URL
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://example.com/apply"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Description field - full width */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={6}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Detailed description of the scholarship opportunity..."
                required
                disabled={saving}
              />
            </div>

            {/* Active Status */}
            <div className="mt-6 flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                disabled={saving}
              />
              <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
                Active (visible to users)
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/admin/scholarships')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !formData.title || !formData.organization || !formData.amount || !formData.application_deadline || !formData.description}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {saving ? 'Saving...' : (isEdit ? 'Update Scholarship' : 'Create Scholarship')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminScholarshipForm;
