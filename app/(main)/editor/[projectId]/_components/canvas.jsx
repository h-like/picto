// import { useCanvas } from "@/context/context";
// import { api } from "@/convex/_generated/api";
// import { useConvexMutation } from "@/hooks/use-convex-query";
// import { Canvas, FabricImage } from "fabric";
// import React, { useEffect, useRef, useState } from "react";

// function CanvasEditor({ project }) {
//   const canvasRef = useRef();
//   const containerRef = useRef();

//   const fabricRef = useRef(null);
//   const { canvasEditor, setCanvasEditor, activeTool, onToolChange } =
//     useCanvas();
//   const [isLoading, setIsLoading] = useState(true);

//   const { mutate: updateProject } = useConvexMutation(
//     api.projects.updateProject
//   );

//   const calculateViewportScale = () => {
//     if (!containerRef.current || !project) return 1;
//     const container = containerRef.current;
//     const containerWidth = container.clientWidth - 40;
//     const containerHeight = container.clientHeight - 40;
//     const scaleX = containerWidth / project.width;
//     const scaleY = containerHeight / project.height;
//     return Math.min(scaleX, scaleY, 1);
//   };

//   useEffect(() => {
//     if (!canvasRef.current || !project || fabricRef.current) return;

//     // [중요] 컴포넌트가 살아있는지 확인하는 플래그
//     let isMounted = true;

//     const initializeCanvas = async () => {
//       setIsLoading(true);

//       const viewportScale = calculateViewportScale();
//       const canvas = new Canvas(canvasRef.current, {
//         width: project.width,
//         height: project.height,
//         backgroundColor: "#ffffff",
//         preserveObjectStacking: true,
//         controlsAboveOverlay: true,
//         selection: true,
//         hoverCursor: "move",
//         moveCursor: "move",
//         defaultCursor: "default",
//         allowTouchScrolling: false,
//         renderOnAddRemove: true,
//         skipTargetFind: false,
//       });

//       fabricRef.current = canvas;

//       // 하단, 상단 캔버스 레이어 모두 동기화
//       canvas.setDimensions(
//         {
//           width: project.width * viewportScale,
//           height: project.height * viewportScale,
//         },
//         { backstoreOnly: false }
//       );

//       canvas.setZoom(viewportScale);

//       // High DPI 처리 (optional)
//       const scaleFactor = window.devicePixelRatio || 1;
//       if (scaleFactor > 1) {
//         canvas.getElement().width = project.width * scaleFactor;
//         canvas.getElement().height = project.height * scaleFactor;
//         canvas.getContext().scale(scaleFactor, scaleFactor);
//       }

//       // Load image
//       if (project.currentImageUrl || project.originalImageUrl) {
//         try {
//           const imageUrl = project.currentImageUrl || project.originalImageUrl;

//           // 외부 이미지 사용 시 canvas export(toDataURL) 보안 오류 방지
//           const fabricImage = await FabricImage.fromURL(imageUrl, {
//             crossOrigin: "anonymous",
//           });

//           // [방어 코드 1] 기다리는 동안 컴포넌트가 언마운트 되었으면 여기서 멈춤!
//           // 캔버스가 dispose 된 상태에서 아래 코드가 실행되면 에러가 남
//           if (!isMounted || !fabricRef.current) return;

//           const imgAspectRatio = fabricImage.width / fabricImage.height;
//           const canvasAspectRatio = project.width / project.height;
//           let scaleX, scaleY;

//           // 이미지 비율을 유지하면서 캔버스 안에 최대한 맞추기 (object-fit: contain)
//           if (imgAspectRatio > canvasAspectRatio) {
//             // 이미지가 캔버스보다 가로로 더 긴 비율일 때 (예: 파노라마 사진)
//             scaleX = project.width / fabricImage.width;
//             scaleY = scaleX;
//           } else {
//             // 이미지가 캔버스보다 세로로 더 긴 비율일 때 (예: 초상화 사진) 
//             scaleY = project.height / fabricImage.height;
//             scaleX = scaleY;
//           }

//           fabricImage.set({
//             left: project.width / 2,    // 캔버스 가로 중앙
//             top: project.height / 2,    // 캔버스 세로 중앙

