"use client";

import { Button } from "@/components/ui/button";
import { useCanvas } from "@/context/context";
import { usePlanAccess } from "@/hooks/use-plan-access";
import {
  ArrowLeft,
  Crop,
  Expand,
  Eye,
  Maximize2,
  Palette,
  Sliders,
  Text,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const TOOLS = [
  {
    id: "resize",
    label: "Resize",
    icon: Expand,
    isActive: true,
  },
  {
    id: "crop",
    label: "Crop",
    icon: Crop,
  },
  {
    id: "adjust",
    label: "Adjust",
    icon: Sliders,
  },
  {
    id: "text",
    label: "Text",
    icon: Text,
  },
  {
    id: "background",
    label: "AI Background",
    icon: Palette,
    proOnly: true,
  },
  {
    id: "ai_extender",
    label: "AI Image Extender",
    icon: Maximize2,
    proOnly: true,
  },
  {
    id: "ai_edit",
    label: "AI Editing",
    icon: Eye,
    proOnly: true,
  },
];

const EditorTopbar = ({ project }) => {
  const router = useRouter();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [restrictedTool, setRestrictedTool] = useState(null);

  const { activeTool, onToolChange, canvasEditor } = useCanvas();
  const { hasAccess, canExport, isFree } = usePlanAccess();

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  // const handleToolChange = (toolId = {});

  return (
    <>
      <div className="border-b px-6 py-3">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={handleBackToDashboard} className="text-white hover:text-gray-300">
            <ArrowLeft className="h-4 w-4 mr-2" />
            All Projects
          </Button>
          <h1 className="font-extrabold capitalize">{project.title}</h1>
          <div>Right Action</div>
        </div>
      </div>
    </>
  );
};

export default EditorTopbar;
