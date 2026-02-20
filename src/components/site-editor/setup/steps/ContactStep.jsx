'use client';

import { useSetup } from "../SetupContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function ContactStep() {
  const { state, dispatch, changedSections, handleValidateSection } = useSetup();
  const { contact } = state.data;

  const update = (field, value) => dispatch({ type: "UPDATE_CONTACT", payload: { [field]: value } });

  return (
    <div className="space-y-4" style={{ animation: "tab-fade-in 0.3s ease" }}>
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">Informations de contact</h2>
        <p className="text-sm text-muted-foreground">Vos informations personnelles affichées sur votre site.</p>
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Prénom</Label>
            <Input value={contact.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="Jean" className="h-10" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Nom</Label>
            <Input value={contact.lastName} onChange={(e) => update("lastName", e.target.value)} placeholder="Dupont" className="h-10" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Métier</Label>
            <Input value={contact.profession} onChange={(e) => update("profession", e.target.value)} placeholder="Ostéopathe D.O" className="h-10" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Ville</Label>
            <Input value={contact.city} onChange={(e) => update("city", e.target.value)} placeholder="Lyon" className="h-10" />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Téléphone</Label>
          <Input value={contact.phoneNumber} onChange={(e) => update("phoneNumber", e.target.value)} placeholder="06 12 34 56 78" className="h-10" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Lien de réservation</Label>
          <Input value={contact.appointmentLink} onChange={(e) => update("appointmentLink", e.target.value)} placeholder="https://doctolib.fr/..." className="h-10" />
          <p className="text-sm text-muted-foreground">Doctolib, Calendly, ou tout autre service</p>
        </div>
      </div>
      <button
        onClick={() => handleValidateSection("contact")}
        className={cn("px-5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer", changedSections.has("contact") ? "bg-[#FC6D41] text-white hover:bg-[#e55e35]" : "bg-gray-100 text-gray-400")}
      >
        {state.validatedSection === "contact" ? "Enregistré !" : "Enregistrer"}
      </button>
    </div>
  );
}
