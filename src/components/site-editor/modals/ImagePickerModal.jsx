import { useState, useCallback, useRef, useEffect } from "react";
import { Search, Upload, Loader2, ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * ImagePickerModal — Browse Pexels or upload your own image.
 *
 * Props:
 *   open, onOpenChange, onImageSelect(dataUrlOrUrl)
 */
export default function ImagePickerModal({ open, onOpenChange, onImageSelect }) {
  const [tab, setTab] = useState("pexels"); // "pexels" | "upload"
  const [query, setQuery] = useState("");
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const debounceRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Suggested queries — therapy & health professions
  const suggestions = [
    "ostéopathie", "kinésithérapie", "massage", "chiropracteur", "podologue",
    "psychologue", "sophrologie", "hypnothérapie", "acupuncture", "naturopathie",
    "diététicien", "orthophoniste", "sage-femme", "ergothérapie", "réflexologie",
    "yoga", "méditation", "bien-être", "cabinet médical", "thérapie",
    "physiothérapie", "rééducation", "shiatsu", "auriculothérapie", "aromathérapie",
    "étiopathe", "posturologie", "dentiste", "dermatologue", "pédiatre",
  ];

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      setPhotos([]);
      setQuery("");
      setPage(1);
      setHasMore(false);
    }
  }, [open]);

  const searchPexels = useCallback(async (q, pageNum = 1, append = false) => {
    if (!q || q.trim().length < 2) return;
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await fetch(`/api/pexels/search?query=${encodeURIComponent(q.trim())}&page=${pageNum}&per_page=80`);
      const data = await res.json();
      const newPhotos = data.photos || [];
      setPhotos((prev) => append ? [...prev, ...newPhotos] : newPhotos);
      setHasMore(newPhotos.length === 80 && (data.total_results || 0) > pageNum * 80);
      setPage(pageNum);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const handleSearchInput = (value) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setPhotos([]);
      setHasMore(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      searchPexels(value, 1);
    }, 500);
  };

  const handleSelectPhoto = (photo) => {
    onImageSelect(photo.src.large2x || photo.src.original);
    onOpenChange(false);
  };

  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    searchPexels(query, page + 1, true);
  };

  // File upload handler
  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      onImageSelect(e.target.result);
      onOpenChange(false);
    };
    reader.readAsDataURL(file);
  };

  // Drag & drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="px-5 pt-5 pb-0 shrink-0">
          <DialogTitle className="text-base">Choisir une image</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 px-5 pt-3 pb-0 shrink-0">
          <button
            onClick={() => setTab("pexels")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
              tab === "pexels"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            )}
          >
            <Search className="w-3.5 h-3.5" />
            Banque d'images
          </button>
          <button
            onClick={() => setTab("upload")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
              tab === "upload"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            )}
          >
            <Upload className="w-3.5 h-3.5" />
            Importer
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {tab === "pexels" ? (
            <div className="flex flex-col flex-1 min-h-0">
              {/* Search bar */}
              <div className="px-5 pt-3 pb-2 shrink-0">
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                  <Search className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    placeholder="Rechercher des photos..."
                    className="w-full text-sm border-0 bg-transparent outline-none placeholder:text-gray-400"
                    autoFocus
                  />
                  {loading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin shrink-0" />}
                </div>
              </div>

              {/* Suggestions when empty */}
              {photos.length === 0 && !loading && !query && (
                <div className="px-5 pb-3 shrink-0">
                  <p className="text-xs text-gray-500 mb-2.5">Parcourez des milliers de photos libres de droits via <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-700 hover:underline">Pexels</a></p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => { setQuery(s); searchPexels(s, 1); }}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-900 hover:text-white rounded-full text-xs font-medium text-gray-700 transition-colors cursor-pointer"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Photo grid */}
              <div className="flex-1 overflow-y-auto px-5 pb-4 min-h-0">
                {loading && photos.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
                  </div>
                ) : photos.length > 0 ? (
                  <>
                    <p className="text-[10px] text-gray-500 mb-2">Photos fournies par <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-700 hover:underline">Pexels</a></p>
                    <div className="grid grid-cols-8 gap-1">
                      {photos.map((photo) => (
                        <button
                          key={photo.id}
                          onClick={() => handleSelectPhoto(photo)}
                          className="group relative aspect-square rounded-md overflow-hidden cursor-pointer bg-gray-100"
                        >
                          <img
                            src={photo.src.medium}
                            alt={photo.alt}
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                            <div className="w-full bg-gradient-to-t from-black/60 to-transparent px-1.5 py-1">
                              <a href={photo.url || photo.photographerUrl || "#"} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-[7px] text-white/80 truncate hover:text-white block">{photo.photographer}</a>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    {hasMore && (
                      <div className="flex justify-center pt-3">
                        <button
                          onClick={handleLoadMore}
                          disabled={loadingMore}
                          className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-medium text-gray-600 transition-colors cursor-pointer"
                        >
                          {loadingMore ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                          {loadingMore ? "Chargement..." : "Voir plus"}
                        </button>
                      </div>
                    )}
                    <p className="text-[9px] text-gray-300 text-center mt-3">Photos fournies par <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-400">Pexels</a></p>
                  </>
                ) : query.trim().length >= 2 && !loading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <ImageIcon className="w-8 h-8 mb-2 text-gray-300" />
                    <p className="text-sm">Aucune photo trouvée</p>
                    <p className="text-xs mt-1">Essayez un autre terme de recherche</p>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            /* Upload tab */
            <div className="flex-1 flex flex-col items-center justify-center px-5 py-8">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "w-full max-w-sm border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer",
                  dragActive
                    ? "border-[#FC6D41] bg-orange-50/50"
                    : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                  dragActive ? "bg-[#FC6D41]/10" : "bg-gray-100"
                )}>
                  <Upload className={cn("w-5 h-5", dragActive ? "text-[#FC6D41]" : "text-gray-400")} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">
                    {dragActive ? "Déposez votre image ici" : "Glissez-déposez ou cliquez"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP</p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFile(e.target.files[0]);
                }}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
