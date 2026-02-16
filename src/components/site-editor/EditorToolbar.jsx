import { useState, useRef, useEffect } from "react";
import { Home, FileCheck, FileText, Monitor, Smartphone, Paintbrush, Settings, ChevronUp, Lock, Undo2, Redo2, ArrowLeft, Eye, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

const CIRCLE_BTN = "rounded-full bg-white flex items-center justify-center transition-all shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)]";
const CIRCLE_HOVER = "hover:shadow-[0_2px_6px_rgba(0,0,0,0.14)] active:scale-95";

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
    if (currentPage === "accueil") return <Home className="w-[18px] h-[18px]" />;
    if (currentPage === "blog") return <FileText className="w-[18px] h-[18px]" />;
    if (currentPage === "mentions") return <FileCheck className="w-[18px] h-[18px]" />;
    const spec = specialties.find(s => currentPage === `specialite-${s.id}`);
    if (spec) return <span className="text-sm leading-none">{spec.icon}</span>;
    return <Home className="w-[18px] h-[18px]" />;
  };

  const getCurrentPageLabel = () => {
    if (currentPage === "accueil") return "Accueil";
    if (currentPage === "blog") return "Blog";
    if (currentPage === "mentions") return "Mentions";
    const spec = specialties.find(s => currentPage === `specialite-${s.id}`);
    if (spec) return spec.title;
    return "Pages";
  };

  const iconCls = "w-[18px] h-[18px]";

  return (
    <>
      {/* ── BOTTOM-CENTER — Tools ── */}
      <div className={cn("fixed left-0 right-0 z-[60] px-4 pointer-events-none", isMobileDevice ? "bottom-4" : "bottom-6")}>
        <div className="flex items-end justify-center gap-2 max-w-screen-xl mx-auto">
          <div className="pointer-events-auto relative flex items-center gap-2">
            {/* Pages popover */}
            {pagesOpen && (
              <div
                ref={popoverRef}
                className="absolute bottom-full mb-2 left-0 bg-white rounded-2xl shadow-xl border border-gray-200/60 p-2 min-w-[200px]"
              >
                <button
                  onClick={() => { onPageChange("accueil"); setPagesOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors",
                    currentPage === "accueil" ? "bg-gray-100 text-foreground font-medium" : "text-muted-foreground hover:bg-gray-50 hover:text-foreground"
                  )}
                >
                  <Home className="w-4 h-4" />
                  Accueil
                </button>

                {specialties.length > 0 && (
                  <>
                    <div className="px-3 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-1">
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
                          "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors",
                          specialtyLocked
                            ? "opacity-40 cursor-not-allowed"
                            : currentPage === `specialite-${spec.id}`
                            ? "bg-gray-100 text-foreground font-medium"
                            : "text-muted-foreground hover:bg-gray-50 hover:text-foreground"
                        )}
                      >
                        <span className="text-base leading-none">{spec.icon}</span>
                        <span className="truncate">{spec.title}</span>
                        {specialtyLocked && <Lock className="w-3 h-3 ml-auto text-muted-foreground/50" />}
                      </button>
                    ))}
                  </>
                )}

                <div className="h-px bg-gray-100 my-1" />

                <button
                  onClick={() => { onPageChange("blog"); setPagesOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors",
                    currentPage === "blog" ? "bg-gray-100 text-foreground font-medium" : "text-muted-foreground hover:bg-gray-50 hover:text-foreground"
                  )}
                >
                  <FileText className="w-4 h-4" />
                  Blog
                </button>

                <button
                  onClick={() => { onPageChange("mentions"); setPagesOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors",
                    currentPage === "mentions" ? "bg-gray-100 text-foreground font-medium" : "text-muted-foreground hover:bg-gray-50 hover:text-foreground"
                  )}
                >
                  <FileCheck className="w-4 h-4" />
                  Mentions légales
                </button>
              </div>
            )}

            {/* Tools pill */}
            <div className="flex items-center gap-1.5 rounded-full bg-[#e8e8e8] px-2.5 py-2 shadow-lg">
              {/* Pages */}
              <button
                ref={buttonRef}
                onClick={() => setPagesOpen(!pagesOpen)}
                className={cn(
                  CIRCLE_BTN,
                  "h-10 px-3 gap-2",
                  CIRCLE_HOVER,
                  "text-gray-700",
                  pagesOpen && "ring-2 ring-gray-400/30"
                )}
              >
                {getCurrentPageIcon()}
                <span className="text-xs font-medium max-w-[80px] truncate">{getCurrentPageLabel()}</span>
                <ChevronUp className={cn("w-3 h-3 shrink-0 transition-transform", !pagesOpen && "rotate-180")} />
              </button>

              {/* Style */}
              <button
                onClick={onStyleClick}
                title="Style"
                className={cn(
                  CIRCLE_BTN,
                  "w-10 h-10",
                  CIRCLE_HOVER,
                  "text-gray-700"
                )}
              >
                <Paintbrush className={iconCls} />
              </button>

              {/* Settings */}
              <button
                onClick={onSettingsClick}
                title="Paramètres"
                className={cn(
                  CIRCLE_BTN,
                  "w-10 h-10",
                  CIRCLE_HOVER,
                  "text-gray-700"
                )}
              >
                <Settings className={iconCls} />
              </button>

              {/* Undo */}
              <button
                onClick={onUndo}
                disabled={!canUndo}
                title="Annuler (⌘Z)"
                className={cn(
                  CIRCLE_BTN,
                  "w-10 h-10",
                  !canUndo ? "opacity-30 cursor-not-allowed" : cn(CIRCLE_HOVER, "text-gray-700")
                )}
              >
                <Undo2 className={iconCls} />
              </button>

              {/* Redo */}
              <button
                onClick={onRedo}
                disabled={!canRedo}
                title="Rétablir (⌘⇧Z)"
                className={cn(
                  CIRCLE_BTN,
                  "w-10 h-10",
                  !canRedo ? "opacity-30 cursor-not-allowed" : cn(CIRCLE_HOVER, "text-gray-700")
                )}
              >
                <Redo2 className={iconCls} />
              </button>
            </div>

            {/* Desktop/Mobile toggle */}
            {!isMobileDevice && (
              <div className="flex items-center gap-1.5 bg-[#e8e8e8] rounded-full px-2.5 py-2 shadow-lg">
                <button
                  onClick={() => onViewModeChange("desktop")}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    viewMode === "desktop"
                      ? "bg-white text-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)]"
                      : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  <Monitor className="w-[18px] h-[18px]" />
                </button>
                <button
                  onClick={() => onViewModeChange("mobile")}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    viewMode === "mobile"
                      ? "bg-white text-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)]"
                      : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  <Smartphone className="w-[18px] h-[18px]" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default EditorToolbar;
