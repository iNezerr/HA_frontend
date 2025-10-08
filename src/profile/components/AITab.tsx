import { useState } from "react";
interface AIPreferences {
  opportunities: string[];
  prioritizeBy: string[];
  salaryExpectation: string;
}

interface AITabProps {
  aiPreferences: AIPreferences;
  setAIPreferences: (preferences: AIPreferences) => void;
}

export default function AITab({ aiPreferences, setAIPreferences }: AITabProps) {
  const [localPreferences, setLocalPreferences] = useState<AIPreferences>(aiPreferences);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const debouncedSave = (updatedPreferences: AIPreferences) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    const timeout = setTimeout(async () => {
      setIsSaving(true);
      try {
        await setAIPreferences(updatedPreferences);
      } catch (error) {
        console.error('Failed to save AI preferences:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1000);

    setSaveTimeout(timeout);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Select the opportunities you're interested with AI</h3>
        <div className="space-y-2">
          {['Scholarships', 'Jobs', 'Grants', 'Internships'].map((opportunity) => (
            <label key={opportunity} className="flex items-center">
              <input
                type="checkbox"
                checked={localPreferences.opportunities.includes(opportunity)}
                onChange={(e) => {
                  const updated = e.target.checked
                    ? { ...localPreferences, opportunities: [...localPreferences.opportunities, opportunity]}
                    : { ...localPreferences, opportunities: localPreferences.opportunities.filter(o => o !== opportunity)};

                  setLocalPreferences(updated);
                  debouncedSave(updated);
                }}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">{opportunity}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Prioritize recommendation based on</h3>
        <div className="space-y-2">
          {['My academic background', 'My work experience', 'My preferred locations', 'Other'].map((priority) => (
            <label key={priority} className="flex items-center">
              <input
                type="checkbox"
                checked={localPreferences.prioritizeBy.includes(priority)}
                onChange={(e) => {
                  const updated = e.target.checked
                    ? { ...localPreferences, prioritizeBy: [...localPreferences.prioritizeBy, priority] }
                    : { ...localPreferences, prioritizeBy: localPreferences.prioritizeBy.filter(p => p !== priority) };
                  
                  setLocalPreferences(updated);
                  debouncedSave(updated);
                }}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">{priority}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Additional preferences</label>
        <textarea
          value={localPreferences.salaryExpectation}
          onChange={(e) => {
            const updated = {...localPreferences, salaryExpectation: e.target.value};
            setLocalPreferences(updated);
            debouncedSave(updated);
          }}
          rows={2}
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {isSaving && (
          <div className="text-sm text-blue-600 mb-2">Saving...</div>
        )}
      </div>
    </div>
  );
}
