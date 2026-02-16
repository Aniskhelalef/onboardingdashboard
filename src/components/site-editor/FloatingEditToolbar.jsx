import { useState, useEffect, useRef } from "react";
import { Bold, Italic, Link2, Smile, ChevronLeft, Plus, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Common emojis for icon selection
const ICON_CATEGORIES = {
  "Santé": ["🏥", "💊", "🩺", "🩹", "💉", "🦴", "🧠", "❤️", "💪", "🧘", "🏃", "🤸"],
  "Nature": ["🌿", "🌱", "🍃", "🌸", "🌺", "🌻", "🌳", "☀️", "🌙", "⭐", "✨", "💧"],
  "Objets": ["🏆", "⏱️", "📍", "🎯", "🔧", "⚙️", "🛠️", "📋", "📝", "💼", "🎁", "🔑"],
  "Symboles": ["✅", "❤️", "💙", "💚", "🤝", "👋", "👍", "🙌", "💯", "🔥", "⚡", "🌟"],
};

const FloatingEditToolbar = ({
  targetElementId,
  hasIcon = false,
  isImage = false,
  currentIcon = "",
  onIconChange,
  onImageChange,
  onImageCrop,
  onBold,
  onItalic,
  onLink,
  onAdd,
  onDelete,
  onValidate,
}) => {
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const toolbarRef = useRef(null);

  // Position toolbar - centered above the target element
  useEffect(() => {
    if (!targetElementId) return;

    const updatePosition = () => {
      const targetEl = document.querySelector(`[data-proofread-id="${targetElementId}"]`);
      if (!targetEl) return;

      const rect = targetEl.getBoundingClientRect();
      const toolbarWidth = showIconPicker ? Math.min(280, window.innerWidth - 16) : (toolbarRef.current?.offsetWidth || 200);

      // Center horizontally relative to the element
      let left = rect.left + (rect.width / 2) - (toolbarWidth / 2);
      // For images: center vertically on the element; for text: position above
      const toolbarHeight = toolbarRef.current?.offsetHeight || 40;
      let top = isImage
        ? rect.top + (rect.height / 2) - (toolbarHeight / 2)
        : rect.top - (showIconPicker ? 220 : 56);

      const padding = 8;
      // Keep within viewport horizontally
      if (left < padding) left = padding;
      if (left + toolbarWidth > window.innerWidth - padding) {
        left = window.innerWidth - toolbarWidth - padding;
      }
      // If no room above, position below
      if (top < padding) {
        top = rect.bottom + 8;
      }

      setPosition({ top, left });
    };

    updatePosition();

    const handleUpdate = () => requestAnimationFrame(updatePosition);
    window.addEventListener("scroll", handleUpdate, true);
    window.addEventListener("resize", handleUpdate);

    return () => {
      window.removeEventListener("scroll", handleUpdate, true);
      window.removeEventListener("resize", handleUpdate);
    };
  }, [targetElementId, showIconPicker, isImage]);

  if (!targetElementId) return null;

  // Floating toolbar (same design for mobile and desktop)
  if (showIconPicker) {
    return (
      <div
        ref={toolbarRef}
        className="fixed z-[200] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden max-w-[calc(100vw-16px)]"
        style={{ top: position.top, left: position.left }}
        data-floating-toolbar
        onMouseDown={(e) => e.preventDefault()}
      >
        <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2">
          <button
            onClick={() => setShowIconPicker(false)}
            className="p-1 rounded hover:bg-gray-100 text-gray-500"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-gray-700">Choisir une icône</span>
        </div>
        <div className="p-2 max-h-48 overflow-y-auto max-w-[90vw]">
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-1">
            {Object.values(ICON_CATEGORIES).flat().map((emoji, idx) => (
              <button
                key={`${emoji}-${idx}`}
                onClick={() => {
                  onIconChange?.(emoji);
                  setShowIconPicker(false);
                }}
                className={cn(
                  "w-8 h-8 flex items-center justify-center text-lg rounded hover:bg-gray-100 transition-colors",
                  currentIcon === emoji && "bg-primary/20"
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Determine formatting level from element ID
  const hasFormatting = !!(onBold || onItalic || onLink) && (() => {
    if (!targetElementId) return false;
    if (targetElementId.startsWith("faq-")) return true;
    if (targetElementId.startsWith("feature-")) return true;
    if (targetElementId.startsWith("step-")) return true;
    if (targetElementId.startsWith("about-paragraph")) return true;
    if (targetElementId.startsWith("session-")) return true;
    return false;
  })();
  const isFaqElement = targetElementId?.startsWith("faq-");
  const hasActions = !!(onAdd || onDelete);

  // Nothing to show — hide toolbar for plain headlines (unless validate is available)
  if (!hasIcon && !hasFormatting && !hasActions && !onValidate) return null;

  return (
    <div
      ref={toolbarRef}
      className="fixed z-[200] flex items-center gap-1 px-2 py-1.5 bg-white rounded-full shadow-lg border border-gray-200"
      style={{ top: position.top, left: position.left }}
      data-floating-toolbar
      onMouseDown={(e) => e.preventDefault()}
    >
      {hasIcon && (
        <button
          onClick={() => setShowIconPicker(true)}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          title="Changer l'icône"
        >
          {currentIcon ? (
            <span className="text-lg">{currentIcon}</span>
          ) : (
            <Smile className="w-4 h-4 text-gray-500" />
          )}
        </button>
      )}

      {hasIcon && (hasFormatting || hasActions) && <div className="w-px h-5 bg-gray-200" />}

      {hasFormatting && (
        <>
          <button
            onClick={onBold}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            title="Gras"
          >
            <Bold className="w-4 h-4 text-gray-600" />
          </button>

          <button
            onClick={onItalic}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            title="Italique"
          >
            <Italic className="w-4 h-4 text-gray-600" />
          </button>

          {isFaqElement && (
            <button
              onClick={onLink}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              title="Lien"
            >
              <Link2 className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </>
      )}

      {hasFormatting && hasActions && <div className="w-px h-5 bg-gray-200" />}

      {onAdd && (
        <button
          onClick={onAdd}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          title="Ajouter"
        >
          <Plus className="w-4 h-4 text-gray-600" />
        </button>
      )}

      {onDelete && (
        <button
          onClick={onDelete}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors"
          title="Supprimer"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      )}

      {onValidate && (
        <>
          <div className="w-px h-5 bg-gray-200" />
          <button
            onClick={onValidate}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-colors"
            title="Valider"
          >
            <Check className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
};

export default FloatingEditToolbar;