//             // 스케일/회전 시 기준점을 중앙으로 통일
//             originX: "center",
//             originY: "center",
//             scaleX,
//             scaleY,

//             // 사용자 선택 및 마우스 이벤트 허용
//             selectable: true,
//             evented: true,
//           });

//           canvas.add(fabricImage);    // 캔버스에 객체 추가

//           // Fabric 내부 좌표 오차 보정을 위한 안전한 중앙 정렬
//           canvas.centerObject(fabricImage);
//         } catch (error) {
//           console.error("Error loading project image:", error);
//         }
//       }

//       // 캔버스 상태 불러오기
//       if (project.canvasState) {
//         try {
//           await canvas.loadFromJSON(project.canvasState);

//           // [방어 코드 2] 기다리는 동안 언마운트 되었으면 멈춤
//           if (!isMounted || !fabricRef.current) return;

//           canvas.requestRenderAll();  // 데이터 로드했으니, 새로고침해라!
//         } catch (error) {
//           console.error("Error loading canvas state:", error);
//         }
//       }

//       // [방어 코드 3] 마지막으로 렌더링하기 전에도 확인
//       if (!isMounted || !fabricRef.current) return

//       canvas.calcOffset();
//       canvas.requestRenderAll();
//       setCanvasEditor(canvas);

//       setTimeout(() => {
//         // 초기 크기 조정 이벤트 트리거
//         if (isMounted) {
//             window.dispatchEvent(new Event("resize"));
//         }
//       }, 500);

//       setIsLoading(false);
//     };

//     initializeCanvas();

//     // Cleanup 함수
//     return () => {
//       isMounted = false; // "나 죽었어"라고 깃발 내림
      
//       if (fabricRef.current) {
//         // 이미 dispose된 캔버스를 또 dispose 하지 않도록 try-catch 감싸는 것도 좋음
//         try {
//             fabricRef.current.dispose();  // Fabric.js 클린업 메서드
//         } catch (e) {
//             console.warn("Dispose error ignored:", e);
//         }
//         fabricRef.current = null;
//       }
//       setCanvasEditor(null);
//     };
//   }, [project]); // 의존성 배열

//   const saveCanvasState = async () => {
//     if (!canvasEditor || !project) return;

//     try {
//       const canvasJSON = canvasEditor.toJSON();
//       await updateProject({
//         projectId: project._id,
//         canvasState: canvasJSON,
//       });
//     } catch (error) {
//       console.error("Error saving canvas state:", error);
//     }
//   };

//   useEffect(() => {
//     if (!canvasEditor) return;
//     let saveTimeout;

//     const handleCanvasChange = () => {
//       clearTimeout(saveTimeout);
//       saveTimeout = setTimeout(() => {
//         saveCanvasState();
//       }, 2000);
//     };

//     canvasEditor.on("object:modified", handleCanvasChange);
//     canvasEditor.on("object:added", handleCanvasChange);
//     canvasEditor.on("object:removed", handleCanvasChange);

//     return () => {
//       clearTimeout(saveTimeout);
//       canvasEditor.off("object:modified", handleCanvasChange);
//       canvasEditor.off("object:added", handleCanvasChange);
//       canvasEditor.off("object:removed", handleCanvasChange);
//     };
//   }, [canvasEditor]);

//   // 캔버스 커서 모양 변경
//   useEffect(() => {
//     if (!canvasEditor) return;

//     switch (activeTool) {
//       case "crop":
//         canvasEditor.defaultCursor = "crosshair";
//         canvasEditor.hoverCursor = "crosshair";
//         break;
//       default:
//         canvasEditor.defaultCursor = "default";
//         canvasEditor.hoverCursor = "move";
//     }
//   }, [canvasEditor, activeTool]);

//   useEffect(() => {
//     const handleResize = () => {
//       if (!canvasEditor || !project) return;

//       const newScale = calculateViewportScale();
//       canvasEditor.setDimensions(
//         {
//           width: project.width * newScale,
//           height: project.height * newScale,
//         },
//         { backstoreOnly: false }
//       );
//       canvasEditor.setZoom(newScale);
//       canvasEditor.calcOffset();
//       canvasEditor.requestRenderAll();
//     };

//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, [canvasEditor, project]);

