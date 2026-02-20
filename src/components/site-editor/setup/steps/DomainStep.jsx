'use client';

import { useState } from "react";
import { Globe } from "lucide-react";
import { useSetup } from "../SetupContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function DomainStep() {
  const { state, changedSections, handleValidateSection } = useSetup();
  const [domainBought, setDomainBought] = useState(false);
  const [domainSearch, setDomainSearch] = useState("");
  const [domainSearchResult, setDomainSearchResult] = useState(null);

  const handleSearch = () => {
    if (!domainSearch.trim()) return;
    const result = domainSearch.trim().replace(/\s+/g, "-").toLowerCase();
    setDomainSearchResult(result.includes(".") ? result : result + ".fr");
  };

  return (
    <div className="space-y-4" style={{ animation: "tab-fade-in 0.3s ease" }}>
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">Nom de domaine</h2>
        <p className="text-sm text-muted-foreground">{domainBought ? "Votre domaine personnalisé est connecté." : "Choisissez un nom de domaine professionnel pour votre cabinet."}</p>
      </div>

      {domainBought ? (
        <>
          <div className="bg-gray-50 rounded-xl p-4">
            <Label className="text-xs text-muted-foreground mb-1 block">Sous-domaine Theralys</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-lg">
                <Globe className="w-4 h-4 text-gray-300 shrink-0" />
                <span className="text-sm font-medium text-gray-400">theo-osteo.theralys.fr</span>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-sm font-semibold">Non connecté</span>
            </div>
          </div>
          <div className="bg-green-50/50 border border-green-200 rounded-xl p-4">
            <Label className="text-xs text-green-600 mb-1 block">Domaine personnalisé</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-white border border-green-200 rounded-lg">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                <span className="text-sm font-semibold text-foreground">{domainSearchResult || "mondomaine.fr"}</span>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">Connecté</span>
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2.5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              <div>
                <p className="text-sm font-medium text-foreground">Certificat SSL</p>
                <p className="text-sm text-muted-foreground">HTTPS activé automatiquement</p>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">Actif</span>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-3">
            <div className="relative">
              <Input value={domainSearch} onChange={(e) => { setDomainSearch(e.target.value); setDomainSearchResult(null); }} placeholder="ex: cabinet-dupont" className="h-10 pr-12" onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">.fr</span>
            </div>

            {/* Suggestions */}
            {!domainSearchResult && (
              <div className="flex flex-wrap gap-2">
                {["osteo-lyon", "dupont-osteo", "theo-osteo", "dupont-theo"].map((sug, i) => {
                  const labels = ["métier-ville", "nom-métier", "prénom-métier", "nom-prénom"];
                  return (
                    <button key={sug} onClick={() => setDomainSearch(sug)} className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-muted-foreground hover:border-[#FC6D41] hover:text-[#FC6D41] transition-all cursor-pointer">
                      <span className="font-medium text-foreground">{sug}.fr</span>
                      <span className="ml-1.5 text-xs text-gray-400">{labels[i]}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Results */}
            {domainSearchResult && (
              <div className="space-y-2">
                {[
                  { ext: ".fr", price: "Offert", available: true, highlight: true },
                  { ext: ".com", price: "8,99€/an", available: true, highlight: false },
                  { ext: ".cabinet", price: "14,99€/an", available: false, highlight: false },
                ].map((opt) => {
                  const name = domainSearchResult.replace(/\.[^.]+$/, "") + opt.ext;
                  return (
                    <button key={opt.ext} onClick={() => { if (opt.available) setDomainSearchResult(name); }} disabled={!opt.available} className={cn("w-full flex items-center justify-between px-3 py-2.5 rounded-xl border-2 transition-all text-left", !opt.available ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed" : opt.highlight ? "border-[#FC6D41] bg-[#FC6D41]/5 hover:bg-[#FC6D41]/10 cursor-pointer" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer")}>
                      <div className="flex items-center gap-2.5">
                        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", opt.highlight ? "bg-[#FC6D41]/10" : "bg-gray-100")}>
                          <Globe className={cn("w-3.5 h-3.5", opt.highlight ? "text-[#FC6D41]" : "text-gray-400")} />
                        </div>
                        <span className={cn("text-sm font-semibold", !opt.available ? "text-gray-400" : "text-foreground")}>{name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {opt.highlight ? (
                          <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">OFFERT</span>
                        ) : !opt.available ? (
                          <span className="text-xs text-red-400 font-medium">Indisponible</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">{opt.price}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button onClick={() => { if (domainSearchResult) { setDomainBought(true); handleValidateSection("domain"); } else { handleSearch(); } }} disabled={!domainSearch.trim()} className={cn("w-full px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer", domainSearch.trim() ? "bg-[#FC6D41] text-white hover:bg-[#e55e35]" : "bg-gray-200 text-gray-400 cursor-not-allowed")}>
            {domainSearchResult ? "Connecter ce domaine" : "Rechercher"}
          </button>
        </>
      )}

      <button onClick={() => handleValidateSection("domain")} className={cn("px-5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer", changedSections.has("domain") ? "bg-[#FC6D41] text-white hover:bg-[#e55e35]" : "bg-gray-100 text-gray-400")}>
        {state.validatedSection === "domain" ? "Enregistré !" : "Enregistrer"}
      </button>
    </div>
  );
}
