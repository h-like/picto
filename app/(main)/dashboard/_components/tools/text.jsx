import { useCanvas } from "@/context/context";
import { IText } from "fabric";
import React, { useState } from "react";

const FONT_FAMILIES = [
  "Arial",
  "Arial Black",
  "Helvetica",
  "Times New Roman",
  "Courier New",
  "Georgia",
  "Verdana",
  "Comic Sans MS",
  "Impact",
];

const FONT_SIZES = { min: 8, max: 120, default: 20 };

const TextControls = () => {
  const { canvasEditor } = useCanvas();

  const [selectedText, setSelectedText] = useState(null); // 현재 텍스트 오브젝트
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(FONT_SIZES.default);
  const [textColor, setTextColor] = useState("#000000");
  const [textAlign, setTextAlign] = useState("left"); // 강제로 리랜더링
  const [_, setChanged] = useState(0);

  if (!canvasEditor) {
    return (
      <div className="p-4">
        <p className="text-white/70 text-sm">Canvas not ready</p>
      </div>
    );
  }

  //   새로운 텍스트를 추가
  const addText = () => {
    if (!canvasEditor) return;

    const text = new IText("Edit this text", {
      left: canvasEditor.width / 2, // 선터 수평
      top: canvasEditor.height / 2,
      originX: "center",
      originY: "center",
      fontFamily,
      fontSize: FONT_SIZES.default,
      fill: textColor,
      textAlign,
      editable: true,
      selectable: true,
    });

    canvasEditor.add(text);
    canvasEditor.setActiveObject(text);
    canvasEditor.requestRenderAll();

    setTimeout(() => {
      text.enterEditing();  // 변경
      text.selectAll();
    }, 100);
  };

  return (
    <div className="space-y-6">
      {/* Add Text Button */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-white mb-2">Add Text</h3>
          <p className="text-xs text-white/70 mb-4">
            Click to add editable text to your canvas
          </p>
        </div>
        <Button onClick={addText} className="w-full" variant="primary">
          <Type className="h-4 w-4 mr-2" />
          Add Text
        </Button>
      </div>
    </div>
  );
};

export default TextControls;