//   // Handle automatic tab switching when text is selected
//   useEffect(() => {
//     if (!canvasEditor || !onToolChange) return;

//     const handleSelection = (e) => {
//       const selectedObject = e.selected?.[0];
//       if (selectedObject && selectedObject.type === "i-text") {
//         onToolChange("text");
//       }
//     };

//     canvasEditor.on("selection:created", handleSelection);
//     canvasEditor.on("selection:updated", handleSelection);

//     return () => {
//       canvasEditor.off("selection:created", handleSelection);
//       canvasEditor.off("selection:updated", handleSelection);
//     };
//   }, [canvasEditor, onToolChange]);

//   return (
//     <div
//       ref={containerRef}
//       className="relative flex items-center justify-center bg-secondary w-full h-full overflow-hidden"
//     >
//       <div
//         className="absolute inset-0 opacity-10 pointer-events-none"
//         style={{
//           backgroundImage: `
//             linear-gradient(45deg, #64748b 25%, transparent 25%),
//             linear-gradient(-45deg, #64748b 25%, transparent 25%),
//             linear-gradient(45deg, transparent 75%, #64748b 75%),
//             linear-gradient(-45deg, transparent 75%, #64748b 75%)`,
//           backgroundSize: "20px 20px",
//           backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
//         }}
//       />

//       {isLoading && (
//         <div className="absolute inset-0 flex items-center justify-center bg-slate-800/80 z-10">
//           <div className="flex flex-col items-center gap-4">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
//             <p className="text-white/70 text-sm">Loading canvas...</p>
//           </div>
//         </div>
//       )}

//       <div className="px-5">
//         <canvas id="canvas" className="border" ref={canvasRef} />
//       </div>
//     </div>
//   );
// }

// export default CanvasEditor;

import { useCanvas } from "@/context/context";
import { api } from "@/convex/_generated/api";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { Canvas, FabricImage } from "fabric";
import React, { useEffect, useRef, useState } from "react";

