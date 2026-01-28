import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCanvas } from "@/context/context";
import { FabricImage } from "fabric";
import {
  Download,
  ImageIcon,
  Loader2,
  Palette,
  Search,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { toast } from "sonner";

const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
const UNSPLASH_API_URL = "https://api.unsplash.com";

const BackgroundControls = ({ project }) => {
  const { canvasEditor, processingMessage, setProcessingMessage } = useCanvas();
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [searchQuery, setSearchQuery] = useState("");
  const [unsplashImages, setUnsplashImages] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState(null);

  const getMainImage = () => {
    if (!canvasEditor) return null;
    const objects = canvasEditor.getObjects();
    return objects.find((obj) => obj.type === "image") || null;
  };

  const handleBackgroundRemoval = async () => {
    const mainImage = getMainImage();
    if (!mainImage || !project) return;

    setProcessingMessage("Removing background with AI...");

    try {
      // Get the current image URL
      const currentImageUrl =
        project.currentImageUrl || project.originalImageUrl;

      // Create ImageKit transformation URL for background removal
      const bgRemovedUrl = currentImageUrl.includes("ik.imagekit.io")
        ? `${currentImageUrl.split("?")[0]}?tr=e-bgremove`
        : currentImageUrl;

      // Create new image with background removed
      const processedImage = await FabricImage.fromURL(bgRemovedUrl, {
        crossOrigin: "anonymous",
      });

      // Store the current properties before removing the old image
      const currentProps = {
        left: mainImage.left,
        top: mainImage.top,
        scaleX: mainImage.scaleX,
        scaleY: mainImage.scaleY,
        angle: mainImage.angle,
        originX: mainImage.originX,
        originY: mainImage.originY,
      };

      // Remove the old image and add the new one
      canvasEditor.remove(mainImage);
      processedImage.set(currentProps);
      canvasEditor.add(processedImage);

      // IMPORTANT: Update coordinates after replacing the image
      processedImage.setCoords();

      // Set as active object and recalculate canvas offset
      canvasEditor.setActiveObject(processedImage);
      canvasEditor.calcOffset();
      canvasEditor.requestRenderAll();

      console.log("Background removed successfully");
    } catch (error) {
      console.error("Error removing background:", error);
      alert("Failed to remove background. Please try again.");
    } finally {
      setProcessingMessage(null);
    }
  };

  const handleColorBackground = () => {
    if (!canvasEditor) return;

    // In Fabric.js 6.7, set property directly and render
    canvasEditor.backgroundColor = backgroundColor;
    canvasEditor.requestRenderAll();
  };

  const searchUnsplashImages = async () => {
    if (!searchQuery.trim() || !UNSPLASH_ACCESS_KEY) return;

    setIsSearching(true);

    try {
      const response = await fetch(
        `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=12`,
        {
          headers: {
            Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to search images");

      const data = await response.json();
      setUnsplashImages(data.results || []);
    } catch (error) {
      console.error("Error searching Unsplash:", error);
      alert("Failed to search images. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

   // 캔버스 배경 제거 (both color and image)
  const handleRemoveBackground = () => {
    if (!canvasEditor) return;

    // Clear both background color and image
    canvasEditor.backgroundColor = null;
    canvasEditor.backgroundImage = null;
    canvasEditor.requestRenderAll();
  };

  // enter 키로 검색 가능하게
  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      searchUnsplashImages();
    }
  };

  // 이미지를 캔버스 배경으로 설정
  const handleImageBackground = async (imageUrl, imageId) => {
    if (!canvasEditor) return;

    setSelectedImageId(imageId);
    /**
     * Unsplash API 정책상 다운로드 트래킹을 위해
     * 이미지 사용 시 download 엔드포인트 호출이 필요함
     * → 실제 응답은 사용하지 않으므로 실패해도 무시
     */
    try {
      if (UNSPLASH_ACCESS_KEY) {
        fetch(`${UNSPLASH_API_URL}/photos/${imageId}/download`, {
          headers: {
            Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
        }).catch(() => {}); // 다운로드 트래킹 실패 시 조용히 무시
      }

      /**
       * 이미지 URL을 기반으로 Fabric 이미지 객체 생성
       * crossOrigin 설정은 CORS 이슈 방지를 위함
       */
      const fabricImage = await FabricImage.fromURL(imageUrl, {
        crossOrigin: "anonymous",
      });

      /**
       * 실제 canvas DOM 크기가 아닌
       * 프로젝트 기준 논리적 캔버스 크기 사용
       * (비율 계산 정확도 향상)
       */
      const canvasWidth = project.width; 
      const canvasHeight = project.height; 

      // 가로 / 세로 기준 스케일 비율 계산
      const scaleX = canvasWidth / fabricImage.width;
      const scaleY = canvasHeight / fabricImage.height;

      // 캔버스를 완전히 채우기 위해 더 큰 스케일 값을 사용 (빈 여백 방지)
      const scale = Math.max(scaleX, scaleY);

      // 이미지 중앙 정렬 + 스케일 적용
      fabricImage.set({
        scaleX: scale,
        scaleY: scale,
        originX: "center",
        originY: "center",
        left: canvasWidth / 2, // Use project dimensions
        top: canvasHeight / 2, // Use project dimensions
      });

      // 캔버스 배경 이미지로 설정 후 렌더링
      canvasEditor.backgroundImage = fabricImage;
      canvasEditor.requestRenderAll();

      //이미지 설정 완료 → 선택 상태 초기화
      setSelectedImageId(null);

      console.log("Background set:", {
        imageSize: `${fabricImage.width}x${fabricImage.height}`,
        canvasSize: `${canvasWidth}x${canvasHeight}`,
        scale: scale,
        finalSize: `${fabricImage.width * scale}x${fabricImage.height * scale}`,
      });
    } catch (error) {
      console.error("Error setting background image:", error);
      toast.error("Failed to set background image. Please try again.");
      setSelectedImageId(null);
    }
  };

  return (
    <div className="space-y-6 relative h-full">
      {/* AI Background Removal Button - Outside of tabs */}
      <div className="space-y-4 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-sm font-medium text-white mb-2">
            AI Background Removal
          </h3>
          <p className="text-xs text-white/70 mb-4">
            Automatically remove the background from your image using AI
          </p>
        </div>

        <Button
          onClick={handleBackgroundRemoval}
          disabled={processingMessage || !getMainImage()}
          className="w-full"
          variant="primary"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Remove Image Background
        </Button>

        {/* 메인 이미지가 없을 경우 */}
        {!getMainImage() && (
          <p className="text-xs text-amber-400">
            Please add an image to the canvas first to remove its background
          </p>
        )}
      </div>

      <Tabs defaultValue="color" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-700/50">
          <TabsTrigger
            value="color"
            className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white"
          >
            <Palette className="h-4 w-4 mr-2" />
            Color
          </TabsTrigger>
          <TabsTrigger
            value="image"
            className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Image
          </TabsTrigger>
        </TabsList>

        {/* Color Background Tab */}
        <TabsContent value="color" className="space-y-4 mt-6">
          <div>
            <h3 className="text-sm font-medium text-white mb-2">
              Solid Color Background
            </h3>
            <p className="text-xs text-white/70 mb-4">
              Choose a solid color for your canvas background
            </p>
          </div>

          <div className="space-y-4">
            <HexColorPicker
              color={backgroundColor}
              onChange={setBackgroundColor}
              style={{ width: "100%" }}
            />

            <div className="flex items-center gap-2">
              <Input
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                placeholder="#ffffff"
                className="flex-1 bg-slate-700 border-white/20 text-white"
              />
              <div
                className="w-10 h-10 rounded border border-white/20"
                style={{ backgroundColor }}
              />
            </div>

            <Button
              onClick={handleColorBackground}
              className="w-full"
              variant="primary"
            >
              <Palette className="h-4 w-4 mr-2" />
              Apply Color
            </Button>
          </div>
        </TabsContent>

        {/* Image Background Tab */}
        <TabsContent value="image" className="space-y-4 mt-6">
          <div>
            <h3 className="text-sm font-medium text-white mb-2">
              Image Background
            </h3>
            <p className="text-xs text-white/70 mb-4">
              Search and use high-quality images from Unsplash
            </p>
          </div>

          {/* 검색창 */}
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress} // 엔터로 검색 허용
              placeholder="Search for backgrounds..."
              className="flex-1 bg-slate-700 border-white/20 text-white"
            />
            <Button
              onClick={searchUnsplashImages}
              disabled={isSearching || !searchQuery.trim()} //미입력 시 검색창 비활성화
              variant="primary"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* 검색 결과 */}
          {unsplashImages?.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-white">
                Search Results ({unsplashImages?.length})
              </h4>
              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {unsplashImages.map((image) => (
                  <div
                    key={image.id}
                    className="relative group cursor-pointer rounded-lg overflow-hidden border border-white/10 hover:border-cyan-400 transition-colors"
                    onClick={() =>
                      handleImageBackground(image.urls.regular, image.id)
                    }
                  >
                    <img
                      src={image.urls.small}
                      alt={image.alt_description || "Background image"}
                      className="w-full h-24 object-cover"
                    />

                    {/* Loading overlay */}
                    {selectedImageId === image.id && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Download className="h-5 w-5 text-white" />
                    </div>

                    {/* Attribution */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1">
                      <p className="text-xs text-white/80 truncate">
                        by {image.user.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 검색 결과가 없을 때 */}
          {!isSearching && unsplashImages?.length === 0 && searchQuery && (
            <div className="text-center py-8">
              <ImageIcon className="h-12 w-12 text-white/30 mx-auto mb-3" />
              <p className="text-white/70 text-sm">
                No images found for "{searchQuery}"
              </p>
              <p className="text-white/50 text-xs">
                Try a different search term
              </p>
            </div>
          )}

          {/* Initial state */}
          {!searchQuery && unsplashImages?.length === 0 && (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-white/30 mx-auto mb-3" />
              <p className="text-white/70 text-sm">
                Search for background images
              </p>
              <p className="text-white/50 text-xs">Powered by Unsplash</p>
            </div>
          )}

          {/* API key 문제 */}
          {!UNSPLASH_ACCESS_KEY && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
              <p className="text-amber-400 text-xs">
                Unsplash API key not configured. Please add
                NEXT_PUBLIC_UNSPLASH_ACCESS_KEY to your environment variables.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="pt-4 border-t border-white/10 bottom-0 w-full">
        <Button
          onClick={handleRemoveBackground}
          className="w-full"
          variant="outline"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Canvas Background
        </Button>
      </div>
    </div>
  );
};

export default BackgroundControls;
