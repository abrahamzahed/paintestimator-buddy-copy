
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface ProjectSelectorProps {
  selectedProjectId: string | null;
  onSelectProject: (projectId: string | null, projectName?: string) => void;
  required?: boolean;
  error?: string;
}

export const ProjectSelector = ({ 
  selectedProjectId, 
  onSelectProject,
  required = false,
  error
}: ProjectSelectorProps) => {
  const [projects, setProjects] = useState<{id: string, name: string}[]>([]);
  const [createNew, setCreateNew] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    // Placeholder for project fetching
    setProjects([
      { id: '1', name: 'Kitchen Renovation' },
      { id: '2', name: 'Living Room Update' }
    ]);
  }, []);

  const handleSelectProject = (value: string) => {
    if (value === 'new') {
      setCreateNew(true);
      onSelectProject(null);
    } else {
      setCreateNew(false);
      const project = projects.find(p => p.id === value);
      onSelectProject(value, project?.name);
    }
  };

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      // In a real implementation, this would create a project
      // For now, just pass the name back to the parent
      onSelectProject(null, newProjectName);
      setCreateNew(false);
    }
  };

  return (
    <div className="space-y-4">
      {!createNew ? (
        <div className="space-y-2">
          <Label htmlFor="project-select">Select Project or Create New</Label>
          <Select 
            onValueChange={handleSelectProject} 
            value={selectedProjectId || "new"}
          >
            <SelectTrigger id="project-select" className={error ? "border-red-500" : ""}>
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">+ Create New Project</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="new-project-name">New Project Name</Label>
          <div className="flex space-x-2">
            <Input
              id="new-project-name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Enter project name"
              className="flex-1"
            />
            <Button onClick={handleCreateProject} type="button" className="bg-paint hover:bg-paint-dark">
              Create
            </Button>
            <Button 
              onClick={() => {
                setCreateNew(false);
                setNewProjectName('');
              }} 
              type="button" 
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
