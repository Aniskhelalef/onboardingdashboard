'use client';

import { useState } from "react";
import { Plus, Image } from "lucide-react";
import { useSetup } from "../SetupContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function CabinetStep() {
  const { state, dispatch, changedSections, handleValidateSection } = useSetup();
  const { locations } = state.data;
  const [editingIdx, setEditingIdx] = useState(0);

  const idx = Math.min(editingIdx, locations.length - 1);
  const loc = locations[idx];

  const addLocation = () => {
    const newLoc = { id: Date.now().toString(), title: "", address: "", image: "", bookingLink: "" };
    dispatch({ type: "ADD_LOCATION", payload: newLoc });
    setEditingIdx(locations.length);
  };

  const handleImageUpload = (locId) => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) { const reader = new FileReader(); reader.onload = (ev) => dispatch({ type: "UPDATE_LOCATION", payload: { id: locId, updates: { image: ev.target?.result } } }); reader.readAsDataURL(file); }
    };
    input.click();
  };

  return (
    <div className="space-y-3" style={{ animation: "tab-fade-in 0.3s ease" }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-0.5">Adresse(s) de cabinet</h2>
          <p className="text-sm text-muted-foreground">Modifiez les informations de vos cabinets.</p>
        </div>
        {locations.length > 1 && (
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
            {locations.map((l, i) => (
              <button key={l.id} onClick={() => setEditingIdx(i)} className={cn("px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer", i === idx ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                {l.title || `Cabinet ${i + 1}`}
              </button>
            ))}
          </div>
        )}
      </div>
      {loc && (
        <div className="space-y-2">
          <div className="flex items-end gap-3">
            <button onClick={() => handleImageUpload(loc.id)} className="w-9 h-9 rounded-lg bg-muted/60 border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 flex items-center justify-center shrink-0 overflow-hidden transition-colors">
              {loc.image ? <img src={loc.image} alt="" className="w-full h-full object-cover" /> : <Image className="w-4 h-4 text-muted-foreground" />}
            </button>
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Nom du cabinet</Label>
              <Input value={loc.title} onChange={(e) => dispatch({ type: "UPDATE_LOCATION", payload: { id: loc.id, updates: { title: e.target.value } } })} placeholder="Cabinet Dupont" className="h-9" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Adresse complète</Label>
            <Input value={loc.address} onChange={(e) => dispatch({ type: "UPDATE_LOCATION", payload: { id: loc.id, updates: { address: e.target.value } } })} placeholder="12 rue de la Santé, 75014 Paris" className="h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Lien de réservation</Label>
            <Input value={loc.bookingLink} onChange={(e) => dispatch({ type: "UPDATE_LOCATION", payload: { id: loc.id, updates: { bookingLink: e.target.value } } })} placeholder="https://doctolib.fr/..." className="h-9" />
          </div>
        </div>
      )}
      {locations.length < 2 && (
        <button onClick={addLocation} className="flex items-center justify-center gap-1.5 w-full p-2 rounded-xl border-2 border-dashed border-gray-200 text-sm text-muted-foreground hover:border-[#FC6D41]/40 hover:text-[#FC6D41] transition-colors cursor-pointer">
          <Plus className="w-4 h-4" />
          Ajouter un second cabinet
        </button>
      )}
      <button
        onClick={() => handleValidateSection("locations")}
        className={cn("px-5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer", changedSections.has("locations") ? "bg-[#FC6D41] text-white hover:bg-[#e55e35]" : "bg-gray-100 text-gray-400")}
      >
        {state.validatedSection === "locations" ? "Enregistré !" : "Enregistrer"}
      </button>
    </div>
  );
}
