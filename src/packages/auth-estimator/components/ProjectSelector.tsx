
import { useState, useEffect } from "react";
import { useSession } from "@/context/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types";
import { 
  Label, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  Button,
  Input,
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@ui/components";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";

interface ProjectSelectorProps {
  selectedProjectId: string | null;
  onSelectProject: (projectId: string | null, projectName?: string) => void;
  required?: boolean;
  error?: string;
}

const ProjectSelector = ({ 
  selectedProjectId, 
  onSelectProject,
  required = false,
  error
}: ProjectSelectorProps) => {
  const { user } = useSession();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        if (!user) return;

        // Fetch only active projects for selection
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "active")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setProjects(data as Project[] || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast({
          title: "Failed to load projects",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user, toast]);

  const handleCreateProject = async () => {
    try {
      if (!newProjectName.trim()) {
        toast({
          title: "Project name required",
          description: "Please enter a name for your project",
          variant: "destructive",
        });
        return;
      }

      setCreating(true);
      
      const { data, error } = await supabase
        .from("projects")
        .insert([
          {
            name: newProjectName.trim(),
            description: newProjectDescription.trim() || null,
            user_id: user?.id,
            status: "active" // Ensure new projects are created as active
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setProjects([data as Project, ...projects]);
      onSelectProject(data.id, data.name);
      
      toast({
        title: "Project created",
        description: `${newProjectName} has been created`,
      });
      
      setNewProjectName("");
      setNewProjectDescription("");
      setNewProjectOpen(false);
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Failed to create project",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="project" className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
        Project
      </Label>
      <div className="flex space-x-2">
        <Select
          value={selectedProjectId || ""}
          onValueChange={(value) => {
            const selectedProject = projects.find(p => p.id === value);
            onSelectProject(value || null, selectedProject?.name);
          }}
        >
          <SelectTrigger className={`w-full ${error ? "border-red-500" : ""}`}>
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id!}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={newProjectOpen} onOpenChange={setNewProjectOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="shrink-0">
              <PlusCircle className="h-4 w-4 mr-2" />
              New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Enter project name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectDescription">Description (Optional)</Label>
                <Input
                  id="projectDescription"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="Briefly describe your project"
                />
              </div>
              <Button
                onClick={handleCreateProject}
                className="w-full bg-paint hover:bg-paint-dark"
                disabled={creating}
              >
                {creating ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default ProjectSelector;
