'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import { Building2, Search, Loader2, Check, Star, MapPin } from "lucide-react";
import { useSetup } from "../SetupContext";
import { cn } from "@/lib/utils";

export default function GoogleStep() {
  const { state, dispatch, changedSections, handleValidateSection, isModal } = useSetup();
  const { google } = state.data;

  // Supabase source state (actual scraped reviews connection)
  const [liveSource, setLiveSource] = useState(null);
  const [liveLoading, setLiveLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  // Autocomplete search state
  const [searchInput, setSearchInput] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState(null);
  const debounceRef = useRef(null);
  const lastQueriedRef = useRef("");
  const dropdownRef = useRef(null);

  const headers = { "x-therapist-id": "demo-therapist" };

  // ── Fetch live source from Supabase ──────────────────────
  const fetchLiveSource = useCallback(async () => {
    try {
      const res = await fetch("/api/therapist/reviews", { headers });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLiveSource(data.source);
    } catch {
      setLiveSource(null);
    } finally {
      setLiveLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isModal) fetchLiveSource();
    else setLiveLoading(false);
  }, [isModal, fetchLiveSource]);

  // ── Poll while scraping ──────────────────────────────────
  const liveIsScraping = liveSource?.status === "pending" || liveSource?.status === "scraping";
  const pollRef2 = useRef(null);

  useEffect(() => {
    if (!liveIsScraping) {
      if (pollRef2.current) clearInterval(pollRef2.current);
      return;
    }
    pollRef2.current = setInterval(fetchLiveSource, 5000);
    return () => clearInterval(pollRef2.current);
  }, [liveIsScraping, fetchLiveSource]);

  // ── Autocomplete via /api/places/autocomplete ────────────
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
    setSelectedPlace(null);
    setConnectError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = value.trim();
    if (trimmed.length < 5) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }
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

  // ── Connect: save to localStorage + trigger Supabase scrape ──
  const handleConnectPlace = async () => {
    if (!selectedPlace) return;
    setConnecting(true);
    setConnectError(null);

    // Save to localStorage setup state
    dispatch({
      type: "SET_GOOGLE",
      payload: {
        connected: true,
        profile: {
          name: selectedPlace.name || "Votre Cabinet",
          rating: selectedPlace.rating || null,
          reviewCount: selectedPlace.reviewCount || 0,
          address: selectedPlace.address || "",
          placeId: selectedPlace.placeId || null,
        },
      },
    });
    handleValidateSection("google");

    // Also trigger Supabase scrape
    try {
      const googleMapsUrl = `https://www.google.com/maps/place/?q=place_id:${selectedPlace.placeId}`;
      const res = await fetch("/api/therapist/reviews/connect", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ googleMapsUrl, placeId: selectedPlace.placeId }),
      });
      if (res.ok) {
        setLiveSource({ status: "scraping", canRefresh: false });
        // Notify dashboard
        window.dispatchEvent(new Event("googleReviewsConnected"));
      }
    } catch {
      // localStorage already saved, scrape will just not happen
    } finally {
      setConnecting(false);
    }
  };

  // ── Disconnect ───────────────────────────────────────────
  const handleDisconnectLive = async () => {
    setDisconnecting(true);
    try {
      const res = await fetch("/api/therapist/reviews/disconnect", {
        method: "POST",
        headers,
      });
      if (res.ok) {
        setLiveSource(null);
        dispatch({ type: "SET_GOOGLE", payload: { connected: false, profile: null } });
        handleValidateSection("google");
        window.dispatchEvent(new Event("googleReviewsDisconnected"));
      }
    } catch {
      // silent
    } finally {
      setDisconnecting(false);
    }
  };

  // Determine connected state
  const isConnected = (google.connected && google.profile) || (liveSource && liveSource.status === "completed");
  const profileName = google.profile?.name || "Votre établissement";
  const profileAddress = google.profile?.address || "";
  const profileRating = google.profile?.rating;
  const profileReviewCount = google.profile?.reviewCount || liveSource?.totalReviewsFound || 0;

  return (
    <div className={isModal ? "space-y-2.5" : "space-y-4"} style={{ animation: "tab-fade-in 0.3s ease" }}>
      {!isModal && (
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-1">Google Business</h2>
          <p className="text-sm text-muted-foreground">{isConnected ? "Votre fiche Google est connectée." : "Recherchez votre établissement pour le connecter."}</p>
        </div>
      )}

      {liveLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
        </div>
      ) : isConnected ? (
        <div className="space-y-2">
          <div className={cn("flex items-center gap-3 bg-green-50/50 border border-green-200 rounded-xl", isModal ? "p-3" : "p-4")}>
            <div className={cn("rounded-lg bg-emerald-100 flex items-center justify-center shrink-0", isModal ? "w-8 h-8" : "w-10 h-10")}>
              <Building2 className={isModal ? "w-4 h-4 text-emerald-600" : "w-5 h-5 text-emerald-600"} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn("font-medium text-foreground truncate", isModal ? "text-xs" : "text-sm")}>{profileName}</p>
              {profileAddress && <p className={cn("text-muted-foreground truncate", isModal ? "text-[11px]" : "text-sm")}>{profileAddress}</p>}
              {profileRating && <p className="text-[11px] text-muted-foreground">{profileRating}/5 · {profileReviewCount} avis</p>}
            </div>
            <span className={cn("inline-flex items-center rounded-full bg-green-100 text-green-700 font-semibold shrink-0", isModal ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-sm")}>Connecté</span>
          </div>

          {/* Live source stats */}
          {liveSource && liveSource.status === "completed" && (
            <div className={cn("flex items-center gap-3 bg-amber-50/50 border border-amber-100 rounded-xl", isModal ? "p-2.5" : "p-3")}>
              <Star className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="#F59E0B" />
              <p className="text-[11px] text-amber-700 font-medium">
                {liveSource.googleTotalReviews || liveSource.totalReviewsFound} avis Google
                {liveSource.lastScrapedAt && (
                  <span className="text-amber-500 font-normal"> · Mis à jour le {new Date(liveSource.lastScrapedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</span>
                )}
              </p>
            </div>
          )}

          {liveSource && (liveSource.status === "pending" || liveSource.status === "scraping") && (
            <div className={cn("flex items-center gap-2.5 bg-blue-50/50 border border-blue-100 rounded-xl", isModal ? "p-2.5" : "p-3")}>
              <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin shrink-0" />
              <p className="text-[11px] text-blue-600 font-medium">Importation des avis en cours...</p>
            </div>
          )}

          <button
            onClick={async () => {
              if (liveSource) await handleDisconnectLive();
              else {
                dispatch({ type: "SET_GOOGLE", payload: { connected: false, profile: null } });
                handleValidateSection("google");
              }
            }}
            disabled={disconnecting}
            className={cn("w-full rounded-xl font-semibold transition-colors cursor-pointer border border-gray-200 text-gray-500 hover:bg-red-50 hover:border-red-200 hover:text-red-500", isModal ? "px-4 py-2 text-xs" : "px-6 py-2.5 text-sm")}
          >
            {disconnecting ? (
              <span className="flex items-center justify-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Déconnexion...
              </span>
            ) : (
              "Déconnecter cet établissement"
            )}
          </button>
        </div>
      ) : (
        <>
          {/* ── Confirm selected place ── */}
          {selectedPlace ? (
            <div className="space-y-2">
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-3">
                <div className="flex items-start gap-2.5">
                  <div className={cn("rounded-lg bg-amber-50 flex items-center justify-center shrink-0", isModal ? "w-8 h-8" : "w-9 h-9")}>
                    <MapPin className={cn("text-amber-500", isModal ? "w-3.5 h-3.5" : "w-4 h-4")} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn("font-semibold text-color-1 truncate", isModal ? "text-xs" : "text-sm")}>{selectedPlace.name}</p>
                    {selectedPlace.address && (
                      <p className={cn("text-gray-400 truncate", isModal ? "text-[10px]" : "text-xs")}>{selectedPlace.address}</p>
                    )}
                  </div>
                </div>
              </div>
              {connectError && (
                <p className="text-[11px] text-red-500 flex items-center gap-1">{connectError}</p>
              )}
              <button
                onClick={handleConnectPlace}
                disabled={connecting}
                className={cn("w-full flex items-center justify-center gap-1.5 rounded-xl font-semibold bg-[#FC6D41] text-white hover:bg-[#e55e35] transition-colors cursor-pointer", isModal ? "px-4 py-2 text-xs" : "px-6 py-2.5 text-sm")}
              >
                {connecting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {connecting ? "Importation..." : "Connecter cet établissement"}
              </button>
              <button
                onClick={() => { setSelectedPlace(null); setConnectError(null); }}
                className="w-full text-center text-[11px] text-gray-400 hover:text-gray-500 cursor-pointer py-0.5"
              >
                Ce n'est pas mon cabinet
              </button>
            </div>
          ) : (
            /* ── Autocomplete search ── */
            <div className={isModal ? "space-y-2" : "space-y-3"}>
              <div className="relative" ref={dropdownRef}>
                <div className={cn("flex items-center gap-2 bg-gray-50 rounded-xl px-3", isModal ? "py-1.5" : "py-2")}>
                  <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onFocus={() => predictions.length > 0 && setShowDropdown(true)}
                    placeholder="Nom de votre cabinet + ville"
                    className={cn("w-full border-0 bg-transparent outline-none placeholder:text-gray-400", isModal ? "h-7 text-xs" : "h-8 text-sm")}
                  />
                </div>

                {/* Live dropdown */}
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

              {searchInput.trim().length >= 5 && predictions.length === 0 && (
                <div className="p-2.5 bg-gray-50 rounded-xl">
                  <p className={cn("text-muted-foreground", isModal ? "text-xs" : "text-sm")}>Aucun établissement trouvé. Essayez avec un autre nom ou ajoutez la ville.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {!isModal && (
        <button onClick={() => handleValidateSection("google")} className={cn("px-5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer", changedSections.has("google") ? "bg-[#FC6D41] text-white hover:bg-[#e55e35]" : "bg-gray-100 text-gray-400")}>
          {state.validatedSection === "google" ? "Enregistré !" : "Enregistrer"}
        </button>
      )}
    </div>
  );
}
