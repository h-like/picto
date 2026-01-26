"use client";

import { Button } from "@/components/ui/button";
import { useCanvas } from "@/context/context";
import { api } from "@/convex/_generated/api";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import React, { useState } from "react";

const DIRECTIONS = [
  { key: "top", label: "Top", icon: ArrowUp },
  { key: "bottom", label: "Bottom", icon: ArrowDown },
  { key: "left", label: "Left", icon: ArrowLeft },
  { key: "right", label: "Right", icon: ArrowRight },
];

const FOCUS_MAP = {
  left: "fo-right",
  right: "fo-left",
  top: "fo-bottom",
  bottom: "fo-top",
};

const AIExtendControls = ({ project }) => {
  const { canvasEditor, setProcessingMessage } = useCanvas();
  const [selectedDirection, setSelectedDirection] = useState(null);
  const [extensionAmount, setExtensionAmount] = useState(200);
  const { mutate: updateProject } = useConvexMutation(
    api.projects.updateProject,
  );

  // 캔버스 에디터에 존재하는 객체 중 첫 번째 이미지 객체를 반환
  const getMainImage = () =>
    canvasEditor?.getObjects().find((obj) => obj.type === "image") || null;

  // 이미지 객체로부터 실제 이미지 url을 추출
  const getImageSrc = (image) =>
    image?.getSrc?.() || image?._element?.src || image?.src;

  // 뒷배경이 없는 이미지는 확장이 안되게끔
  const hasBackgroundRemoval = () => {
    const imageSrc = getImageSrc(getMainImage());
    return (
      imageSrc?.includes("e-bgremove") || // 이미지키트 background removal
      imageSrc?.includes("e-removedotbg") || // 대체 background removal
      imageSrc?.includes("e-changebg") // background change
    );
  };

  if (hasBackgroundRemoval()) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
        <h3 className="text-amber-400 font-medium mb-2">
          Extension Not Available
        </h3>
        <p className="text-amber-300/80 text-sm">
          AI Extension cannot be used on images with removed backgrounds. Use
          extension first, then remove background.
        </p>
      </div>
    );
  }

  const calculateDimensions = () => {
    const image = getMainImage();
    if (!image || !selectedDirection) return { width: 0, height: 0 };

    const currentWidth = image.width * (image.scaleX || 1);
    const currentHeight = image.height * (image.scaleY || 1);

    const isHorizontal = ["left", "right"].includes(selectedDirection);
    const isVertical = ["top", "bottom"].includes(selectedDirection);

    return {
      width: Math.round(currentWidth + (isHorizontal ? extensionAmount : 0)),
      height: Math.round(currentHeight + (isVertical ? extensionAmount : 0)),
    };
  };

  const { width, height } = calculateDimensions();
  
    const selectDirection = (direction) => {
    // 동일한 방향 선택 시 선택 취소
    setSelectedDirection((prev) => (prev === direction ? null : direction));
  };


  return (
    <div className="space-y-6">
      {/* Direction Selection */}
      <div>
        <h3 className="text-sm font-medium text-white mb-3">
          Select Extension Direction
        </h3>
        <p className="text-xs text-white/70 mb-3">
          Choose one direction to extend your image
        </p>
        <div className="grid grid-cols-2 gap-3">
          {DIRECTIONS.map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              onClick={() => selectDirection(key)}
              variant={selectedDirection === key ? "default" : "outline"}
              className={`flex items-center gap-2 ${
                selectedDirection === key ? "bg-cyan-500 hover:bg-cyan-600" : ""
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIExtendControls;
