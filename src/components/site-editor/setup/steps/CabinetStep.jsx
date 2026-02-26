'use client';

import { useState, useCallback, useRef, useEffect } from "react";
import { Plus, Trash2, Search, MapPin, Star, Loader2, Building2 } from "lucide-react";
import { useSetup } from "../SetupContext";
import { cn } from "@/lib/utils";

export default function CabinetStep() {
  const { state, dispatch, changedSections, handleValidateSection, isModal } = useSetup();
  const { locations, google } = state.data;

  // ── Google Reviews (live source) state ───────────────────
  const [liveSource, setLiveSource] = useState(null);
  const [liveLoading, setLiveLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  // ── Autocomplete state (shared for principal & secondaire) ──
  const [searchInput, setSearchInput] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState(null);
  const [searchTarget, setSearchTarget] = useState("principal"); // "principal" or "secondaire"
  const debounceRef = useRef(null);
  const lastQueriedRef = useRef("");
  const dropdownRef = useRef(null);

  const headers = { "x-therapist-id": "demo-therapist" };

  // ── Derived state ──────────────────────────────────────────
  const isConnected = (google.connected && google.profile) || (liveSource && liveSource.status === "completed");
  const principalPlaceId = google.profile?.placeId || liveSource?.googleMapsUrl?.match(/place_id:([^&]+)/)?.[1];
  const principalLoc = locations.find(l => l.placeId === principalPlaceId);
  const secondaireLoc = locations.find(l => l.placeId && l.placeId !== principalPlaceId);

  const profileName = google.profile?.name || liveSource?.placeName || "Votre établissement";
  const profileRating = google.profile?.rating || liveSource?.googleRating;
  const profileReviewCount = google.profile?.reviewCount || liveSource?.googleTotalReviews || liveSource?.totalReviewsFound || 0;

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
    fetchLiveSource();
  }, [fetchLiveSource]);

  // ── Sync connected Google place as first cabinet ────────
  useEffect(() => {
    if (!liveSource || liveSource.status !== "completed") return;
    const placeId = google.profile?.placeId;
    const placeName = liveSource.placeName || google.profile?.name;
    const pid = placeId || liveSource.googleMapsUrl?.match(/place_id:([^&]+)/)?.[1];
    if (!pid) return;
    if (locations.some(l => l.placeId === pid)) return;
    dispatch({
      type: "ADD_LOCATION",
      payload: { id: Date.now().toString(), title: placeName || "", address: google.profile?.address || "", placeId: pid },
    });
    handleValidateSection("locations");
  }, [liveSource]);

  // ── Poll while scraping ──────────────────────────────────
  const liveIsScraping = liveSource?.status === "pending" || liveSource?.status === "scraping";
  const pollRef = useRef(null);

  useEffect(() => {
    if (!liveIsScraping) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    pollRef.current = setInterval(fetchLiveSource, 5000);
    return () => clearInterval(pollRef.current);
  }, [liveIsScraping, fetchLiveSource]);

  // ── Autocomplete ───────────────────────────────────────────
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const resetSearch = () => {
    setSearchInput("");
    setPredictions([]);
    setShowDropdown(false);
    setSelectedPlace(null);
    setConnectError(null);
  };

  // ── Connect principal (Google Reviews) ─────────────────────
  const handleConnectPlace = async () => {
    if (!selectedPlace) return;
    setConnecting(true);
    setConnectError(null);

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

    if (!locations.some(l => l.placeId === selectedPlace.placeId)) {
      dispatch({
        type: "ADD_LOCATION",
        payload: { id: Date.now().toString(), title: selectedPlace.name || "", address: selectedPlace.address || "", placeId: selectedPlace.placeId || "" },
      });
      handleValidateSection("locations");
    }

    try {
      const googleMapsUrl = `https://www.google.com/maps/place/?q=place_id:${selectedPlace.placeId}`;
      const res = await fetch("/api/therapist/reviews/connect", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ googleMapsUrl, placeId: selectedPlace.placeId, placeName: selectedPlace.name }),
      });
      if (res.ok) {
        setLiveSource({ status: "scraping", canRefresh: false });
        window.dispatchEvent(new Event("googleReviewsConnected"));
      }
    } catch {
      // localStorage already saved
    } finally {
      setConnecting(false);
      resetSearch();
    }
  };

  // ── Disconnect principal ───────────────────────────────────
  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      const res = await fetch("/api/therapist/reviews/disconnect", { method: "POST", headers });
      if (res.ok) {
        if (principalPlaceId) {
          const matchingLoc = locations.find(l => l.placeId === principalPlaceId);
          if (matchingLoc) {
            dispatch({ type: "REMOVE_LOCATION", payload: matchingLoc.id });
            handleValidateSection("locations");
          }
        }
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

  // ── Add secondaire location ────────────────────────────────
  const handleSelectSecondaire = (place) => {
    const locId = Date.now().toString();
    dispatch({
      type: "ADD_LOCATION",
      payload: { id: locId, title: place.name, address: place.address, placeId: place.placeId },
    });
    resetSearch();
    setSearchTarget("principal");
    setTimeout(() => handleValidateSection("locations"), 0);
    fetch("/api/therapist/reviews/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-therapist-id": "demo-therapist" },
      body: JSON.stringify({ query: `${place.name} ${place.address}` }),
    })
      .then(r => r.json())
      .then(d => { if (d.place?.imageUrl) dispatch({ type: "UPDATE_LOCATION", payload: { id: locId, updates: { icon: d.place.imageUrl } } }); })
      .catch(() => {});
  };

  const removeSecondaire = () => {
    if (!secondaireLoc) return;
    dispatch({ type: "REMOVE_LOCATION", payload: secondaireLoc.id });
    setTimeout(() => handleValidateSection("locations"), 0);
  };

  // ── Helpers for inline rendering ────────────────────────────
  const handleSelectPrincipal = (place) => {
    setSelectedPlace(place);
    setShowDropdown(false);
    setPredictions([]);
    setSearchInput("");
  };

  const renderSearchAutocomplete = (placeholder, onSelect) => (
    <div className={isModal ? "space-y-1.5" : "space-y-2"}>
      <div className="relative" ref={dropdownRef}>
        <div className={cn("flex items-center gap-2 bg-gray-50 rounded-xl px-3", isModal ? "py-1.5" : "py-2")}>
          <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => predictions.length > 0 && setShowDropdown(true)}
            placeholder={placeholder}
            className={cn("w-full border-0 bg-transparent outline-none placeholder:text-gray-400", isModal ? "h-7 text-xs" : "h-8 text-sm")}
          />
        </div>
        {showDropdown && predictions.length > 0 && (
          <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {predictions.map((place, i) => (
              <button
                key={place.placeId || i}
                onClick={() => onSelect(place)}
                className="w-full text-left px-3 py-2.5 hover:bg-amber-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate">{place.name}</p>
                    {place.address && <p className="text-[10px] text-gray-400 truncate">{place.address}</p>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      {searchInput.trim().length >= 5 && predictions.length === 0 && (
        <div className="p-2.5 bg-gray-50 rounded-xl">
          <p className={cn("text-muted-foreground", isModal ? "text-xs" : "text-sm")}>Aucun établissement trouvé.</p>
        </div>
      )}
    </div>
  );

  const renderBookingLink = (location) => (
    <div className={isModal ? "space-y-0.5" : "space-y-1"}>
      <label className={cn("text-muted-foreground", isModal ? "text-[10px]" : "text-xs")}>Lien de réservation (optionnel)</label>
      <input
        type="text"
        value={location.bookingLink || ""}
        onChange={(e) => dispatch({ type: "UPDATE_LOCATION", payload: { id: location.id, updates: { bookingLink: e.target.value } } })}
        placeholder="https://doctolib.fr/... (vide = lien principal)"
        className={cn("w-full bg-gray-50 rounded-xl px-3 border-0 outline-none placeholder:text-gray-300 text-foreground", isModal ? "py-1.5 h-7 text-xs" : "py-2 h-8 text-sm")}
      />
    </div>
  );

  return (
    <div className={isModal ? "space-y-3" : "space-y-4"} style={{ animation: "tab-fade-in 0.3s ease" }}>
      {!isModal && (
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-0.5">Cabinet</h2>
          <p className="text-sm text-muted-foreground">Connectez votre cabinet pour afficher vos avis et votre localisation.</p>
        </div>
      )}

      {/* ═══════ CABINET PRINCIPAL ═══════ */}
      <div className={isModal ? "space-y-1.5" : "space-y-2"}>
        <p className={cn("font-medium text-foreground", isModal ? "text-xs" : "text-sm")}>Cabinet principal</p>

        {liveLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
          </div>
        ) : isConnected ? (
          <div className={isModal ? "space-y-1.5" : "space-y-2"}>
            {/* Connected card */}
            <div className={cn("flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl", isModal ? "p-3" : "px-4 py-3")}>
              {liveSource?.imageUrl ? (
                <img src={liveSource.imageUrl} alt={profileName} className={cn("rounded-xl object-cover shrink-0", isModal ? "w-11 h-11" : "w-14 h-14")} />
              ) : (
                <div className={cn("rounded-lg bg-emerald-100 flex items-center justify-center shrink-0", isModal ? "w-8 h-8" : "w-10 h-10")}>
                  <Building2 className={isModal ? "w-4 h-4 text-emerald-600" : "w-5 h-5 text-emerald-600"} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className={cn("font-medium text-foreground truncate", isModal ? "text-xs" : "text-sm")}>{profileName}</p>
                <p className="text-[11px]">
                  {profileRating && <span className="text-foreground">{profileRating}/5 </span>}
                  {liveSource?.status === "completed" && (
                    <>
                      <Star className="w-3 h-3 text-amber-500 inline -mt-px" fill="#F59E0B" />
                      <span className="text-amber-600 font-medium"> {liveSource.googleTotalReviews || liveSource.totalReviewsFound || profileReviewCount} avis Google</span>
                      {liveSource.lastScrapedAt && (
                        <span className="text-muted-foreground"> · Mis à jour le {new Date(liveSource.lastScrapedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</span>
                      )}
                    </>
                  )}
                  {!liveSource?.status && profileReviewCount > 0 && (
                    <span className="text-muted-foreground">· {profileReviewCount} avis</span>
                  )}
                  {liveIsScraping && (
                    <span className="text-blue-500">· Importation en cours...</span>
                  )}
                </p>
              </div>
              <div className="shrink-0">
                <button
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  {disconnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {/* Booking link */}
            {principalLoc && renderBookingLink(principalLoc)}
          </div>
        ) : (
          <>
            {/* Confirm selected place */}
            {selectedPlace && searchTarget === "principal" ? (
              <div className="space-y-2">
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-3">
                  <div className="flex items-start gap-2.5">
                    <div className={cn("rounded-lg bg-amber-50 flex items-center justify-center shrink-0", isModal ? "w-8 h-8" : "w-9 h-9")}>
                      <MapPin className={cn("text-amber-500", isModal ? "w-3.5 h-3.5" : "w-4 h-4")} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn("font-semibold text-foreground truncate", isModal ? "text-xs" : "text-sm")}>{selectedPlace.name}</p>
                      {selectedPlace.address && <p className={cn("text-gray-400 truncate", isModal ? "text-[10px]" : "text-xs")}>{selectedPlace.address}</p>}
                    </div>
                  </div>
                </div>
                {connectError && <p className="text-[11px] text-red-500">{connectError}</p>}
                <button
                  onClick={handleConnectPlace}
                  disabled={connecting}
                  className={cn("w-full flex items-center justify-center gap-1.5 rounded-xl font-semibold bg-[#FC6D41] text-white hover:bg-[#e55e35] transition-colors cursor-pointer", isModal ? "px-4 py-2 text-xs" : "px-6 py-2.5 text-sm")}
                >
                  {connecting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {connecting ? "Importation..." : "Connecter cet établissement"}
                </button>
                <button onClick={resetSearch} className="w-full text-center text-[11px] text-gray-400 hover:text-gray-500 cursor-pointer py-0.5">
                  Ce n'est pas mon cabinet
                </button>
              </div>
            ) : searchTarget === "principal" ? (
              renderSearchAutocomplete("Nom de votre cabinet + ville", handleSelectPrincipal)
            ) : null}
          </>
        )}
      </div>

      {/* ═══════ CABINET SECONDAIRE ═══════ */}
      {isConnected && (
        <div className={isModal ? "space-y-1.5" : "space-y-2"}>
          <p className={cn("font-medium text-foreground", isModal ? "text-xs" : "text-sm")}>Cabinet secondaire</p>

          {secondaireLoc ? (
            <div className={isModal ? "space-y-1.5" : "space-y-2"}>
              <div className={cn("flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl", isModal ? "p-2.5" : "px-4 py-3")}>
                <div className={cn("rounded-lg bg-amber-50 flex items-center justify-center shrink-0", isModal ? "w-8 h-8" : "w-10 h-10")}>
                  {secondaireLoc.icon?.startsWith("http") ? (
                    <img src={secondaireLoc.icon} alt={secondaireLoc.title} className="w-full h-full rounded-lg object-cover" />
                  ) : (
                    <MapPin className={cn("text-amber-500", isModal ? "w-3.5 h-3.5" : "w-4 h-4")} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("font-medium text-foreground truncate", isModal ? "text-xs" : "text-sm")}>{secondaireLoc.title}</p>
                  {secondaireLoc.address && <p className={cn("text-gray-400 truncate", isModal ? "text-[10px]" : "text-xs")}>{secondaireLoc.address}</p>}
                </div>
                <div className="shrink-0">
                  <button onClick={removeSecondaire} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {renderBookingLink(secondaireLoc)}
            </div>
          ) : searchTarget === "secondaire" ? (
            <div className="space-y-2">
              {renderSearchAutocomplete("Nom du second cabinet + ville", handleSelectSecondaire)}
              <button onClick={() => { setSearchTarget("principal"); resetSearch(); }} className="text-[11px] text-gray-400 hover:text-gray-500 cursor-pointer">
                Annuler
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setSearchTarget("secondaire"); resetSearch(); }}
              className={cn("flex items-center gap-1.5 rounded-xl border-2 border-dashed border-gray-200 text-muted-foreground hover:border-[#FC6D41]/40 hover:text-[#FC6D41] transition-colors cursor-pointer", isModal ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm")}
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter un cabinet secondaire
            </button>
          )}
        </div>
      )}

      {!isModal && (
        <button
          onClick={() => { handleValidateSection("locations"); handleValidateSection("google"); }}
          className={cn("px-5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer", changedSections.has("locations") || changedSections.has("google") ? "bg-[#FC6D41] text-white hover:bg-[#e55e35]" : "bg-gray-100 text-gray-400")}
        >
          {state.validatedSection === "locations" ? "Enregistré !" : "Enregistrer"}
        </button>
      )}
    </div>
  );
}
