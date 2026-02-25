'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2, RefreshCw, Star, AlertCircle, CheckCircle2, Link2, X, User, Search, MapPin, MessageCircle, Phone, Mail, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * GoogleReviewsSection — Dashboard widget for managing Google Reviews.
 *
 * States:
 *   1. No source → autocomplete search by business name (or paste URL)
 *   1b. Search result found → confirm business card
 *   2. Scraping in progress → spinner + polling
 *   3. Completed → review preview grid + refresh button
 *   4. Failed → error message + retry
 */
export default function GoogleReviewsSection({ therapistId, compact = false, onEditTemplates }) {
  const [source, setSource] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState(null);
  const [showUrlMode, setShowUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef(null);
  const lastQueriedRef = useRef("");
  const pollRef = useRef(null);
  const dropdownRef = useRef(null);

  const headers = { "x-therapist-id": therapistId };

  // ── Fetch current state ──────────────────────────────────
  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch("/api/therapist/reviews", { headers });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSource(data.source);
      setReviews(data.reviews || []);
    } catch {
      // silent — will show empty state
    } finally {
      setLoading(false);
    }
  }, [therapistId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // ── Polling while scraping ───────────────────────────────
  const isScraping = source?.status === "pending" || source?.status === "scraping";

  useEffect(() => {
    if (!isScraping) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    pollRef.current = setInterval(fetchReviews, 5000);
    return () => clearInterval(pollRef.current);
  }, [isScraping, fetchReviews]);

  // ── Debounced autocomplete (500ms delay, min 5 chars to save cost) ──
  const fetchPredictions = useCallback(async (value) => {
    if (!value || value.trim().length < 5) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }
    try {
      const res = await fetch("/api/places/autocomplete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: value.trim() }),
      });
      const data = await res.json();
      setPredictions(data.predictions || []);
      setShowDropdown((data.predictions || []).length > 0);
    } catch {
      setPredictions([]);
      setShowDropdown(false);
    }
  }, []);

  const handleInputChange = (value) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = value.trim();
    if (trimmed.length < 5) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }
    // Only fire if input changed by 3+ chars since last query (protects slow typists)
    if (Math.abs(trimmed.length - lastQueriedRef.current.length) < 3 && lastQueriedRef.current) return;
    debounceRef.current = setTimeout(() => {
      lastQueriedRef.current = trimmed;
      fetchPredictions(value);
    }, 500);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Confirm & connect ──────────────────────────────────
  const handleConfirmPlace = async () => {
    if (!selectedPlace) return;
    setConnecting(true);
    setConnectError(null);

    try {
      const googleMapsUrl = `https://www.google.com/maps/place/?q=place_id:${selectedPlace.placeId}`;
      const res = await fetch("/api/therapist/reviews/connect", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          googleMapsUrl,
          placeId: selectedPlace.placeId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setConnectError(data.error || "Erreur inconnue.");
        return;
      }
      setSource({ googleMapsUrl, status: "scraping", canRefresh: false });
      setSelectedPlace(null);
    } catch {
      setConnectError("Impossible de contacter le serveur.");
    } finally {
      setConnecting(false);
    }
  };

  // ── Direct URL connect handler ─────────────────────────
  const handleUrlConnect = async () => {
    if (!urlInput.trim()) return;
    setConnecting(true);
    setConnectError(null);
    try {
      const res = await fetch("/api/therapist/reviews/connect", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ googleMapsUrl: urlInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setConnectError(data.error || "Erreur inconnue.");
        return;
      }
      setSource({ googleMapsUrl: urlInput.trim(), status: "scraping", canRefresh: false });
    } catch {
      setConnectError("Impossible de contacter le serveur.");
    } finally {
      setConnecting(false);
    }
  };

  // ── Refresh handler ──────────────────────────────────────
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/therapist/reviews/refresh", {
        method: "POST",
        headers,
      });
      if (res.ok) {
        setSource((s) => ({ ...s, status: "scraping", canRefresh: false }));
      }
    } catch {
      // silent
    } finally {
      setRefreshing(false);
    }
  };

  // ── Disconnect (reset) ───────────────────────────────────
  const handleDisconnect = () => {
    setSource(null);
    setReviews([]);
    setSelectedPlace(null);
    setSearchInput("");
    setPredictions([]);
    setShowDropdown(false);
    lastQueriedRef.current = "";
    setUrlInput("");
    setShowUrlMode(false);
    setConnectError(null);
  };

  // ── Loading skeleton ─────────────────────────────────────
  if (loading) {
    return (
      <div className="rounded-2xl p-4 bg-white border border-gray-200 flex items-center justify-center min-h-[120px]">
        <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
      </div>
    );
  }

  // ── STATE 1: No source connected ─────────────────────────
  if (!source) {
    return (
      <div className="rounded-2xl bg-white border border-gray-200 relative overflow-visible flex flex-col" style={{ animation: "tab-fade-in 0.3s ease" }}>
        <div className={compact ? "p-3.5" : "p-4"}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
              <Star className="w-3.5 h-3.5 text-amber-500" fill="#F59E0B" />
            </div>
            <span className="text-xs font-bold text-color-1">Avis Google</span>
          </div>
          <p className="text-[11px] text-gray-400 mb-3">
            Importez vos avis 5 étoiles pour les afficher sur votre site.
          </p>

          {/* ── Confirm card ── */}
          {selectedPlace && !showUrlMode && (
            <div className="space-y-2">
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-color-1 truncate">{selectedPlace.name}</p>
                    {selectedPlace.address && (
                      <p className="text-[10px] text-gray-400 truncate">{selectedPlace.address}</p>
                    )}
                  </div>
                </div>
              </div>
              {connectError && (
                <p className="text-[11px] text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {connectError}
                </p>
              )}
              <button
                onClick={handleConfirmPlace}
                disabled={connecting}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold bg-[#FC6D41] text-white hover:bg-[#e55e35] transition-colors cursor-pointer py-2"
              >
                {connecting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {connecting ? "Importation..." : "Importer mes avis"}
              </button>
              <button
                onClick={() => { setSelectedPlace(null); setConnectError(null); }}
                className="w-full text-center text-[11px] text-gray-400 hover:text-gray-500 cursor-pointer py-0.5"
              >
                Ce n'est pas mon cabinet
              </button>
            </div>
          )}

          {/* ── Autocomplete search ── */}
          {!selectedPlace && !showUrlMode && (
            <div className="space-y-2">
              <div className="relative" ref={dropdownRef}>
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                  <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onFocus={() => predictions.length > 0 && setShowDropdown(true)}
                    placeholder="Nom de votre cabinet + ville"
                    className="h-7 w-full text-xs border-0 bg-transparent outline-none placeholder:text-gray-400"
                  />
                </div>

                {/* ── Live dropdown ── */}
                {showDropdown && predictions.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    {predictions.map((place, i) => (
                      <button
                        key={place.placeId || i}
                        onClick={() => {
                          setSelectedPlace(place);
                          setShowDropdown(false);
                          setPredictions([]);
                          setSearchInput("");
                        }}
                        className="w-full text-left px-3 py-2.5 hover:bg-amber-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-color-1 truncate">{place.name}</p>
                            {place.address && (
                              <p className="text-[10px] text-gray-400 truncate">{place.address}</p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowUrlMode(true)}
                className="w-full text-center text-[11px] text-gray-400 hover:text-gray-500 cursor-pointer py-0.5"
              >
                Entrer un lien Google Maps
              </button>
            </div>
          )}

          {/* ── Advanced: direct URL input ── */}
          {showUrlMode && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                <Link2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <Input
                  value={urlInput}
                  onChange={(e) => { setUrlInput(e.target.value); setConnectError(null); }}
                  placeholder="https://maps.google.com/... ou ChIJ..."
                  className="h-7 text-xs border-0 bg-transparent shadow-none px-0 focus-visible:ring-0"
                  onKeyDown={(e) => e.key === "Enter" && handleUrlConnect()}
                />
              </div>
              {connectError && (
                <p className="text-[11px] text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {connectError}
                </p>
              )}
              <button
                onClick={handleUrlConnect}
                disabled={!urlInput.trim() || connecting}
                className={cn(
                  "w-full flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer py-2",
                  urlInput.trim() && !connecting
                    ? "bg-[#FC6D41] text-white hover:bg-[#e55e35]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
              >
                {connecting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {connecting ? "Connexion..." : "Connecter"}
              </button>
              <button
                onClick={() => { setShowUrlMode(false); setConnectError(null); }}
                className="w-full text-center text-[11px] text-gray-400 hover:text-gray-500 cursor-pointer py-0.5"
              >
                Rechercher par nom
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── STATE 2: Scraping in progress ────────────────────────
  if (isScraping) {
    return (
      <div className="rounded-2xl bg-white border border-gray-200 relative overflow-hidden flex flex-col" style={{ animation: "tab-fade-in 0.3s ease" }}>
        <div className={compact ? "p-3.5" : "p-4"}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
            </div>
            <span className="text-xs font-bold text-color-1">Importation en cours</span>
          </div>
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl px-3 py-3">
            <div className="flex items-start gap-2">
              <div className="mt-0.5">
                <div className="w-4 h-4 rounded-full border-2 border-blue-300 border-t-blue-500 animate-spin" />
              </div>
              <div>
                <p className="text-xs font-medium text-blue-700">Recherche de vos avis...</p>
                <p className="text-[11px] text-blue-500 mt-0.5">
                  Cela prend généralement moins de 60 secondes.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-400 rounded-full animate-pulse" style={{ width: "60%" }} />
          </div>
        </div>
      </div>
    );
  }

  // ── STATE 4: Failed ──────────────────────────────────────
  if (source.status === "failed") {
    const friendlyErrors = {
      "Source introuvable.": "Impossible de trouver cette fiche Google.",
      "No reviews found": "Aucun avis trouvé pour cet établissement.",
    };
    const errorMsg = friendlyErrors[source.errorMessage] || source.errorMessage || "Une erreur est survenue.";

    return (
      <div className="rounded-2xl bg-white border border-gray-200 relative overflow-hidden flex flex-col" style={{ animation: "tab-fade-in 0.3s ease" }}>
        <div className={compact ? "p-3.5" : "p-4"}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
              <AlertCircle className="w-3.5 h-3.5 text-red-500" />
            </div>
            <span className="text-xs font-bold text-color-1">Erreur d'importation</span>
          </div>
          <div className="bg-red-50/50 border border-red-100 rounded-xl px-3 py-3 mb-3">
            <p className="text-xs text-red-600">{errorMsg}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold bg-[#FC6D41] text-white hover:bg-[#e55e35] transition-colors cursor-pointer py-2"
            >
              {refreshing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Réessayer
            </button>
            <button
              onClick={handleDisconnect}
              className="flex items-center justify-center gap-1 rounded-xl text-xs font-medium bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer px-3 py-2"
            >
              Nouvelle recherche
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── STATE 3: Completed — reviews loaded ──────────────────
  const lastScraped = source.lastScrapedAt
    ? new Date(source.lastScrapedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : null;
  const nextRefreshDays = source.nextRefreshAvailableAt
    ? Math.max(0, Math.ceil((new Date(source.nextRefreshAvailableAt) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="rounded-2xl bg-white border border-gray-200 relative overflow-hidden flex flex-col" style={{ animation: "tab-fade-in 0.3s ease" }}>
      <div className={compact ? "p-3.5" : "p-4"}>
        {/* Header: big number + rating badge */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-color-1 leading-none">{source.googleTotalReviews || source.totalReviewsFound || reviews.length}</span>
              <span className="text-xs font-bold text-gray-400">avis Google</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Mis à jour le {lastScraped}</p>
          </div>
          <div className="flex items-center gap-1 bg-amber-50 rounded-lg px-2.5 py-1.5">
            <Star className="w-3.5 h-3.5 text-amber-500" fill="#F59E0B" />
            <span className="text-sm font-bold text-amber-600">{source.googleRating || "5.0"}</span>
          </div>
        </div>

        {/* Channel shortcuts */}
        <div className="flex gap-1.5 mt-3">
          {[
            { icon: MessageCircle, label: "WhatsApp", color: "bg-green-500", hoverColor: "hover:bg-green-600", key: "whatsapp" },
            { icon: Phone, label: "SMS", color: "bg-blue-500", hoverColor: "hover:bg-blue-600", key: "sms" },
            { icon: Mail, label: "Email", color: "bg-purple-500", hoverColor: "hover:bg-purple-600", key: "email" },
          ].map(ch => {
            const Icon = ch.icon;
            return (
              <button
                key={ch.key}
                onClick={() => {
                  const saved = JSON.parse(localStorage.getItem("setupData") || "{}");
                  const templates = saved.reviewTemplates || {};
                  const msg = (templates[ch.key]?.message || "").replace(/\{link\}/g, templates.googleLink || "");
                  const subj = (templates[ch.key]?.subject || "").replace(/\{link\}/g, templates.googleLink || "");
                  const urls = { whatsapp: (m) => `https://wa.me/?text=${encodeURIComponent(m)}`, sms: (m) => `sms:?body=${encodeURIComponent(m)}`, email: (m, s) => `mailto:?subject=${encodeURIComponent(s)}&body=${encodeURIComponent(m)}` };
                  window.open(urls[ch.key](msg, subj), "_blank");
                }}
                className={cn("flex-1 flex items-center justify-center gap-1 rounded-xl text-[10px] font-semibold text-white transition-colors cursor-pointer py-1.5", ch.color, ch.hoverColor)}
              >
                <Icon className="w-3 h-3" />
                {ch.label}
              </button>
            );
          })}
          {onEditTemplates && (
            <button onClick={onEditTemplates} className="flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer px-2.5 py-1.5" title="Modifier les messages">
              <Pencil className="w-3 h-3 text-gray-500" />
            </button>
          )}
        </div>

        {/* Refresh countdown */}
        <button
          onClick={handleRefresh}
          disabled={!source.canRefresh || refreshing}
          className={cn(
            "w-full flex items-center justify-center gap-1.5 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer py-2 mt-2",
            source.canRefresh && !refreshing
              ? "bg-[#FC6D41] text-white hover:bg-[#e55e35]"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}
          title={!source.canRefresh ? `Disponible dans ${nextRefreshDays} jour${nextRefreshDays > 1 ? 's' : ''}` : ""}
        >
          {refreshing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          {source.canRefresh
            ? "Mettre à jour mes avis"
            : `Mettre à jour mes avis dans ${nextRefreshDays} j`}
        </button>
      </div>
    </div>
  );
}
