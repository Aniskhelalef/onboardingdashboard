'use client';

import { useState, useEffect, useRef } from "react";
import { Star, ArrowRight, ArrowLeft, Check, Plus } from "lucide-react";
import { useSetup } from "../SetupContext";
import { DEFAULT_SPECIALTIES, SPECIALTY_EMOJIS, getIconEmoji } from "../constants";
import { cn } from "@/lib/utils";

export default function SpecialtiesStep() {
  const { state, dispatch, handleValidateSection, hydrated, isModal } = useSetup();
  const { specialties } = state.data;
  const specCount = specialties.length;

  // Modal: skip intro, go straight to build
  const [subStep, setSubStep] = useState(isModal ? "build" : "intro");
  const didHydrate = useRef(false);

  // Update subStep once hydration loads real data
  useEffect(() => {
    if (hydrated && !didHydrate.current) {
      didHydrate.current = true;
      if (specialties.length > 0) setSubStep("build");
    }
  }, [hydrated, specialties.length]);

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newIcon, setNewIcon] = useState("✨");
  const [showIconPicker, setShowIconPicker] = useState(false);

  // ── Intro (full-page only) ────────────────────────────────────────
  if (subStep === "intro" && !isModal) {
    return (
      <div className="flex flex-col items-center justify-center h-full" style={{ animation: "tab-fade-in 0.3s ease" }}>
        <div className="w-full max-w-[480px]">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-color-2/10 flex items-center justify-center mx-auto mb-3">
              <Star className="w-7 h-7 text-color-2" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Vos spécialités</h2>
            <p className="text-sm text-muted-foreground mt-1">Définissez les domaines dans lesquels vous exercez.</p>
          </div>

          <div className="space-y-2.5 mb-6">
            {[
              { icon: "📄", title: "Une page dédiée sur votre site", desc: "Chaque spécialité génère une page optimisée qui présente votre expertise aux patients." },
              { icon: "✍️", title: "Des articles SEO mensuels ciblés", desc: "~30 articles/mois sont répartis entre vos spécialités pour attirer des patients via Google." },
              { icon: "📈", title: "Un référencement local renforcé", desc: "Plus vous couvrez de spécialités, plus votre site apparaît dans les recherches patients." },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-lg shrink-0 mt-0.5">{item.icon}</span>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-2">Exemples de spécialités</p>
            <div className="flex flex-wrap gap-1.5">
              {DEFAULT_SPECIALTIES.map((s) => (
                <span key={s.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-full text-xs text-gray-500">
                  <span>{getIconEmoji(s.icon)}</span>
                  {s.title}
                </span>
              ))}
            </div>
          </div>

          <button onClick={() => setSubStep("build")} className="w-full py-2.5 rounded-xl bg-color-1 text-white text-sm font-semibold hover:bg-gray-800 transition-colors cursor-pointer flex items-center justify-center gap-2">
            Commencer
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ── Validate (full-page only) ─────────────────────────────────────
  if (subStep === "validate" && !isModal) {
    return (
      <div className="space-y-4" style={{ animation: "tab-fade-in 0.3s ease" }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-2">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Récapitulatif</h2>
          <p className="text-sm text-muted-foreground mt-1">{specCount} spécialité{specCount > 1 ? "s" : ""} configurée{specCount > 1 ? "s" : ""}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {specialties.map((spec) => (
            <div key={spec.id} className="p-3 bg-gray-50 rounded-xl flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-color-2/10 flex items-center justify-center text-xl shrink-0">{getIconEmoji(spec.icon)}</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground">{spec.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{spec.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-orange-50 rounded-xl p-4 space-y-2">
          <h3 className="text-sm font-bold text-color-1">Ce qui sera créé</h3>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2"><span className="text-sm">📄</span><p className="text-xs text-gray-600"><span className="font-semibold">{specCount} page{specCount > 1 ? "s" : ""}</span> de spécialité dédiée{specCount > 1 ? "s" : ""}</p></div>
            <div className="flex items-center gap-2"><span className="text-sm">✍️</span><p className="text-xs text-gray-600"><span className="font-semibold">~30 articles SEO/mois</span> répartis entre vos {specCount} thématiques</p></div>
            <div className="flex items-center gap-2"><span className="text-sm">📈</span><p className="text-xs text-gray-600">Chaque article cible un <span className="font-semibold">mot-clé local</span> pour attirer des patients</p></div>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setSubStep("build")} className="flex-1 py-2 rounded-xl bg-gray-100 text-sm font-medium text-color-1 hover:bg-gray-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            Modifier
          </button>
          <button onClick={() => handleValidateSection("specialties")} className="flex-1 py-2 rounded-xl bg-color-2 text-sm font-semibold text-white hover:bg-[#e55e35] transition-colors cursor-pointer flex items-center justify-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            {state.validatedSection === "specialties" ? "Enregistré !" : "Enregistrer"}
          </button>
        </div>
      </div>
    );
  }

  // ── Build ─────────────────────────────────────────────────────────
  const handleAdd = () => {
    if (!newTitle.trim()) return;
    const newSpec = { id: Date.now().toString(), icon: newIcon, title: newTitle.trim(), description: newDesc.trim() || `Spécialité : ${newTitle.trim()}` };
    dispatch({ type: "ADD_SPECIALTY", payload: newSpec });
    setNewTitle(""); setNewDesc(""); setNewIcon("✨");
    if (!isModal && specCount + 1 >= 6) setTimeout(() => setSubStep("validate"), 300);
  };

  // ── Modal: toggleable chips ──────────────────────────────────────
  if (isModal) {
    const SUGGESTIONS = [
      { icon: "🦴", title: "Douleurs musculaires", description: "Traitement des tensions, contractures et douleurs musculaires" },
      { icon: "🤰", title: "Femmes enceintes", description: "Accompagnement de la grossesse et du post-partum" },
      { icon: "👶", title: "Nourrissons", description: "Prise en charge des bébés et jeunes enfants" },
      { icon: "⚽", title: "Sportifs", description: "Optimisation des performances et récupération" },
      { icon: "💼", title: "Troubles posturaux", description: "Correction des déséquilibres liés au travail de bureau" },
      { icon: "🧓", title: "Seniors", description: "Maintien de la mobilité et du confort au quotidien" },
      { icon: "🧠", title: "Stress & anxiété", description: "Gestion du stress, de l'anxiété et des troubles émotionnels" },
      { icon: "💆", title: "Maux de tête", description: "Traitement des céphalées et migraines" },
      { icon: "😴", title: "Troubles du sommeil", description: "Amélioration de la qualité du sommeil" },
      { icon: "🦵", title: "Post-opératoire", description: "Rééducation et récupération après chirurgie" },
      { icon: "🧘", title: "Bien-être", description: "Relaxation et équilibre corps-esprit" },
      { icon: "🏃", title: "Remise en forme", description: "Accompagnement au retour à l'activité physique" },
    ];

    const selectedTitles = specialties.map(s => s.title);

    const toggleSuggestion = (sug) => {
      const existing = specialties.find(s => s.title === sug.title);
      if (existing) {
        dispatch({ type: "REMOVE_SPECIALTY", payload: existing.id });
      } else if (specCount < 6) {
        dispatch({ type: "ADD_SPECIALTY", payload: { id: Date.now().toString(), icon: sug.icon, title: sug.title, description: sug.description } });
      }
    };

    const handleAddCustom = () => {
      if (!newTitle.trim() || specCount >= 6) return;
      dispatch({ type: "ADD_SPECIALTY", payload: { id: Date.now().toString(), icon: "✨", title: newTitle.trim(), description: `Spécialité : ${newTitle.trim()}` } });
      setNewTitle("");
    };

    return (
      <div className="space-y-3 h-full flex flex-col" style={{ animation: "tab-fade-in 0.3s ease" }}>
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <p className="text-sm font-semibold text-color-1">Sélectionnez vos spécialités</p>
          <span className={cn("text-xs font-bold", specCount >= 3 ? "text-green-500" : "text-color-2")}>{specCount}/6</span>
        </div>

        {/* Toggleable chips grid */}
        <div className="flex flex-wrap gap-1.5 flex-1 content-start">
          {SUGGESTIONS.map((sug) => {
            const isSelected = selectedTitles.includes(sug.title);
            const isDisabled = !isSelected && specCount >= 6;
            return (
              <button
                key={sug.title}
                onClick={() => !isDisabled && toggleSuggestion(sug)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  isSelected
                    ? "bg-color-2/10 text-color-2 ring-1 ring-color-2/30 cursor-pointer"
                    : isDisabled
                    ? "bg-gray-50 text-gray-300 cursor-default"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100 cursor-pointer"
                )}
              >
                <span className="text-sm">{sug.icon}</span>
                {sug.title}
                {isSelected && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="ml-0.5"><polyline points="20 6 9 17 4 12"/></svg>
                )}
              </button>
            );
          })}

          {/* Custom specialties (not in suggestions) */}
          {specialties.filter(s => !SUGGESTIONS.some(sug => sug.title === s.title)).map((spec) => (
            <button
              key={spec.id}
              onClick={() => dispatch({ type: "REMOVE_SPECIALTY", payload: spec.id })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-color-2/10 text-color-2 ring-1 ring-color-2/30 cursor-pointer transition-all"
            >
              <span className="text-sm">{getIconEmoji(spec.icon)}</span>
              {spec.title}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="ml-0.5"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
          ))}
        </div>

        {/* Add custom */}
        {specCount < 6 && (
          <div className="flex items-center gap-1.5 shrink-0">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => { if (e.target.value.length <= 30) setNewTitle(e.target.value); }}
              onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
              placeholder="Autre spécialité..."
              className="flex-1 min-w-0 text-xs text-foreground bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-color-2/30 focus:border-color-2/30 transition-all placeholder:text-gray-300 h-8"
            />
            <button onClick={handleAddCustom} disabled={!newTitle.trim()} className={cn("h-8 px-3 rounded-lg text-xs font-medium flex items-center gap-1 shrink-0 transition-all", newTitle.trim() ? "bg-color-1 text-white hover:bg-gray-800 cursor-pointer" : "bg-gray-100 text-gray-300 cursor-not-allowed")}>
              <Plus className="w-3 h-3" />
              Ajouter
            </button>
          </div>
        )}

        {specCount < 3 && (
          <p className="text-[11px] text-gray-400 shrink-0">Sélectionnez au moins 3 spécialités</p>
        )}
      </div>
    );
  }

  // ── Full-page build ───────────────────────────────────────────────
  return (
    <div className="space-y-3" style={{ animation: "tab-fade-in 0.3s ease" }}>
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Vos spécialités</h2>
          <span className="text-sm font-bold text-color-2">{specCount}/6</span>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">Ajoutez entre 3 et 6 spécialités.</p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={cn("h-1.5 flex-1 rounded-full transition-all", i < specCount ? "bg-color-2" : i < 3 ? "bg-color-2/20" : "bg-gray-100")} />
        ))}
      </div>

      {/* Add form */}
      {specCount < 6 && (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-start gap-2.5">
            <div className="relative">
              <button onClick={() => setShowIconPicker(!showIconPicker)} className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-xl shrink-0 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200">
                {newIcon}
              </button>
              {showIconPicker && (
                <div className="absolute top-12 left-0 z-20 bg-white rounded-xl shadow-lg border p-2 grid grid-cols-5 gap-1 w-[180px]" style={{ animation: "tab-fade-in 0.15s ease" }}>
                  {SPECIALTY_EMOJIS.map((emoji) => (
                    <button key={emoji} onClick={() => { setNewIcon(emoji); setShowIconPicker(false); }} className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-gray-100 transition-colors cursor-pointer", newIcon === emoji && "bg-color-2/10 ring-1 ring-color-2/30")}>
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-[10px] text-gray-400 font-medium">Titre</label>
                  <span className={cn("text-[10px] tabular-nums", newTitle.length > 25 ? "text-color-2" : "text-gray-300")}>{newTitle.length}/30</span>
                </div>
                <input type="text" value={newTitle} onChange={(e) => { if (e.target.value.length <= 30) setNewTitle(e.target.value); }} placeholder="Ex: Douleurs musculaires" className="w-full text-sm font-medium text-foreground bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-color-2/30 focus:border-color-2/30 transition-all placeholder:text-gray-300" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-[10px] text-gray-400 font-medium">Description</label>
                  <span className={cn("text-[10px] tabular-nums", newDesc.length > 80 ? "text-color-2" : "text-gray-300")}>{newDesc.length}/100</span>
                </div>
                <input type="text" value={newDesc} onChange={(e) => { if (e.target.value.length <= 100) setNewDesc(e.target.value); }} placeholder="Ex: Traitement des tensions et contractures musculaires" className="w-full text-xs text-muted-foreground bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-color-2/30 focus:border-color-2/30 transition-all placeholder:text-gray-300" />
              </div>
            </div>
          </div>
          <button onClick={handleAdd} disabled={!newTitle.trim()} className={cn("w-full py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5", newTitle.trim() ? "bg-color-1 text-white hover:bg-gray-800" : "bg-gray-100 text-gray-300 cursor-not-allowed")}>
            <Plus className="w-3.5 h-3.5" />
            Ajouter
          </button>
        </div>
      )}

      {/* Existing specialties */}
      {specCount > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {specialties.map((spec) => (
            <div key={spec.id} className="p-2.5 bg-gray-50 rounded-xl flex items-start gap-2.5 relative group">
              <div className="w-9 h-9 rounded-lg bg-color-2/10 flex items-center justify-center text-lg shrink-0">{getIconEmoji(spec.icon)}</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-semibold text-foreground">{spec.title}</h3>
                <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{spec.description}</p>
              </div>
              <button onClick={() => dispatch({ type: "REMOVE_SPECIALTY", payload: spec.id })} className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-gray-200/0 group-hover:bg-gray-200 flex items-center justify-center text-gray-300 group-hover:text-gray-500 transition-all cursor-pointer">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      {specCount >= 3 && (
        <div className="flex gap-2">
          {specCount < 6 && (
            <button onClick={() => setSubStep("validate")} className="flex-1 py-2 rounded-xl bg-gray-100 text-sm font-medium text-color-1 hover:bg-gray-200 transition-colors cursor-pointer">
              Valider avec {specCount} spécialité{specCount > 1 ? "s" : ""}
            </button>
          )}
          {specCount >= 6 && (
            <button onClick={() => setSubStep("validate")} className="flex-1 py-2 rounded-xl bg-color-2 text-sm font-semibold text-white hover:bg-[#e55e35] transition-colors cursor-pointer flex items-center justify-center gap-1.5">
              Valider
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
