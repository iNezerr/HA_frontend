import { useState, forwardRef, useImperativeHandle } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface Project {
  id: string;
  projectTitle: string;
  startDate: string;
  endDate: string;
  isCurrentlyWorking: boolean;
  projectLink: string;
  description: string;
}

interface ProjectsTabProps {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  addProject: () => void;
  deleteProjectEntry: (id: string, index: number) => void;
}

const ProjectsTab = forwardRef<{ save: () => Promise<void> }, ProjectsTabProps>(
  ({ projects, setProjects, addProject, deleteProjectEntry }, ref) => {
    const [localProjects, setLocalProjects] = useState<Project[]>(projects);

    const handleChange = (index: number, field: keyof Project, value: any) => {
      const updated = [...localProjects];
      updated[index] = { ...updated[index], [field]: value };
      setLocalProjects(updated);
    };

    const handleSave = async () => {
      try {
        await setProjects(localProjects);
      } catch (error) {
        console.error('Failed to save projects:', error);
      }
    };

    useImperativeHandle(ref, () => ({
      save: handleSave
    }));

    return (
      <div className="space-y-6">
        {localProjects.map((project, index) => (
          <div key={project.id} className="border border-gray-200 rounded-lg p-4 relative">
            {projects.length > 1 && (
              <button
                onClick={() => deleteProjectEntry(project.id, index)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                title="Delete project entry"
              >
                <Trash2 size={16} />
              </button>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
              <input
                type="text"
                value={project.projectTitle}
                onChange={(e) => handleChange(index, 'projectTitle', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={project.startDate}
                  onChange={(e) => handleChange(index, 'startDate', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={project.endDate}
                  onChange={(e) => handleChange(index, 'endDate', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={project.isCurrentlyWorking}
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={project.isCurrentlyWorking}
                  onChange={(e) => handleChange(index, 'isCurrentlyWorking', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">I am still working on this project</span>
              </label>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Link</label>
              <input
                type="url"
                value={project.projectLink}
                onChange={(e) => handleChange(index, 'projectLink', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Describe your project</label>
              <textarea
                value={project.description}
                onChange={(e) => handleChange(index, 'description', e.target.value)}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        ))}
        <button
          onClick={addProject}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <Plus size={16} className="mr-1" />
          Add More Projects
        </button>
      </div>
    );
  }
);

ProjectsTab.displayName = 'ProjectsTab';

export default ProjectsTab;