
import { Link } from "react-router-dom";
import { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { Archive, MoreVertical, PlusCircle, RefreshCw, Trash2 } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProjectHeaderProps {
  project: Project;
  onDeleteClick: () => void;
  onArchiveClick: () => void;
  onRestoreClick: () => void;
}

const ProjectHeader = ({ project, onDeleteClick, onArchiveClick, onRestoreClick }: ProjectHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
          {project.status === "archived" && (
            <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full">
              Archived
            </span>
          )}
        </div>
        <p className="text-muted-foreground">
          Created on {new Date(project.created_at!).toLocaleDateString()}
        </p>
        {project.description && (
          <p className="mt-2 text-muted-foreground">{project.description}</p>
        )}
      </div>
      <div className="flex gap-2 self-stretch md:self-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4 mr-2" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {project.status === "active" ? (
              <DropdownMenuItem 
                className="text-amber-600"
                onClick={onArchiveClick}
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive Project
              </DropdownMenuItem>
            ) : project.status === "archived" ? (
              <DropdownMenuItem 
                className="text-green-600"
                onClick={onRestoreClick}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Restore Project
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem 
              className="text-red-600"
              onClick={onDeleteClick}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {project.status === "active" && (
          <Button asChild className="bg-paint hover:bg-paint-dark">
            <Link to={`/estimate?projectId=${project.id}`}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Estimate
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProjectHeader;
