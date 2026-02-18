import { useState, useRef, useEffect } from "react";
import { Home, FileCheck, FileText, Monitor, Smartphone, Paintbrush, Settings, ChevronDown, Lock, Undo2, Redo2 } from "lucide-react";
import { cn } from "@/lib/utils";

const EditorToolbar = ({
  currentPage,
  onPageChange,
  isHomePublished,
  specialties,
  viewMode,
  onViewModeChange,
  onStyleClick,
  onSettingsClick,
  isMobileDevice = false,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onAccueilClick,
  onPreviewClick,
  onPublishClick,
}) => {
  const [pagesOpen, setPagesOpen] = useState(false);
  const popoverRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!pagesOpen) return;
    const handler = (e) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
        setPagesOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [pagesOpen]);

  const specialtyLocked = !isHomePublished;

  const getCurrentPageIcon = () => {
    if (currentPage === "accueil") return <Home className="w-4 h-4" />;
    if (currentPage === "blog") return <FileText className="w-4 h-4" />;
    if (currentPage === "mentions") return <FileCheck className="w-4 h-4" />;
    const spec = specialties.find(s => currentPage === `specialite-${s.id}`);
    if (spec) return <span className="text-sm leading-none">{spec.icon}</span>;
    return <Home className="w-4 h-4" />;
  };

  const getCurrentPageLabel = () => {
    if (currentPage === "accueil") return "Accueil";
    if (currentPage === "blog") return "Blog";
    if (currentPage === "mentions") return "Mentions";
    const spec = specialties.find(s => currentPage === `specialite-${s.id}`);
    if (spec) return spec.title;
    return "Pages";
  };

  const BTN = "w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer";

  return (
    <>
      <div className={cn("fixed left-0 right-0 z-[60] px-4 pointer-events-none", isMobileDevice ? "bottom-4" : "bottom-6")}>
        <div className="flex items-end justify-center max-w-screen-xl mx-auto">
          <div className="pointer-events-auto relative flex items-center">

            {/* Pages popover */}
            {pagesOpen && (
              <div
                ref={popoverRef}
                className="absolute bottom-full mb-2 left-0 bg-white rounded-2xl border-2 border-gray-200 p-1.5 min-w-[200px]"
                style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
              >
                <button
                  onClick={() => { onPageChange("accueil"); setPagesOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors",
                    currentPage === "accueil" ? "bg-gray-50 text-color-1 font-medium" : "text-gray-400 hover:bg-gray-50 hover:text-color-1"
                  )}
                >
                  <Home className="w-4 h-4" />
                  Accueil
                </button>

                {specialties.length > 0 && (
                  <>
                    <div className="px-3 py-1.5 text-[10px] font-medium text-gray-300 uppercase tracking-wider mt-1">
                      Spécialités
                    </div>
                    {specialties.map((spec) => (
                      <button
                        key={spec.id}
                        onClick={() => {
                          if (!specialtyLocked) {
                            onPageChange(`specialite-${spec.id}`);
                            setPagesOpen(false);
                          }
                        }}
                        disabled={specialtyLocked}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors",
                          specialtyLocked
                            ? "opacity-30 cursor-not-allowed"
                            : currentPage === `specialite-${spec.id}`
                            ? "bg-gray-50 text-color-1 font-medium"
                            : "text-gray-400 hover:bg-gray-50 hover:text-color-1"
                        )}
                      >
                        <span className="text-base leading-none">{spec.icon}</span>
                        <span className="truncate">{spec.title}</span>
                        {specialtyLocked && <Lock className="w-3 h-3 ml-auto text-gray-300" />}
                      </button>
                    ))}
                  </>
                )}

                <div className="h-px bg-gray-100 my-1" />

                <button
                  onClick={() => { onPageChange("blog"); setPagesOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors",
                    currentPage === "blog" ? "bg-gray-50 text-color-1 font-medium" : "text-gray-400 hover:bg-gray-50 hover:text-color-1"
                  )}
                >
                  <FileText className="w-4 h-4" />
                  Blog
                </button>

                <button
                  onClick={() => { onPageChange("mentions"); setPagesOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors",
                    currentPage === "mentions" ? "bg-gray-50 text-color-1 font-medium" : "text-gray-400 hover:bg-gray-50 hover:text-color-1"
                  )}
                >
                  <FileCheck className="w-4 h-4" />
                  Mentions légales
                </button>
              </div>
            )}

            {/* Unified toolbar */}
            <div className="flex items-center bg-white border-2 border-gray-200 rounded-2xl px-1.5 py-1.5 gap-0.5" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

              {/* Page selector */}
              <button
                ref={buttonRef}
                onClick={() => setPagesOpen(!pagesOpen)}
                className={cn(
                  "flex items-center gap-1.5 h-8 px-3 rounded-xl text-sm font-medium transition-colors cursor-pointer",
                  pagesOpen ? "bg-gray-100 text-color-1" : "text-gray-500 hover:bg-gray-50 hover:text-color-1"
                )}
              >
                {getCurrentPageIcon()}
                <span className="max-w-[80px] truncate">{getCurrentPageLabel()}</span>
                <ChevronDown className={cn("w-3 h-3 shrink-0 transition-transform text-gray-400", pagesOpen && "rotate-180")} />
              </button>

              <div className="w-px h-5 bg-gray-200 mx-1" />

              {/* Style */}
              <button
                onClick={onStyleClick}
                title="Style"
                className={cn(BTN, "text-gray-400 hover:bg-gray-50 hover:text-color-1")}
              >
                <Paintbrush className="w-4 h-4" />
              </button>

              {/* Settings */}
              <button
                onClick={onSettingsClick}
                title="Paramètres"
                className={cn(BTN, "text-gray-400 hover:bg-gray-50 hover:text-color-1")}
              >
                <Settings className="w-4 h-4" />
              </button>

              <div className="w-px h-5 bg-gray-200 mx-1" />

              {/* Undo */}
              <button
                onClick={onUndo}
                disabled={!canUndo}
                title="Annuler (⌘Z)"
                className={cn(BTN, !canUndo ? "opacity-20 cursor-not-allowed text-gray-400" : "text-gray-400 hover:bg-gray-50 hover:text-color-1")}
              >
                <Undo2 className="w-4 h-4" />
              </button>

              {/* Redo */}
              <button
                onClick={onRedo}
                disabled={!canRedo}
                title="Rétablir (⌘⇧Z)"
                className={cn(BTN, !canRedo ? "opacity-20 cursor-not-allowed text-gray-400" : "text-gray-400 hover:bg-gray-50 hover:text-color-1")}
              >
                <Redo2 className="w-4 h-4" />
              </button>

              {/* Desktop/Mobile toggle */}
              {!isMobileDevice && (
                <>
                  <div className="w-px h-5 bg-gray-200 mx-1" />
                  <button
                    onClick={() => onViewModeChange("desktop")}
                    className={cn(BTN, viewMode === "desktop" ? "bg-color-1 text-white" : "text-gray-400 hover:bg-gray-50 hover:text-color-1")}
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onViewModeChange("mobile")}
                    className={cn(BTN, viewMode === "mobile" ? "bg-color-1 text-white" : "text-gray-400 hover:bg-gray-50 hover:text-color-1")}
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default EditorToolbar;
