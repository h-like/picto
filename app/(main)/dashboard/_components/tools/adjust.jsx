"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useCanvas } from "@/context/context";
import { filters } from "fabric";
import { RotateCcw } from "lucide-react";
import React, { useState } from "react";

const FILTER_CONFIGS = [
  {
    key: "brightness",
    label: "Brightness",
    min: -100,
    max: 100,
    step: 1,
    defaultValue: 0,
    filterClass: filters.Brightness,
    valueKey: "brightness",
    transform: (value) => value / 100,
  },
  {
    key: "contrast",
    label: "Contrast",
    min: -100,
    max: 100,
    step: 1,
    defaultValue: 0,
    filterClass: filters.Contrast,
    valueKey: "contrast",
    transform: (value) => value / 100,
  },
  {
    key: "saturation",
    label: "Saturation",
    min: -100,
    max: 100,
    step: 1,
    defaultValue: 0,
    filterClass: filters.Saturation,
    valueKey: "saturation",
    transform: (value) => value / 100,
  },
  {
    key: "vibrance",
    label: "Vibrance",
    min: -100,
    max: 100,
    step: 1,
    defaultValue: 0,
    filterClass: filters.Vibrance,
    valueKey: "vibrance",
    transform: (value) => value / 100,
  },
  {
    key: "blur",
    label: "Blur",
    min: 0,
    max: 100,
    step: 1,
    defaultValue: 0,
    filterClass: filters.Blur,
    valueKey: "blur",
    transform: (value) => value / 100,
  },
  {
    key: "hue",
    label: "Hue",
    min: -180,
    max: 180,
    step: 1,
    defaultValue: 0,
    filterClass: filters.HueRotation,
    valueKey: "rotation",
    transform: (value) => value * (Math.PI / 180),
    suffix: "°",
  },
];

const DEFAULT_VALUES = FILTER_CONFIGS.reduce((acc, config) => {
  acc[config.key] = config.defaultValue;
  return acc;
}, {});

const AdjustControls = () => {
  const [filterValues, setFilterValues] = useState(DEFAULT_VALUES);
  const [isApplying, setIsApplying] = useState(false);

  const { canvasEditor } = useCanvas();

  const getActiveImage = () => {
    if (!canvasEditor) return null;
    const activeObject = canvasEditor.getActiveObject();

    if (activeObject && activeObject.type === "image") return activeObject;

    const objects = canvasEditor.getObjects();
    return objects.find((obj) => obj.type === "image") || null;
  };

  const applyFilters = async (newValue) => {
    const imageObject = getActiveImage();
    if (!imageObject || isApplying) return;

    setIsApplying(true);

    try {
      const filtersToApply = [];

      FILTER_CONFIGS.forEach((config) => {
        const value = newValue[config.key];
        if (value !== config.defaultValue) {
          const transformValue = config.transform(value);
          filtersToApply.push(
            new config.filterClass({ [config.valueKey]: transformValue })
          );
        }
      });
      imageObject.filters = filtersToApply;

      await new Promise((resolve) => {
        imageObject.applyFilters();
        canvasEditor.requestRenderAll();
        setTimeout(resolve, 50);
      });
    } catch (error) {
      console.error("Error applying filters:", error);
    } finally {
      setIsApplying(false);
    }
  };

  const handleValueChange = (filterKey, value) => {
    const newValue = {
      ...filterValues,
      [filterKey]: Array.isArray(value) ? value[0] : value,
    };

    setFilterValues(newValue);
    applyFilters(newValue);
  };

  const restFilters = () => {
    setFilterValues(DEFAULT_VALUES);
    applyFilters(DEFAULT_VALUES);
  };

  if (!canvasEditor) {
    return (
      <div className="p-4">
        <p className="text-white/70 text-sm">
          Load an image to start adjusting
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 리셋 버튼  */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-white">Image Adjustments</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={restFilters}
          className="text-white/70 hover:text-white"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* 필터 */}
      {FILTER_CONFIGS.map((config) => {
        return (
          <div key={config.key} className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm text-white">{config.label}</label>
              <span className="text-xs text-white/70">
                {filterValues[config.key]}
                {config.suffix || ""}
              </span>
            </div>

            <Slider
              value={[filterValues[config.key]]}
              onValueChange={(value) => handleValueChange(config.key, value)}
              min={config.min}
              max={config.max}
              step={config.step}
              className="w-full"
            />
          </div>
        );
      })}

      {/* info */}
      <div className="mt-6 bg-slate-700/50 rounded-b-lg">
        <p className="text-xs text-white/70">
          Adjustments are applied in real-time. Use the Reset button to restore
          original values.
        </p>
      </div>

      {isApplying && (
        <div className="flex items-center justify-center py-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400"></div>
          <span className="ml-2 text-xs text-white/70">
            Applying filters...
          </span>
        </div>
      )}
    </div>
  );
};

export default AdjustControls;
