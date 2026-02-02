"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { FolderPlus, Plus, Sparkle } from "lucide-react";
import { useState } from "react";
import { BarLoader } from "react-spinners";
import { NewProjectModal } from "./_components/new-project-modal";
import ProjectGrid from "./_components/project-grid";
import { NewFolderModal } from "./_components/new-folder-modal";

const Dashboard = () => {
  const [showNewProjectModal, setNewProjectModal] = useState(false);
  const [activeFolderId, setActiveFolderId] = useState("all");
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);

  // 폴더 목록 가져오기
  const { data: folders } = useConvexQuery(api.folders.get);

  const { data: projects, isLoading } = useConvexQuery(
    api.projects.getUserProjects,
    { folderId: activeFolderId === "all" ? undefined : activeFolderId },
  );

  return (
    <div className="min-h-screen pt-32 pb-16">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Your Projects
            </h1>
            <p className="text-white/70">
              Create and manage your AI-powered image designs
            </p>
          </div>
          <Button
            onClick={() => setNewProjectModal(true)}
            variant="primary"
            size="lg"
            className="gap-2"
          >
            <Plus className="h-5 w-5" />
            New Project
          </Button>
        </div>

        {/* 폴더 */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          <Button
            variant={activeFolderId === "all" ? "glass" : "secondary"} // 👈 활성 상태면 primary
            onClick={() => setActiveFolderId("all")}
            size="sm"
          >
            All Projects
          </Button>
          {folders?.map((folder) => (
            <Button
              key={folder._id}
              variant={activeFolderId === folder._id ? "primary" : "outline"}
              onClick={() => setActiveFolderId(folder._id)}
              size="sm"
            >
              {folder.name}
            </Button>
          ))}

          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-white/70 hover:text-white"
            onClick={() =>
              /* TODO: 폴더 생성 모달 열기 */
              setShowNewFolderModal(true)
            }
          >
            <FolderPlus className="h-4 w-4" />
            New Folder
          </Button>
        </div>
        <NewProjectModal
          isOpen={showNewProjectModal}
          onClose={() => setNewProjectModal(false)}
        />
        <NewFolderModal
          isOpen={showNewFolderModal}
          onClose={() => setShowNewFolderModal(false)}
        />

        {isLoading ? (
          <BarLoader width={"100%"} color="white" />
        ) : projects && projects.length > 0 ? (
          <ProjectGrid projects={projects} folders={folders} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <h3 className="text-2xl font-semibold text-white mb-3">
              {activeFolderId === "all"
                ? "Create Your First Project"
                : "Empty Folder"}
            </h3>

            <p className="text-white/70 mb-8 max-w-md">
              {activeFolderId === "all"
                ? "Upload an image to start editing with our powerful AI tools"
                : "This folder is empty. Create a new project here!"}
            </p>
            <Button
              onClick={() => setNewProjectModal(true)}
              variant="primary"
              size="lg"
              className="gap-2"
            >
              <Sparkle className="h-5 w-5" />
              Start Creating
            </Button>
          </div>
        )}

        <NewProjectModal
          isOpen={showNewProjectModal}
          onClose={() => setNewProjectModal(false)}
        />
      </div>
    </div>
  );
};

export default Dashboard;
