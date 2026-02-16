import { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Move, RotateCcw } from "lucide-react";

const ImagePositionModal = ({
  open,
  onOpenChange,
  imageSrc,
  initialPosition = { x: 50, y: 50 },
  onPositionComplete,
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, posX: 50, posY: 50 });
  const containerRef = useRef(null);
  const hasMoved = useRef(false);

  useEffect(() => {
    if (open) {
      setPosition(initialPosition);
      hasMoved.current = false;
    }
  }, [open, initialPosition]);

  const startDrag = useCallback((clientX, clientY) => {
    setIsDragging(true);
    dragStart.current = { x: clientX, y: clientY, posX: position.x, posY: position.y };
  }, [position]);

  const moveDrag = useCallback((clientX, clientY) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = clientX - dragStart.current.x;
    const dy = clientY - dragStart.current.y;
    const pctX = (dx / rect.width) * 100 * 1.5;
    const pctY = (dy / rect.height) * 100 * 1.5;
    hasMoved.current = true;
    setPosition({
      x: Math.max(0, Math.min(100, dragStart.current.posX + pctX)),
      y: Math.max(0, Math.min(100, dragStart.current.posY + pctY)),
    });
  }, [isDragging]);

  const endDrag = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Mouse events
  const onMouseDown = (e) => startDrag(e.clientX, e.clientY);
  const onMouseMove = (e) => moveDrag(e.clientX, e.clientY);

  // Touch events
  const onTouchStart = (e) => {
    const t = e.touches[0];
    startDrag(t.clientX, t.clientY);
  };
  const onTouchMove = (e) => {
    const t = e.touches[0];
    moveDrag(t.clientX, t.clientY);
  };

  const handleReset = () => {
    setPosition({ x: 50, y: 50 });
    hasMoved.current = true;
  };

  // Save on close
  const handleClose = (nextOpen) => {
    if (!nextOpen && hasMoved.current) {
      onPositionComplete(position);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden bg-black/95 border-0">
        {/* Hint bar */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 text-white/60">
            <Move className="w-4 h-4" />
            <span className="text-sm">Glissez pour repositionner</span>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors text-xs"
          >
            <RotateCcw className="w-3 h-3" />
            Centrer
          </button>
        </div>

        {/* Drag area */}
        <div
          ref={containerRef}
          className="relative w-full aspect-[4/3] overflow-hidden select-none"
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={endDrag}
        >
          <img
            src={imageSrc}
            alt="Repositionnement"
            className="w-full h-full object-cover pointer-events-none"
            style={{
              objectPosition: `${position.x}% ${position.y}%`,
              userSelect: "none",
            }}
            draggable={false}
          />

          {/* Subtle center indicator — only when dragging */}
          {isDragging && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-white/15" />
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/15" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePositionModal;
