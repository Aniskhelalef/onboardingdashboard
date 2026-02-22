'use client';

import { useState, useEffect, useRef } from "react";
import { Plus, Image, Trash2 } from "lucide-react";
import { useSetup } from "../SetupContext";
import RichTextEditor from "../../RichTextEditor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const htmlToPlain = (html) => html?.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>\s*<p[^>]*>/gi, '\n').replace(/<[^>]+>/g, '').trim() || '';
const plainToHtml = (text) => text.split('\n').filter(Boolean).map(p => `<p>${p}</p>`).join('');

export default function TherapistsStep() {
  const { state, dispatch, changedSections, handleValidateSection, isModal, hydrated } = useSetup();
  const { therapists, contact } = state.data;
  const [editingIdx, setEditingIdx] = useState(0);
  const didAutoCreate = useRef(false);

  const idx = Math.min(editingIdx, therapists.length - 1);

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

  // Auto-create first therapist on mount in modal mode
  useEffect(() => {
    if (hydrated && therapists.length === 0 && !didAutoCreate.current) {
      didAutoCreate.current = true;
      addTherapist();
    }
  }, [hydrated, therapists.length]);

  const handlePhotoUpload = (therapistId) => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) { const reader = new FileReader(); reader.onload = (ev) => dispatch({ type: "UPDATE_THERAPIST", payload: { id: therapistId, updates: { photo: ev.target?.result } } }); reader.readAsDataURL(file); }
    };
    input.click();
  };

  const removeTherapist = (tId) => {
    dispatch({ type: "REMOVE_THERAPIST", payload: tId });
    if (editingIdx > 0) setEditingIdx(editingIdx - 1);
  };

  const inputH = isModal ? "h-8" : "h-9";
  const labelCls = isModal ? "text-[11px]" : "text-xs";
  const photoSize = isModal ? "w-7 h-7" : "w-9 h-9";

  const renderForm = (t) => (
    <div className={isModal ? "space-y-1.5" : "space-y-2"}>
      <div className={cn("flex items-end", isModal ? "gap-2" : "gap-3")}>
        <button onClick={() => handlePhotoUpload(t.id)} className={cn(photoSize, "rounded-full bg-muted/60 border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 flex items-center justify-center shrink-0 overflow-hidden transition-colors")}>
          {t.photo ? <img src={t.photo} alt="" className="w-full h-full object-cover" /> : <Image className={isModal ? "w-3 h-3" : "w-4 h-4"} />}
        </button>
        <div className="flex-1 space-y-1">
          <Label className={labelCls}>Nom Prénom Métier Ville</Label>
          <Input value={t.accroche} onChange={(e) => dispatch({ type: "UPDATE_THERAPIST", payload: { id: t.id, updates: { accroche: e.target.value } } })} placeholder={`${contact.lastName || "Dupont"} ${contact.firstName || "Marie"} ${contact.profession || "Ostéopathe"} à ${contact.city || "Lyon"}`} className={inputH} />
        </div>
      </div>
      <div className="space-y-1">
        <Label className={labelCls}>Présentation</Label>
        {isModal ? (
          <textarea
            value={htmlToPlain(t.richTextPresentation)}
            onChange={(e) => dispatch({ type: "UPDATE_THERAPIST", payload: { id: t.id, updates: { richTextPresentation: plainToHtml(e.target.value) } } })}
            placeholder="Présentez-vous et votre approche thérapeutique..."
            rows={3}
            className="w-full text-[13px] text-color-1 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-color-2/30 focus:border-color-2/30 transition-all resize-none leading-relaxed"
          />
        ) : (
          <div className="[&_.tiptap]:!min-h-[80px] [&_.tiptap]:!max-h-[120px] [&_.tiptap]:overflow-y-auto [&_.ProseMirror]:!min-h-[80px] [&_.ProseMirror]:!max-h-[120px]">
            <RichTextEditor content={t.richTextPresentation} onChange={(html) => dispatch({ type: "UPDATE_THERAPIST", payload: { id: t.id, updates: { richTextPresentation: html } } })} placeholder="Présentez-vous et votre approche thérapeutique..." />
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label className={labelCls}>Durée</Label>
          <Input value={t.duration} onChange={(e) => dispatch({ type: "UPDATE_THERAPIST", payload: { id: t.id, updates: { duration: e.target.value } } })} placeholder="45 min" className={inputH} />
        </div>
        <div className="space-y-1">
          <Label className={labelCls}>Prix</Label>
          <Input value={t.price} onChange={(e) => dispatch({ type: "UPDATE_THERAPIST", payload: { id: t.id, updates: { price: e.target.value } } })} placeholder="60 €" className={inputH} />
        </div>
        <div className="space-y-1">
          <Label className={labelCls}>Remboursement</Label>
          <Input value={t.reimbursement} onChange={(e) => dispatch({ type: "UPDATE_THERAPIST", payload: { id: t.id, updates: { reimbursement: e.target.value } } })} placeholder="Mutuelle" className={inputH} />
        </div>
      </div>
      <div className="space-y-1">
        <Label className={labelCls}>Lien de réservation</Label>
        <Input value={t.bookingLink || ""} onChange={(e) => dispatch({ type: "UPDATE_THERAPIST", payload: { id: t.id, updates: { bookingLink: e.target.value } } })} placeholder="https://doctolib.fr/..." className={inputH} />
      </div>
    </div>
  );

  return (
    <div className={isModal ? "space-y-1.5" : "space-y-2"} style={{ animation: "tab-fade-in 0.3s ease" }}>
      {!isModal && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-0.5">Équipe du cabinet</h2>
            <p className="text-sm text-muted-foreground">Modifiez les informations de vos thérapeutes.</p>
          </div>
        </div>
      )}

      {/* Multi-therapist tabs */}
      {therapists.length > 1 && (
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
          {therapists.map((th, i) => (
            <button key={th.id} onClick={() => setEditingIdx(i)} className={cn("px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer", i === idx ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              {th.accroche?.split(" ").slice(0, 2).join(" ") || `Thérapeute ${i + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* Active form */}
      {therapists[idx] && renderForm(therapists[idx])}

      {/* CTA: Ajouter / Supprimer */}
      <div className="flex items-center gap-2">
        {therapists.length < 3 && (
          <button onClick={addTherapist} className={cn("flex items-center gap-1.5 rounded-xl border-2 border-dashed border-gray-200 text-muted-foreground hover:border-[#FC6D41]/40 hover:text-[#FC6D41] transition-colors cursor-pointer", isModal ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm")}>
            <Plus className="w-3.5 h-3.5" />
            Ajouter un thérapeute
          </button>
        )}
        {therapists.length > 1 && (
          <button onClick={() => removeTherapist(therapists[idx].id)} className={cn("flex items-center gap-1.5 rounded-xl text-red-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer", isModal ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm")}>
            <Trash2 className="w-3.5 h-3.5" />
            Supprimer
          </button>
        )}
      </div>
      {!isModal && (
        <button
          onClick={() => handleValidateSection("therapists")}
          className={cn("px-5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer", changedSections.has("therapists") ? "bg-[#FC6D41] text-white hover:bg-[#e55e35]" : "bg-gray-100 text-gray-400")}
        >
          {state.validatedSection === "therapists" ? "Enregistré !" : "Enregistrer"}
        </button>
      )}
    </div>
  );
}
