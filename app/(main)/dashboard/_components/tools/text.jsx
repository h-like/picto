import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useCanvas } from "@/context/context";
import { IText } from "fabric";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Trash2,
  Type,
  Underline,
} from "lucide-react";
import { useEffect, useState } from "react";

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
  "Momo Signature",
  "Roboto",
  "Nanum Gothic",
  "Archivo Black",
  "Russo One",
  "EB Garamond",
  "Courgette",
  "Bungee",
  "Noto Sans Korean",
  "Jua",
  "Do Hyeon",
  "Noto Serif Korean",
  "Hi Melody",
  "Kirang Haerang",
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
      text.enterEditing(); // 변경
      text.selectAll();
    }, 100);
  };

  // 선택된
  const updateSelectedText = () => {
    if (!canvasEditor) return;

    const activeObject = canvasEditor.getActiveObject();
    if (activeObject && activeObject.type === "i-text") {
      setSelectedText(activeObject);

      // 싱크
      setFontFamily(activeObject.fontFamily || "Arial");
      setFontSize(activeObject.fontSize || FONT_SIZES.default);
      setTextColor(activeObject.fill || "#000000");
      setTextAlign(activeObject.textAlign || "left");
    } else {
      setSelectedText(null);
    }
  };

  useEffect(() => {
    if (!canvasEditor) return;
    {
      const handleSelectionCreated = () => updateSelectedText();
      const handleSelectionUpdated = () => updateSelectedText();
      const handleSelectionCleared = () => setSelectedText(null);

      canvasEditor.on("selection:created", handleSelectionCreated);
      canvasEditor.on("selection:updated", handleSelectionUpdated);
      canvasEditor.on("selection:cleared", handleSelectionCleared);

      return () => {
        canvasEditor.off("selection:created", handleSelectionCreated);
        canvasEditor.off("selection:updated", handleSelectionUpdated);
        canvasEditor.off("selection:cleared", handleSelectionCleared);
      };
    }
  }, [canvasEditor]);

  // [추가] 선택된 폰트가 시스템 폰트가 아니면 동적으로 로드
  useEffect(() => {
    // 1. 이미 설치되어 있는 기본 폰트 목록 (다운로드 불필요)
    const systemFonts = [
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

    // 2. 현재 선택된 폰트가 기본 폰트이거나 없으면 중단
    if (!fontFamily || systemFonts.includes(fontFamily)) return;

    // 3. 폰트 ID 생성 (중복 다운로드 방지용)
    const fontId = `font-${fontFamily.replace(/\s+/g, "-")}`;
    if (document.getElementById(fontId)) return;

    // 4. 구글 폰트 링크 생성 및 다운로드
    const link = document.createElement("link");
    link.id = fontId;
    link.rel = "stylesheet";
    // 구글 폰트 URL 형식에 맞춰 공백을 '+'로 변경
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, "+")}&display=swap`;

    document.head.appendChild(link);
  }, [fontFamily]); // properties.fontFamily -> fontFamily로 변경됨

  // 폰트 적용
  const applyFontFamily = (family) => {
    if (!selectedText) return;
    setFontFamily(family);
    selectedText.set("fontFamily", family);
    canvasEditor.requestRenderAll();
  };

  // 폰트 사이즈 적용
  const applyFontSize = (size) => {
    if (!selectedText) return;

    //
    const newSize = Array.isArray(size) ? size[0] : size;
    setFontSize(newSize);
    selectedText.set("fontSize", newSize);
    canvasEditor.requestRenderAll();
  };

  // 텍스트 정렬
  const applyTextAlign = (alignment) => {
    if (!selectedText) return;
    setTextAlign(alignment);
    selectedText.set("textAlign", alignment);
    canvasEditor.requestRenderAll();
  };

  // 텍스트 컬러
  const applyTextColor = (color) => {
    if (!selectedText) return;
    setTextColor(color);
    selectedText.set("fill", color); // fabric.js
    canvasEditor.requestRenderAll();
  };

  // 포멧팅
  const toggleFormat = (format) => {
    if (!selectedText) return;

    switch (format) {
      case "bold": {
        const current = selectedText.fontWeight || "normal";
        selectedText.set("fontWeight", current === "bold" ? "normal" : "bold");
        break;
      }
      case "italic": {
        const current = selectedText.fontStyle || "normal";
        selectedText.set(
          "fontStyle",
          current === "italic" ? "normal" : "italic",
        );
        break;
      }
      case "underline": {
        const current = selectedText.underline || false;
        selectedText.set("underline", !current);
        break;
      }
    }

    canvasEditor.requestRenderAll();
    setChanged((c) => c + 1); // 👈 강제로 리렌더 버튼
  };

  // 선택한 텍스트 삭제
  const deleteSelectedText = () => {
    if (!canvasEditor || !selectedText) return;

    canvasEditor.remove(selectedText);
    canvasEditor.requestRenderAll();
    setSelectedText(null);
  };

  if (!canvasEditor) {
    return (
      <div className="p-4">
        <p className="text-white/70 text-sm">Canvas not ready</p>
      </div>
    );
  }

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
      {selectedText && (
        <div className="border-t border-white/10 pt-6">
          <h3 className="text-sm font-medium text-white mb-4">
            Edit Selected Text
          </h3>

          <div className="space-y-2 nb-4">
            <label className="text-xs text-white/70">Font Family</label>
            <select
              value={fontFamily}
              onChange={(e) => applyFontFamily(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-white/20 rounded text-white text-sm"
            >
              {FONT_FAMILIES.map((font) => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          {/* 폰트 사이즈 */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center">
              <label className="text-xs text-white/70">Font Size</label>
              <span className="text-xs text-white/70">{fontSize}px</span>
            </div>
            <Slider
              value={[fontSize]}
              onValueChange={applyFontSize}
              min={FONT_SIZES.min}
              max={FONT_SIZES.max}
              step={1}
              className="w-full"
            />
          </div>

          {/* 텍스트 정렬 */}
          <div className="space-y-2 mb-4">
            <label className="text-xs text-white/70">Text Alignment</label>
            <div className="grid grid-cols-4 gap-1">
              {[
                ["left", AlignLeft],
                ["center", AlignCenter],
                ["right", AlignRight],
                ["justify", AlignJustify],
              ].map(([align, Icon]) => (
                <Button
                  key={align}
                  onClick={() => applyTextAlign(align)}
                  variant={textAlign === align ? "default" : "outline"}
                  size="sm"
                  className="p-2"
                >
                  <Icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </div>

          {/* 텍스트 컬러 */}
          <div className="space-y-2 mb-4">
            <label className="text-xs text-white/70">Text Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={textColor}
                onChange={(e) => applyTextColor(e.target.value)}
                className="w-10 h-10 rounded border border-white/20 bg-transparent cursor-pointer"
              />
              <Input
                value={textColor}
                onChange={(e) => applyTextColor(e.target.value)}
                placeholder="#000000"
                className="flex-1 bg-slate-700 border-white/20 text-white text-sm"
              />
            </div>
          </div>

          {/* 텍스트 포멧팅 */}
          <div className="space-y-2 mb-4">
            <label className="text-xs text-white/70">Formatting</label>
            <div className="flex gap-2">
              <Button
                onClick={() => toggleFormat("bold")}
                variant={
                  selectedText.fontWeight === "bold" ? "default" : "outline"
                }
                size="sm"
                className="flex-1"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => toggleFormat("italic")}
                variant={
                  selectedText.fontStyle === "italic" ? "default" : "outline"
                }
                size="sm"
                className="flex-1"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => toggleFormat("underline")}
                variant={selectedText.underline ? "default" : "outline"}
                size="sm"
                className="flex-1"
              >
                <Underline className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 삭제 버튼 */}
          <Button
            onClick={deleteSelectedText}
            variant="outline"
            className="w-full text-red-400 border-red-400/20 hover:bg-red-400/10"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Text
          </Button>
        </div>
      )}

      {/* 사용법 */}
      <div className="bg-slate-700/30 rounded-lg p-3">
        <p className="text-xs text-white/70">
          <strong>Double-click</strong> any text to edit it directly on canvas.
          <br />
          <strong>Select</strong> text to see formatting options here.
        </p>
      </div>
    </div>
  );
};

export default TextControls;