function CanvasEditor({ project }) {
  const canvasRef = useRef();
  const containerRef = useRef();
  const { canvasEditor, setCanvasEditor, activeTool, onToolChange } =
    useCanvas();
  const [isLoading, setIsLoading] = useState(true);

  const { mutate: updateProject } = useConvexMutation(
    api.projects.updateProject
  );

  const calculateViewportScale = () => {
    if (!containerRef.current || !project) return 1;
    const container = containerRef.current;
    const containerWidth = container.clientWidth - 40;
    const containerHeight = container.clientHeight - 40;
    const scaleX = containerWidth / project.width;
    const scaleY = containerHeight / project.height;
    return Math.min(scaleX, scaleY, 1);
  };

  useEffect(() => {
    if (!canvasRef.current || !project || canvasEditor) return;

    const initializeCanvas = async () => {
      setIsLoading(true);

      const viewportScale = calculateViewportScale();
      const canvas = new Canvas(canvasRef.current, {
        width: project.width,
        height: project.height,
        backgroundColor: "#ffffff",
        preserveObjectStacking: true,
        controlsAboveOverlay: true,
        selection: true,
        hoverCursor: "move",
        moveCursor: "move",
        defaultCursor: "default",
        allowTouchScrolling: false,
        renderOnAddRemove: true,
        skipTargetFind: false,
      });

      // Sync both lower and upper canvas layers
      canvas.setDimensions(
        {
          width: project.width * viewportScale,
          height: project.height * viewportScale,
        },
        { backstoreOnly: false }
      );

      canvas.setZoom(viewportScale);

      // High DPI handling (optional, comment if you don’t need)
      const scaleFactor = window.devicePixelRatio || 1;
      if (scaleFactor > 1) {
        canvas.getElement().width = project.width * scaleFactor;
        canvas.getElement().height = project.height * scaleFactor;
        canvas.getContext().scale(scaleFactor, scaleFactor);
      }

      // Load image
      if (project.currentImageUrl || project.originalImageUrl) {
        try {
          const imageUrl = project.currentImageUrl || project.originalImageUrl;
          const fabricImage = await FabricImage.fromURL(imageUrl, {
            crossOrigin: "anonymous",
          });

          const imgAspectRatio = fabricImage.width / fabricImage.height;
          const canvasAspectRatio = project.width / project.height;
          let scaleX, scaleY;

          if (imgAspectRatio > canvasAspectRatio) {
            scaleX = project.width / fabricImage.width;
            scaleY = scaleX;
          } else {
            scaleY = project.height / fabricImage.height;
            scaleX = scaleY;
          }

          fabricImage.set({
            left: project.width / 2,
            top: project.height / 2,
            originX: "center",
            originY: "center",
            scaleX,
            scaleY,
            selectable: true,
            evented: true,
          });

          canvas.add(fabricImage);
          canvas.centerObject(fabricImage);
        } catch (error) {
          console.error("Error loading project image:", error);
        }
      }

      // Load saved canvas state
      if (project.canvasState) {
        try {
          await canvas.loadFromJSON(project.canvasState);
          canvas.requestRenderAll();
        } catch (error) {
          console.error("Error loading canvas state:", error);
        }
      }

      canvas.calcOffset();
      canvas.requestRenderAll();
      setCanvasEditor(canvas);

      setTimeout(() => {
        // workaround for initial resize issues
        window.dispatchEvent(new Event("resize"));
      }, 500);

      setIsLoading(false);
    };

    initializeCanvas();

    return () => {
      if (canvasEditor) {
        canvasEditor.dispose();
        setCanvasEditor(null);
      }
    };
  }, [project]);

  const saveCanvasState = async () => {
    if (!canvasEditor || !project) return;

    try {
      const canvasJSON = canvasEditor.toJSON();
      await updateProject({
        projectId: project._id,
        canvasState: canvasJSON,
      });
    } catch (error) {
      console.error("Error saving canvas state:", error);
    }
  };

  useEffect(() => {
    if (!canvasEditor) return;
    let saveTimeout;

    const handleCanvasChange = () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        saveCanvasState();
      }, 2000);
    };

    canvasEditor.on("object:modified", handleCanvasChange);
    canvasEditor.on("object:added", handleCanvasChange);
    canvasEditor.on("object:removed", handleCanvasChange);

    return () => {
      clearTimeout(saveTimeout);
      canvasEditor.off("object:modified", handleCanvasChange);
      canvasEditor.off("object:added", handleCanvasChange);
      canvasEditor.off("object:removed", handleCanvasChange);
    };
  }, [canvasEditor]);

  useEffect(() => {
    if (!canvasEditor) return;

    switch (activeTool) {
      case "crop":
        canvasEditor.defaultCursor = "crosshair";
        canvasEditor.hoverCursor = "crosshair";
        break;
      default:
        canvasEditor.defaultCursor = "default";
        canvasEditor.hoverCursor = "move";
    }
  }, [canvasEditor, activeTool]);

  useEffect(() => {
    const handleResize = () => {
      if (!canvasEditor || !project) return;

      const newScale = calculateViewportScale();
      canvasEditor.setDimensions(
        {
          width: project.width * newScale,
          height: project.height * newScale,
        },
        { backstoreOnly: false }
      );
      canvasEditor.setZoom(newScale);
      canvasEditor.calcOffset();
      canvasEditor.requestRenderAll();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [canvasEditor, project]);

  // 텍스트를 선택하면 자동 탭 전환 처리
  useEffect(() => {
    if (!canvasEditor || !onToolChange) return;

    const handleSelection = (e) => {
      const selectedObject = e.selected?.[0];
      if (selectedObject && selectedObject.type === "i-text") {
        onToolChange("text");
      }
    };

    canvasEditor.on("selection:created", handleSelection);
    canvasEditor.on("selection:updated", handleSelection);

    return () => {
      canvasEditor.off("selection:created", handleSelection);
      canvasEditor.off("selection:updated", handleSelection);
    };
  }, [canvasEditor, onToolChange]);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center bg-secondary w-full h-full overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(45deg, #64748b 25%, transparent 25%),
            linear-gradient(-45deg, #64748b 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #64748b 75%),
            linear-gradient(-45deg, transparent 75%, #64748b 75%)`,
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
        }}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800/80 z-10">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            <p className="text-white/70 text-sm">Loading canvas...</p>
          </div>
        </div>
      )}

      <div className="px-5">
        <canvas id="canvas" className="border" ref={canvasRef} />
      </div>
    </div>
  );
}

export default CanvasEditor;