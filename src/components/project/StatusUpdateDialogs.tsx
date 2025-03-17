
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface StatusUpdateDialogsProps {
  projectName: string;
  isAdmin: boolean;
  showDeleteDialog: boolean;
  showArchiveDialog: boolean;
  showRestoreDialog: boolean;
  isUpdatingStatus: boolean;
  onDeleteDialogChange: (open: boolean) => void;
  onArchiveDialogChange: (open: boolean) => void;
  onRestoreDialogChange: (open: boolean) => void;
  onUpdateStatus: (status: string) => void;
}

const StatusUpdateDialogs = ({
  projectName,
  isAdmin,
  showDeleteDialog,
  showArchiveDialog,
  showRestoreDialog,
  isUpdatingStatus,
  onDeleteDialogChange,
  onArchiveDialogChange,
  onRestoreDialogChange,
  onUpdateStatus
}: StatusUpdateDialogsProps) => {
  // Handle dialog cancellation properly
  const handleCancelClick = (dialogType: 'delete' | 'archive' | 'restore') => {
    // Close the appropriate dialog based on type
    switch (dialogType) {
      case 'delete':
        onDeleteDialogChange(false);
        break;
      case 'archive':
        onArchiveDialogChange(false);
        break;
      case 'restore':
        onRestoreDialogChange(false);
        break;
    }
  };

  return (
    <>
      <AlertDialog open={showDeleteDialog} onOpenChange={onDeleteDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{projectName}"? This will remove the project from your dashboard. {isAdmin ? "As an admin, you will still be able to see it with deleted status." : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={isUpdatingStatus} 
              onClick={() => handleCancelClick('delete')}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => onUpdateStatus("deleted")}
              disabled={isUpdatingStatus}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isUpdatingStatus ? "Deleting..." : "Delete Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showArchiveDialog} onOpenChange={onArchiveDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive "{projectName}"? The project will be moved to your archives and can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={isUpdatingStatus}
              onClick={() => handleCancelClick('archive')}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => onUpdateStatus("archived")}
              disabled={isUpdatingStatus}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isUpdatingStatus ? "Archiving..." : "Archive Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRestoreDialog} onOpenChange={onRestoreDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restore "{projectName}" to active status?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={isUpdatingStatus}
              onClick={() => handleCancelClick('restore')}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => onUpdateStatus("active")}
              disabled={isUpdatingStatus}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isUpdatingStatus ? "Restoring..." : "Restore Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default StatusUpdateDialogs;
