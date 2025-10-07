import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Experience } from '../../types/user';

interface ExperienceTabProps {
  experience: Experience[];
  setExperience: (experience: Experience[]) => void;
  addExperience: () => void;
  deleteExperienceEntry: (id: string, index: number) => Promise<void>;
}

const ExperienceTab: React.FC<ExperienceTabProps> = ({ 
  experience, 
  setExperience, 
  addExperience, 
  deleteExperienceEntry 
}) => {
  // Local state for immediate UI updates
  const [localExperience, setLocalExperience] = useState<Experience[]>(experience);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when prop changes (e.g., after add/delete)
  useEffect(() => {
    setLocalExperience(experience);
  }, [experience]);

  // Debounced save function
  const debouncedSave = (updatedExperience: Experience[]) => {
    // Clear existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Set new timeout for 1 second
    const timeout = setTimeout(async () => {
      setIsSaving(true);
      try {
        await setExperience(updatedExperience);
      } catch (error) {
        console.error('Failed to save experience:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1000);

    setSaveTimeout(timeout);
  };

  const handleChange = (index: number, field: keyof Experience, value: any) => {
    const updated = [...localExperience];
    updated[index] = { ...updated[index], [field]: value };
    setLocalExperience(updated);
    debouncedSave(updated);
  };

  return (
    <div className="space-y-6">
      {isSaving && (
        <div className="text-sm text-blue-600 mb-2">Saving...</div>
      )}
      {localExperience.map((exp, index) => (
        <div key={exp.id} className="border border-gray-200 rounded-lg p-4 relative">
          {experience.length > 1 && (
            <button
              onClick={() => deleteExperienceEntry(String(exp.id), index)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              title="Delete experience entry"
            >
              <Trash2 size={16} />
            </button>
          )}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <input
                type="text"
                value={exp.jobTitle || ''}
                onChange={(e) => handleChange(index, 'jobTitle', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                value={exp.companyName || ''}
                onChange={(e) => handleChange(index, 'companyName', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={exp.location || ''}
              onChange={(e) => handleChange(index, 'location', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={exp.startDate || ''}
                onChange={(e) => handleChange(index, 'startDate', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={exp.endDate || ''}
                onChange={(e) => handleChange(index, 'endDate', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!!exp.isCurrentlyWorking}
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={!!exp.isCurrentlyWorking}
                onChange={(e) => handleChange(index, 'isCurrentlyWorking', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">I am still working</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Describe What you learnt from this company</label>
            <textarea
              value={exp.description || ''}
              onChange={(e) => handleChange(index, 'description', e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      ))}
      <button
        onClick={addExperience}
        className="flex items-center text-blue-600 hover:text-blue-800"
      >
        <Plus size={16} className="mr-1" />
        Add More Experience
      </button>
    </div>
  );
};

export default ExperienceTab;
