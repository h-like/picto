"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UpgradeModal } from "@/components/upgrade-modal";
import { useCanvas } from "@/context/context";
import { api } from "@/convex/_generated/api";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { usePlanAccess } from "@/hooks/use-plan-access";
import { FabricImage } from "fabric";
import {
  ArrowLeft,
  ChevronDown,
  Crop,
  Download,
  Expand,
  Eye,
  FileImage,
  Loader2,
  Lock,
  Maximize2,
  Palette,
  RefreshCcw,
  RotateCcw,
  RotateCw,
  Save,
  Sliders,
  Text,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// (툴바 메뉴 및 내보내기 포맷)
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

const EXPORT_FORMATS = [
  {
    format: "PNG",
    quality: 1.0,
    label: "PNG (High Quality)",
    extension: "png",
  },
  {
    format: "JPEG",
    quality: 0.9,
    label: "JPEG (90% Quality)",
    extension: "jpg",
  },
  {
    format: "JPEG",
    quality: 0.8,
    label: "JPEG (80% Quality)",
    extension: "jpg",
  },
  {
    format: "WEBP",
    quality: 0.9,
    label: "WebP (90% Quality)",
    extension: "webp",
  },
];

const EditorTopbar = ({ project }) => {
  const router = useRouter();

  // --- UI 상태 관리 (모달, 툴 제한 등) ---
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [restrictedTool, setRestrictedTool] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState(null);

  const { activeTool, onToolChange, canvasEditor } = useCanvas();
  const { hasAccess, canExport, isFree } = usePlanAccess();

  // Undo/Redo 상태
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  // Undo/Redo 동작 중에 이벤트 리스너가 중복 실행되는 것을 막기 위한 플래그
  const [isUndoRedoOperation, setIsUndoRedoOperation] = useState(false);

  // --- 디바운싱을 위한 Refs ---
  // 리렌더링 시에도 타이머 ID를 유지하기 위해 useRef 사용
  const debounceTimerRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Convex API 연동
  const { mutate: updateProject, isLoading: isSaving } = useConvexMutation(
    api.projects.updateProject,
  );
  const { data: user } = useConvexQuery(api.users.getCurrentUser);

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  // 툴 변경 핸들러 (권한 체크 포함)
  const handleToolChange = (toolId) => {
    if (!hasAccess(toolId)) {
      setRestrictedTool(toolId);
      setShowUpgradeModal(true);
      return;
    }

    onToolChange(toolId);
  };

  // 초기화 로직: 원본 이미지로 리셋
  const handleResetToOriginal = async () => {
    if (!canvasEditor || !project || !project.originalImageUrl) {
      toast.error("No original image found to reset to");
      return;
    }
    // 리셋 전 상태를 Undo 스택에 저장 (실수 방지)
    saveToUndoStack();

    try {
      // 1. 캔버스 초기화
      canvasEditor.clear();
      canvasEditor.backgroundColor = "#ffffff";
      canvasEditor.backgroundImage = null;

      // 2. 원본 이미지 로드
      const fabricImage = await FabricImage.fromURL(project.originalImageUrl, {
        crossOrigin: "anonymous",
      });

      // 3. 이미지 비율에 맞춰 스케일 계산 (화면에 꽉 차게)
      const imgAspectRatio = fabricImage.width / fabricImage.height;
      const canvasAspectRatio = project.width / project.height;
      const scale =
        imgAspectRatio > canvasAspectRatio
          ? project.width / fabricImage.width
          : project.height / fabricImage.height;

      fabricImage.set({
        left: project.width / 2,
        top: project.height / 2,
        originX: "center",
        originY: "center",
        scaleX: scale,
        scaleY: scale,
        selectable: true,
        evented: true,
      });

      fabricImage.filters = [];
      canvasEditor.add(fabricImage);
      canvasEditor.centerObject(fabricImage);
      canvasEditor.setActiveObject(fabricImage);
      canvasEditor.requestRenderAll();

      // 4. DB 업데이트
      const canvasJSON = canvasEditor.toJSON();
      await updateProject({
        projectId: project._id,
        canvasState: canvasJSON,
        currentImageUrl: project.originalImageUrl,
        activeTransformations: undefined,
        backgroundRemoved: false,
      });

      toast.success("Canvas reset to original image");
    } catch (error) {
      console.error("Error resetting canvas:", error);
      toast.error("Failed to reset canvas. Please try again.");
    }
  };

  // 수동 저장 핸들러
  const handleManualSave = async () => {
    try {
      await updateProject({
        projectId: project._id,
        canvasState: canvasEditor.toJSON(),
      });
      toast.success("Project saved successfully!");
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Failed to save project. Please try again.");
    }
  };

  // --- Undo/Redo: 상태 저장 함수 ---
  // useCallback을 사용하여 불필요한 함수 재생성 방지
  const saveToUndoStack = useCallback(() => {
    // 캔버스가 없거나, Undo/Redo 실행 중이면 저장하지 않음 (무한 루프 방지)
    if (!canvasEditor || isUndoRedoOperation) return;

    // Fabric.js 객체를 JSON 문자열로 직렬화 (깊은 복사 효과)
    const canvasState = JSON.stringify(canvasEditor.toJSON());

    setUndoStack((prev) => {
      // (선택) 이전 상태와 완전히 동일하면 스택에 쌓지 않음
      if (prev.length > 0 && prev[prev.length - 1] === canvasState) {
        return prev;
      }

      const newStack = [...prev, canvasState];
      // 메모리 관리를 위해 스택 크기를 20개로 제한
      if (newStack.length > 20) {
        newStack.shift();
      }
      return newStack;
    });

    // 새로운 동작이 발생하면 Redo 스택은 초기화 (미래 삭제)
    setRedoStack([]);
  }, [canvasEditor, isUndoRedoOperation]);

  // --- 이벤트 리스너 등록 및 디바운스 처리 (핵심 로직) ---
  useEffect(() => {
    if (!canvasEditor) return;

    // 1. 초기 상태 저장 (컴포넌트 마운트 시 최초 1회)
    if (!isInitializedRef.current && undoStack.length === 0) {
      const initialState = JSON.stringify(canvasEditor.toJSON());
      setUndoStack([initialState]);
      isInitializedRef.current = true;
    }

    // 2. 변경 감지 핸들러 (Debounce 적용)
    // 연속된 이벤트(예: 드래그) 중 마지막 상태만 저장하여 성능 최적화
    const handleCanvasModified = () => {
      // Undo/Redo 중 발생한 이벤트는 무시
      if (isUndoRedoOperation) return;

      // 이미 대기 중인 저장이 있다면 취소 (타이머 리셋)
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // 500ms 동안 추가 입력이 없으면 저장 실행
      debounceTimerRef.current = setTimeout(() => {
        saveToUndoStack();
        debounceTimerRef.current = null; // 실행 후 타이머 ID 초기화
      }, 500);
    };

    // 3. Fabric.js 이벤트 바인딩
    // 'object:modified': 변형 완료 시 (드래그 종료 등)
    // 'path:created': 드로잉 완료 시
    canvasEditor.on("object:modified", handleCanvasModified);
    canvasEditor.on("object:added", handleCanvasModified);
    canvasEditor.on("object:removed", handleCanvasModified);
    canvasEditor.on("path:created", handleCanvasModified);

    // 4. Cleanup: 컴포넌트 언마운트 시 리스너 및 타이머 제거
    return () => {
      canvasEditor.off("object:modified", handleCanvasModified);
      canvasEditor.off("object:added", handleCanvasModified);
      canvasEditor.off("object:removed", handleCanvasModified);
      canvasEditor.off("path:created", handleCanvasModified);

      // 컴포넌트가 언마운트 될 때만 타이머 취소
      // (주의: 여기서는 타이머를 취소하지 않는 게 나을 수도 있지만, 메모리 누수 방지를 위해 취소함)
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [canvasEditor, saveToUndoStack, isUndoRedoOperation, undoStack.length]);

  // --- Undo 실행 ---
  const handleUndo = async () => {
    if (!canvasEditor || undoStack.length <= 1) return;

    setIsUndoRedoOperation(true);

    try {
      // 현재 상태를 Redo 스택으로 이동
      const currentState = JSON.stringify(canvasEditor.toJSON());
      setRedoStack((prev) => [...prev, currentState]);

      // Undo 스택에서 이전 상태 꺼내기
      const newUndoStack = [...undoStack];
      newUndoStack.pop(); /// 현재 상태 제거
      const previousState = newUndoStack[newUndoStack.length - 1];

      if (previousState) {
        await canvasEditor.loadFromJSON(JSON.parse(previousState));
        canvasEditor.requestRenderAll();
        setUndoStack(newUndoStack);
        toast.success("Undid last action");
      }
    } catch (error) {
      console.error("Error during undo:", error);
      toast.error("Failed to undo action");
    } finally {
      // 상태 복원 완료 후 플래그 해제 (약간의 지연을 두어 이벤트 충돌 방지)
      setTimeout(() => setIsUndoRedoOperation(false), 100);
    }
  };

  // --- Redo 실행 ---
  const handleRedo = async () => {
    if (!canvasEditor || redoStack.length === 0) return;

    setIsUndoRedoOperation(true);

    try {
      const newRedoStack = [...redoStack];
      const nextState = newRedoStack.pop(); // 가장 최근의 Redo 상태 꺼내기

      if (nextState) {
        // 현재 상태를 다시 Undo 스택에 저장
        const currentState = JSON.stringify(canvasEditor.toJSON());
        setUndoStack((prev) => [...prev, currentState]);

        //Redo 상태 적용
        await canvasEditor.loadFromJSON(JSON.parse(nextState));
        canvasEditor.requestRenderAll();
        setRedoStack(newRedoStack);
        toast.success("Redid last action");
      }
    } catch (error) {
      console.error("Error during redo:", error);
      toast.error("Failed to redo action");
    } finally {
      setTimeout(() => setIsUndoRedoOperation(false), 100);
    }
  };

  // Check if undo/redo is available
  const canUndo = undoStack.length > 1;
  const canRedo = redoStack.length > 0;

  //--- 이미지 내보내기 (Export) ---
  const handleExport = async (exportConfig) => {
    if (!canvasEditor || !project) {
      toast.error("Canvas not ready for export");
      return;
    }

    // 권한 체크 (Free 유저 제한)
    if (!canExport(user?.exportsThisMonth || 0)) {
      setRestrictedTool("export");
      setShowUpgradeModal(true);
      return;
    }

    setIsExporting(true);
    setExportFormat(exportConfig.format);

    try {
      // 1. 현재 줌/위치 저장 (내보내기는 원본 크기로 해야 하므로)
      const currentZoom = canvasEditor.getZoom();
      const currentViewportTransform = [...canvasEditor.viewportTransform];

      // 2. 캔버스를 원본 크기(100%) 및 0,0 좌표로 임시 리셋
      canvasEditor.setZoom(1);
      canvasEditor.setViewportTransform([1, 0, 0, 1, 0, 0]);
      canvasEditor.setDimensions({
        width: project.width,
        height: project.height,
      });
      canvasEditor.requestRenderAll();

      // 3. 이미지 데이터 생성
      const dataURL = canvasEditor.toDataURL({
        format: exportConfig.format.toLowerCase(),
        quality: exportConfig.quality,
        multiplier: 1,
      });

      // 4. 화면 뷰포트 복원 (사용자가 보던 상태로 되돌림)
      canvasEditor.setZoom(currentZoom);
      canvasEditor.setViewportTransform(currentViewportTransform);
      canvasEditor.setDimensions({
        width: project.width * currentZoom,
        height: project.height * currentZoom,
      });
      canvasEditor.requestRenderAll();

      // 5. 브라우저 다운로드 트리거
      const link = document.createElement("a");
      link.download = `${project.title}.${exportConfig.extension}`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Image exported as ${exportConfig.format}!`);
    } catch (error) {
      console.error("Error exporting image:", error);
      toast.error("Failed to export image. Please try again.");
    } finally {
      setIsExporting(false);
      setExportFormat(null);
    }
  };

  return (
    <>
      <div className="border-b px-6 py-3">
        <div className="flex items-center justify-between mb-4">
          {/* 상단 헤더: 뒤로가기, 제목, 액션 버튼(Reset, Save, Export) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToDashboard}
            className="text-white hover:text-gray-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            All Projects
          </Button>
          <h1 className="font-extrabold capitalize">{project.title}</h1>
          <div className="flex items-center gap-3">
            {/* 리셋 버튼 */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetToOriginal}
              disabled={isSaving || !project.originalImageUrl}
              className="gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <RefreshCcw className="h-4 w-4" />
                  Reset
                </>
              )}
            </Button>

            {/* 저장 버튼 */}
            <Button
              variant="primary"
              size="sm"
              onClick={handleManualSave}
              disabled={isSaving || !canvasEditor}
              className="gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save
                </>
              )}
            </Button>

            {/* 출력(Export) 드롭다운 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="glass"
                  size="sm"
                  disabled={isExporting || !canvasEditor}
                  className="gap-2"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Exporting {exportFormat}...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Export
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-56 bg-slate-800 border-slate-700"
              >
                <div className="px-3 py-2 text-sm text-white/70">
                  Export Resolution: {project.width} × {project.height}px
                </div>

                <DropdownMenuSeparator className="bg-slate-700" />

                {EXPORT_FORMATS.map((config, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => handleExport(config)}
                    className="text-white hover:bg-slate-700 cursor-pointer flex items-center gap-2"
                  >
                    <FileImage className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="font-medium">{config.label}</div>
                      <div className="text-xs text-white/50">
                        {config.format} • {Math.round(config.quality * 100)}%
                        quality
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator className="bg-slate-700" />

                {/* Free 유저 제한 안내 */}
                {isFree && (
                  <div className="px-3 py-2 text-xs text-white/50">
                    Free Plan: {user?.exportsThisMonth || 0}/20 exports this
                    month
                    {(user?.exportsThisMonth || 0) >= 20 && (
                      <div className="text-amber-400 mt-1">
                        Upgrade to Pro for unlimited exports
                      </div>
                    )}
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* 하단 툴바: 편집 도구 및 Undo/Redo 컨트롤 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              const isActive = activeTool === tool.id;
              const hasToolAccess = hasAccess(tool.id);

              return (
                <Button
                  key={tool.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={`gap-2 relative ${
                    isActive
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "text-white hover:text-gray-300 hover:bg-gray-100"
                  } ${!hasToolAccess ? "opacity-60" : ""}`}
                  onClick={() => {
                    handleToolChange(tool.id);
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {tool.label}
                  {tool.proOnly && !hasToolAccess && (
                    <Lock className="h-3 w-3 text-amber-400" />
                  )}
                </Button>
              );
            })}
          </div>

          {/* Undo 뒤로 돌아가기 & Redo 앞으로 되돌리기!! */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={`text-white ${!canUndo ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-700"}`}
              onClick={handleUndo}
              disabled={!canUndo || isUndoRedoOperation}
              title={`Undo (${undoStack.length - 1} actions available)`}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`text-white ${!canRedo ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-700"}`}
              onClick={handleRedo}
              disabled={!canRedo || isUndoRedoOperation}
              title={`Redo (${redoStack.length} actions available)`}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => {
          setShowUpgradeModal(false);
          setRestrictedTool(null);
        }}
        restrictedTool={restrictedTool}
        reason={
          restrictedTool === "export"
            ? "Free plan is limited to 20 exports per month. Upgrade to Pro for unlimited exports."
            : undefined
        }
      />
    </>
  );
};

export default EditorTopbar;
