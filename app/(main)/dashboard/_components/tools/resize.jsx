"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCanvas } from "@/context/context";
import { api } from "@/convex/_generated/api";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { Expand, Lock, Monitor, Unlock } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const ASPECT_RATIOS = [
  { name: "Instagram Story", ratio: [9, 16], label: "9:16" },
  { name: "Instagram Post", ratio: [1, 1], label: "1:1" },
  { name: "Youtube Thumbnail", ratio: [16, 9], label: "16:9" },
  { name: "Portrait", ratio: [2, 3], label: "2:3" },
  { name: "Facebook Cover", ratio: [851, 315], label: "2.7:1" },
  { name: "Twitter Header", ratio: [3, 1], label: "3:1" },
];

const ResizeControls = ({ project }) => {
  const { canvasEditor, processingMessage, setProcessingMessage } = useCanvas();

  const [newWidth, setNewWidth] = useState(project?.width || 800); // 타겟 너비
  const [newHeight, setNewHeight] = useState(project?.height || 600); // 타겟 높이
  const [lockAspectRatio, setLockAspectRatio] = useState(true); // 종횡비 고정 여부
  const [selectedPreset, setSelectedPreset] = useState(null); // 현재 선택된 프리셋

  const handleWidthChange = (value) => {
    const width = parseInt(value) || 0;
    setNewWidth(width);

    if (lockAspectRatio && project) {
      const ratio = project.height / project.width;
      setNewHeight(Math.round(width * ratio));
    }
    setSelectedPreset(null);
  };

  const handleHeightChange = (value) => {
    const height = parseInt(value) || 0;
    setNewHeight(height);

    if (lockAspectRatio && project) {
      const ratio = project.width / project.height;
      setNewWidth(Math.round(height * ratio));
    }
    setSelectedPreset(null);
  };

  const {
    mutate: updateProject,
    data,
    isLoading,
  } = useConvexMutation(api.projects.updateProject);

  useEffect(() => {
    setTimeout(() => {
        // 초기 크기 조정 이벤트 트리거
        if (!isLoading && data) {
            setTimeout(() => {
              window.dispatchEvent(new Event("resize"));
            }, 500);
        }
      }, 500);
  }, [data, isLoading]);
  
  const calculateAspectRatioDimensions = (ratio) => {
    if (!project) return { width: project.width, height: project.height };

    const [ratioW, ratioH] = ratio;

    const originalArea = project.width * project.height;

    const aspectRatio = ratioW / ratioH;
    const newHeight = Math.sqrt(originalArea / aspectRatio);
    const newWidth = newHeight * aspectRatio;

    return { width: Math.round(newWidth), height: Math.round(newHeight) };
  };

  const applyAspectRatio = (aspectRatio) => {
    const dimensions = calculateAspectRatioDimensions(aspectRatio.ratio);
    setNewWidth(dimensions.width);
    setNewHeight(dimensions.height);
    setSelectedPreset(aspectRatio.name);
  };

  // 뷰포트 스케일 계산
  const calculateViewportScale = () => {
    const container = canvasEditor.getElement().parentNode;
    if (!container) return 1;

    const containerWidth = container.clientWidth - 40;
    const containerHeight = container.clientHeight - 40;

    const scaleX = containerWidth / project.width;
    const scaleY = containerHeight / project.height;

    return Math.min(scaleX, scaleY, 1);
  };

  // 캔버스 리사이즈 처리
  const handleApplyResize = async () => {
        if (
      !canvasEditor ||
      !project ||
      (newWidth === project.width && newHeight === project.height)
    ) {
      return; // 유효하지 않은 상태일 때 함수 종료
    }
    setProcessingMessage("Resizing canvas...");

    try {
      // canvasEditor.setWidth(newWidth); // 캔버스 너비 설정
      // canvasEditor.setHeight(newHeight); // 캔버스 높이 설정
      canvasEditor.setDimensions(
        {
          width: newWidth,
          height: newHeight,
        }
      )

      const viewportScale = calculateViewportScale();

      canvasEditor.setDimensions(
        {
          width: newWidth * viewportScale, // 뷰포트에 맞게 크기 조정
          height: newHeight * viewportScale, // 뷰포트에 맞게 크기 조정
        },
        { backstoreOnly: false }, // 두 캔버스 레이어 업데이트
      );

      canvasEditor.setZoom(viewportScale); // 뷰포트 스케일로 줌 설정
      canvasEditor.calcOffset(); // 오프셋 재계산
      canvasEditor.requestRenderAll(); // 캔버스 다시 렌더링

      // 백엔드에 프로젝트 크기 업데이트
      await updateProject({
        projectId: project._id,
        width: newWidth,
        height: newHeight,
        canvasState: canvasEditor.toJSON(),
      });
    } catch (error) {
      console.error("Error resizing canvas:", error);
      toast.error("Failed to resize canvas. Please try again.");
    } finally {
      setProcessingMessage(null);
    }
  };

  if (!canvasEditor || !project) {
    return (
      <div className="p-4">
        <p className="text-white/70 text-sm">Canvas not ready</p>
      </div>
    );
  }

  const hasChanges = newWidth !== project.width || newHeight !== project.height;

  return (
    <div className="space-y-6">
      <div className="bg-slate-700/30 rounded-lg p-3">
        <h4 className="text-sm font-medium text-white mb-2">Current Size</h4>
        <div className="text-sm text-white/70">
          {project.width} x {project.height} pixels
        </div>
      </div>

      {/* 사이즈 인풋 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-white">Custom Size</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLockAspectRatio(!lockAspectRatio)}
            className="text-white/70 hover:text-white p-1"
          >
            {lockAspectRatio ? (
              <Lock className="h-4 w-4" /> // 종횡비 고정
            ) : (
              <Unlock className="h-4 w-4" /> // 종횡비 고정 해제 free 사이즈
            )}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-white/70 mb-1 block">Width</label>
            <Input
              type="number"
              value={newWidth}
              onChange={(e) => handleWidthChange(e.target.value)}
              min="100"
              max="5000"
              className="bg-slate-700 border-white/20 text-white"
            />
          </div>
          <div>
            <label className="text-xs text-white/70 mb-1 block">Height</label>
            <Input
              type="number"
              value={newHeight}
              onChange={(e) => handleHeightChange(e.target.value)}
              min="100"
              max="5000"
              className="bg-slate-700 border-white/20 text-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-white/70">
            {lockAspectRatio ? "Aspect ratio locked" : "Free resize"}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-white">Aspect Ratios</h3>
        <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
          {ASPECT_RATIOS.map((aspectRatio) => {
            const dimensions = calculateAspectRatioDimensions(
              aspectRatio.ratio,
            );

            return (
              <Button
                key={aspectRatio.name}
                variant={
                  selectedPreset === aspectRatio.name ? "default" : "outline"
                }
                size="sm"
                onClick={() => applyAspectRatio(aspectRatio)}
                className={`justify-between h-auto py-2 ${
                  selectedPreset === aspectRatio.name
                    ? "bg-cyan-500 hover:bg-cyan-600"
                    : "text-left"
                }`}
              >
                <div>
                  <div className="font-medium">{aspectRatio.name}</div>
                  <div className="text-xs opacity-70">
                    {dimensions.width} × {dimensions.height} (
                    {aspectRatio.label})
                  </div>
                </div>
                <Monitor className="h-4 w-4" />
              </Button>
            );
          })}
        </div>
      </div>

      {/* 변화 */}
      {hasChanges && (
        <div className="bg-slate-700/30 rounded-lg p-3">
          <h4 className="text-sm font-medium text-white mb-2">
            New Size Preview
          </h4>

          <div className="text-xs text-white/70">
            <div>
              New Canvas: {newWidth} × {newHeight} pixels
            </div>
            <div className="text-cyan-400">
              {newWidth > project.width || newHeight > project.height
                ? "Canvas will be expanded"
                : "Canvas will be cropped"}
            </div>
          </div>

          <div className="text-white/50 mt-1">
            Objects will maintain their current size and position
          </div>
        </div>
      )}

      {/* 적용 버튼 */}
      <Button
        onClick={handleApplyResize}
        disabled={!hasChanges || processingMessage} // 변경 사항이 없거나 처리 중일 때 비활성화
        className="w-full"
        variant="primary"
      >
        <Expand className="h-4 w-4 mr-2" />
        Apply Resize
      </Button>

      <div className="bg-slate-700/30 rounded-lg p-3">
        <p className="text-xs text-white/70">
          <strong>Resize Canvas:</strong> Changes canvas dimensions.
          <br />
          <strong>Aspect Ratios:</strong> Smart sizing based on your current
          canvas.
          <br />
          Objects maintain their size and position.
        </p>
      </div>
    </div>
  );
};

export default ResizeControls;
