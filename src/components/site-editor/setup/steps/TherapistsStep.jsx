'use client';

import { useState } from "react";
import { Plus, Image } from "lucide-react";
import { useSetup } from "../SetupContext";
import RichTextEditor from "../../RichTextEditor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function TherapistsStep() {
  const { state, dispatch, changedSections, handleValidateSection } = useSetup();
  const { therapists, contact } = state.data;
  const [editingIdx, setEditingIdx] = useState(0);

  const idx = Math.min(editingIdx, therapists.length - 1);
  const t = therapists[idx];

  const addTherapist = () => {
    const isFirst = therapists.length === 0;
    const newT = {
      id: Date.now().toString(),
      accroche: isFirst ? `${contact.lastName} ${contact.firstName} ${contact.profession} à ${contact.city}`.trim() : "",
      richTextPresentation: "<p>Diplômé(e) en ostéopathie, je vous accueille dans mon cabinet pour vous accompagner vers un mieux-être durable.</p><p>Mon approche se veut globale et personnalisée : chaque patient est unique, chaque douleur a son histoire.</p>",
      price: "60 €",
      duration: "45 min",
      reimbursement: "Remboursement mutuelle possible",
      bookingLink: isFirst ? contact.appointmentLink : "",
      photo: "",
    };
    dispatch({ type: "ADD_THERAPIST", payload: newT });
    setEditingIdx(therapists.length);
  };

  const handlePhotoUpload = (therapistId) => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) { const reader = new FileReader(); reader.onload = (ev) => dispatch({ type: "UPDATE_THERAPIST", payload: { id: therapistId, updates: { photo: ev.target?.result } } }); reader.readAsDataURL(file); }
    };
    input.click();
  };

  return (
    <div className="space-y-2" style={{ animation: "tab-fade-in 0.3s ease" }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-0.5">Équipe du cabinet</h2>
          <p className="text-sm text-muted-foreground">Modifiez les informations de vos thérapeutes.</p>
        </div>
        {therapists.length > 1 && (
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
            {therapists.map((th, i) => (
              <button key={th.id} onClick={() => setEditingIdx(i)} className={cn("px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer", i === idx ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                {th.accroche?.split(" ").slice(0, 2).join(" ") || `Thérapeute ${i + 1}`}
              </button>
            ))}
          </div>
        )}
      </div>
      {t && (
        <div className="space-y-2">
          <div className="flex items-end gap-3">
            <button onClick={() => handlePhotoUpload(t.id)} className="w-9 h-9 rounded-full bg-muted/60 border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 flex items-center justify-center shrink-0 overflow-hidden transition-colors">
              {t.photo ? <img src={t.photo} alt="" className="w-full h-full object-cover" /> : <Image className="w-4 h-4 text-muted-foreground" />}
            </button>
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Nom Prénom Métier Ville</Label>
              <Input value={t.accroche} onChange={(e) => dispatch({ type: "UPDATE_THERAPIST", payload: { id: t.id, updates: { accroche: e.target.value } } })} placeholder={`${contact.lastName || "Dupont"} ${contact.firstName || "Marie"} ${contact.profession || "Ostéopathe"} à ${contact.city || "Lyon"}`} className="h-9" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Présentation</Label>
            <div className="[&_.tiptap]:!min-h-[80px] [&_.tiptap]:!max-h-[120px] [&_.tiptap]:overflow-y-auto [&_.ProseMirror]:!min-h-[80px] [&_.ProseMirror]:!max-h-[120px]">
              <RichTextEditor content={t.richTextPresentation} onChange={(html) => dispatch({ type: "UPDATE_THERAPIST", payload: { id: t.id, updates: { richTextPresentation: html } } })} placeholder="Présentez-vous et votre approche thérapeutique..." />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Durée</Label>
              <Input value={t.duration} onChange={(e) => dispatch({ type: "UPDATE_THERAPIST", payload: { id: t.id, updates: { duration: e.target.value } } })} placeholder="45 min" className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Prix</Label>
              <Input value={t.price} onChange={(e) => dispatch({ type: "UPDATE_THERAPIST", payload: { id: t.id, updates: { price: e.target.value } } })} placeholder="60 €" className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Remboursement</Label>
              <Input value={t.reimbursement} onChange={(e) => dispatch({ type: "UPDATE_THERAPIST", payload: { id: t.id, updates: { reimbursement: e.target.value } } })} placeholder="Mutuelle" className="h-9" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Lien de réservation</Label>
            <Input value={t.bookingLink || ""} onChange={(e) => dispatch({ type: "UPDATE_THERAPIST", payload: { id: t.id, updates: { bookingLink: e.target.value } } })} placeholder="https://doctolib.fr/..." className="h-9" />
          </div>
        </div>
      )}
      {therapists.length < 3 && (
        <button onClick={addTherapist} className="flex items-center justify-center gap-1.5 w-full p-2 rounded-xl border-2 border-dashed border-gray-200 text-sm text-muted-foreground hover:border-[#FC6D41]/40 hover:text-[#FC6D41] transition-colors cursor-pointer">
          <Plus className="w-4 h-4" />
          Ajouter un thérapeute
        </button>
      )}
      <button
        onClick={() => handleValidateSection("therapists")}
        className={cn("px-5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer", changedSections.has("therapists") ? "bg-[#FC6D41] text-white hover:bg-[#e55e35]" : "bg-gray-100 text-gray-400")}
      >
        {state.validatedSection === "therapists" ? "Enregistré !" : "Enregistrer"}
      </button>
    </div>
  );
}
