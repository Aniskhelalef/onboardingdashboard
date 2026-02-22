'use client';

import { Building2, Search, Loader2, Check } from "lucide-react";
import { useSetup } from "../SetupContext";
import { useGooglePlaces } from "../useGooglePlaces";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function GoogleStep() {
  const { state, dispatch, changedSections, handleValidateSection, isModal } = useSetup();
  const { google } = state.data;
  const gp = useGooglePlaces();

  const handleConnect = (result) => {
    const r = result || gp.selectedResult;
    dispatch({ type: "SET_GOOGLE", payload: { connected: true, profile: { name: r?.name || "Votre Cabinet", rating: r?.rating || null, reviewCount: r?.reviewCount || 0, address: r?.address || "", placeId: r?.placeId || null } } });
  };

  return (
    <div className={isModal ? "space-y-2.5" : "space-y-4"} style={{ animation: "tab-fade-in 0.3s ease" }}>
      {!isModal && (
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-1">Google Business</h2>
          <p className="text-sm text-muted-foreground">{google.connected ? "Votre fiche Google est connectée." : "Recherchez votre établissement pour le connecter."}</p>
        </div>
      )}

      {google.connected && google.profile ? (
        <div className={cn("flex items-center gap-3 bg-green-50/50 border border-green-200 rounded-xl", isModal ? "p-3" : "p-4")}>
          <div className={cn("rounded-lg bg-emerald-100 flex items-center justify-center shrink-0", isModal ? "w-8 h-8" : "w-10 h-10")}>
            <Building2 className={isModal ? "w-4 h-4 text-emerald-600" : "w-5 h-5 text-emerald-600"} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn("font-medium text-foreground truncate", isModal ? "text-xs" : "text-sm")}>{google.profile.name}</p>
            {google.profile.address && <p className={cn("text-muted-foreground truncate", isModal ? "text-[11px]" : "text-sm")}>{google.profile.address}</p>}
            {google.profile.rating && <p className="text-[11px] text-muted-foreground">{google.profile.rating}/5 · {google.profile.reviewCount} avis</p>}
          </div>
          <span className={cn("inline-flex items-center rounded-full bg-green-100 text-green-700 font-semibold shrink-0", isModal ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-sm")}>Connecté</span>
        </div>
      ) : (
        <>
          <div className={isModal ? "space-y-2" : "space-y-3"}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input value={gp.query} onChange={(e) => gp.handleQueryChange(e.target.value)} placeholder="Ex : Cabinet Dupont Lyon" className={cn("pl-10 pr-10", isModal ? "h-8" : "h-10")} />
              {gp.searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />}
            </div>
            {gp.results.length > 0 && (
              <div className={cn("overflow-y-auto", isModal ? "space-y-1.5 max-h-[160px]" : "space-y-2 max-h-[200px]")}>
                {gp.results.map((result) => (
                  <button key={result.placeId} onClick={() => gp.setSelectedResult(result)} className={cn("w-full flex items-center gap-2.5 rounded-xl border transition-all cursor-pointer text-left", isModal ? "p-2" : "p-3", gp.selectedResult?.placeId === result.placeId ? "border-[#FC6D41] bg-[#FC6D41]/5" : "border-gray-200 bg-white hover:border-gray-300")}>
                    <div className={cn("rounded-lg bg-gray-100 flex items-center justify-center shrink-0", isModal ? "w-7 h-7" : "w-9 h-9")}>
                      <Building2 className={isModal ? "w-3.5 h-3.5 text-muted-foreground" : "w-4 h-4 text-muted-foreground"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("font-medium text-foreground truncate", isModal ? "text-xs" : "text-sm")}>{result.name}</p>
                      <p className={cn("text-muted-foreground truncate", isModal ? "text-[11px]" : "text-xs")}>{result.address}</p>
                      {result.rating && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <div className="flex text-amber-400 text-[10px]">{"★".repeat(Math.round(result.rating))}</div>
                          <span className="text-[10px] text-muted-foreground">{result.rating}/5 · {result.reviewCount} avis</span>
                        </div>
                      )}
                    </div>
                    {gp.selectedResult?.placeId === result.placeId && <Check className="w-3.5 h-3.5 text-[#FC6D41] shrink-0" />}
                  </button>
                ))}
              </div>
            )}
            {gp.query.trim() && !gp.searching && gp.results.length === 0 && (
              <div className="p-2.5 bg-gray-50 rounded-xl">
                <p className={cn("text-muted-foreground", isModal ? "text-xs" : "text-sm")}>Aucun établissement trouvé. Essayez avec un autre nom ou ajoutez la ville.</p>
              </div>
            )}
          </div>
          <button onClick={() => { handleConnect(gp.selectedResult); handleValidateSection("google"); }} disabled={!gp.selectedResult} className={cn("w-full rounded-xl font-semibold transition-colors cursor-pointer", isModal ? "px-4 py-2 text-xs" : "px-6 py-2.5 text-sm", gp.selectedResult ? "bg-[#FC6D41] text-white hover:bg-[#e55e35]" : "bg-gray-200 text-gray-400 cursor-not-allowed")}>
            Connecter cet établissement
          </button>
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
