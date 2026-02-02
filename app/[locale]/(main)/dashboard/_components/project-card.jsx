import { Edit, FolderInput, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ProjectCard = ({ project, onEdit, folders }) => {
  const { mutate: deleteProject, isLoading: isDeleting } = useConvexMutation(
    api.projects.deleteProject,
  );

  const { mutate: moveProject, isLoading: isMoving } = useConvexMutation(
    api.projects.moveProject,
  );

  const lastUpdated = formatDistanceToNow(new Date(project.updatedAt), {
    addSuffix: true,
  });

  const handleDelete = async () => {
    const confirmed = confirm(
      `Are you sure you want to delete the project "${project.title}"? This action cannot be undone.`,
    );
    if (confirmed) {
      try {
        await deleteProject({ projectId: project._id });
        toast.success("Project deleted successfully");
      } catch (error) {
        console.error("Error deleting project:", error);
        toast.error("Failed to delete project. Please try again.");
      }
    }
  };

  // 폴더 이동
  const handleMove = async (folderId) => {
    try {
      await moveProject({
        projectId: project._id,
        folderId: folderId, // folderId가 없으면(null/undefined) 폴더 해제 로직이 될 수 있음
      });
      toast.success("Project moved!");
    } catch (error) {
      toast.error("Failed to move project");
    }
  };

  // 현재 로딩 중인지 (삭제 or 이동)
  const isWorking = isDeleting || isMoving;

  return (
    <Card className="py-0 group relative bg-slate-800/50 overflow-hidden hover:border-white/20 transition-all hover:transform hover:scale-[1.02]">
      <div className="aspect-video bg-slate-700 relative overflow-hidden">
        {project.thumbnailUrl && (
          <img
            src={project.thumbnailUrl}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        )}

        {/* hover 시 */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button variant="glass" size="sm" onClick={onEdit} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="glass"
                size="sm"
                className="gap-2"
                disabled={isWorking}
              >
                <FolderInput className="h-4 w-4" />
                Move
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-slate-900">
              {/* 폴더 목록 표시 */}
              {folders?.map((folder) => (
                <DropdownMenuItem
                  key={folder._id}
                  onClick={() => handleMove(folder._id)}
                  disabled={project.folderId === folder._id} // 이미 그 폴더에 있으면 비활성화
                  className="cursor-pointer hover:bg-yellow-300"
                >
                  {folder.name}
                </DropdownMenuItem>
              ))}
              {folders?.length === 0 && (
                <DropdownMenuItem disabled>No folders created</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="glass"
            size="sm"
            onClick={handleDelete}
            className="gap-2 text-red-400 hover:text-red-300"
            disabled={isWorking}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <CardContent className={"pb-6"}>
        <h3 className="font-semibold text-white mb-1 truncate">
          {project.title}
        </h3>

        <div className="flex items-center justify-between text-sm text-white/70">
          <span>Updated {lastUpdated}</span>
          <Badge
            variant="secondary"
            className="text-xs bg-slate-700 text-white/70"
          >
            {project.height} x {project.width}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
