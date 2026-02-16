import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

function getCroppedImg(imageSrc, pixelCrop) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const maxWidth = 1200;
      const scale = Math.min(1, maxWidth / pixelCrop.width);
      canvas.width = pixelCrop.width * scale;
      canvas.height = pixelCrop.height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("No 2d context"));
        return;
      }
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        canvas.width,
        canvas.height
      );
      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    image.onerror = reject;
    image.crossOrigin = "anonymous";
    image.src = imageSrc;
  });
}

const ImageCropModal = ({
  open,
  onOpenChange,
  imageSrc,
  aspect = 16 / 9,
  onCropComplete,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleCropComplete = useCallback((_,  croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    try {
      const croppedDataUrl = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedDataUrl);
      // Reset state for next use
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } catch {
      // Silently fail — image might be cross-origin
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Recadrer l'image</DialogTitle>
        </DialogHeader>

        <div className="relative w-full h-[50vh] sm:h-[60vh] bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            objectFit="contain"
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground w-12 shrink-0">Zoom</span>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.01}
              onValueChange={([val]) => setZoom(val)}
              className="flex-1"
            />
          </div>
        </div>

        <DialogFooter className="px-6 pb-6">
          <Button variant="outline" onClick={handleCancel}>
            Annuler
          </Button>
          <Button onClick={handleConfirm}>
            Valider
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropModal;
