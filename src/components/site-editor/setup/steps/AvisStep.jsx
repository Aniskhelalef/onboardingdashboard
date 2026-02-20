'use client';

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { useSetup } from "../SetupContext";
import { REVIEW_CHANNELS } from "../constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function AvisStep() {
  const { state, dispatch, changedSections, handleValidateSection } = useSetup();
  const { reviewTemplates } = state.data;
  const [activeChannel, setActiveChannel] = useState("whatsapp");

  const ch = REVIEW_CHANNELS.find(c => c.id === activeChannel) || REVIEW_CHANNELS[0];
  const chTemplate = reviewTemplates[ch.id];
  const chMessage = chTemplate?.message || "";
  const chSubject = chTemplate?.subject || "";
  const chResolvedMsg = chMessage.replace(/\{link\}/g, reviewTemplates.googleLink || "[lien Google]");
  const chResolvedSubject = chSubject.replace(/\{link\}/g, reviewTemplates.googleLink || "[lien Google]");

  return (
    <div className="space-y-4" style={{ animation: "tab-fade-in 0.3s ease" }}>
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">Collecter des avis</h2>
        <p className="text-sm text-muted-foreground">Envoyez un message pré-rédigé après chaque consultation.</p>
      </div>

      {/* Google review link */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl flex-1 min-w-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <Input value={reviewTemplates.googleLink} onChange={(e) => dispatch({ type: "SET_REVIEW_GOOGLE_LINK", payload: e.target.value })} placeholder="https://g.page/r/votre-lien-avis" className="h-7 text-xs border-0 bg-transparent shadow-none px-0 focus-visible:ring-0" />
        </div>
      </div>

      {/* Channel tabs */}
      <div className="flex gap-1.5">
        {REVIEW_CHANNELS.map((channel) => {
          const Icon = channel.icon;
          const isActive = activeChannel === channel.id;
          return (
            <button key={channel.id} onClick={() => setActiveChannel(channel.id)} className={cn("flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer", isActive ? cn("text-white shadow-sm", channel.color) : "bg-gray-100 text-gray-500 hover:bg-gray-150")}>
              <Icon className="w-3.5 h-3.5" />
              {channel.label}
            </button>
          );
        })}
      </div>

      {/* Channel content */}
      <div className="space-y-2.5">
        {ch.hasSubject && (
          <div className="space-y-1">
            <Label className="text-xs">Objet</Label>
            <Input value={chSubject} onChange={(e) => dispatch({ type: "UPDATE_REVIEW_TEMPLATE", payload: { channel: ch.id, updates: { subject: e.target.value } } })} placeholder="Objet de l'email" className="h-8 text-sm" />
          </div>
        )}
        <div className="space-y-1">
          <Label className="text-xs">Message</Label>
          <Textarea value={chMessage} onChange={(e) => dispatch({ type: "UPDATE_REVIEW_TEMPLATE", payload: { channel: ch.id, updates: { message: e.target.value } } })} placeholder="Votre message..." className="text-sm min-h-[100px] resize-none" />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => window.open(ch.getUrl(chResolvedMsg, chResolvedSubject), "_blank")} className={cn("flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-white transition-colors cursor-pointer", ch.color)}>
            <ExternalLink className="w-3 h-3" />
            Envoyer via {ch.label}
          </button>
          <button onClick={() => handleValidateSection("reviewTemplates")} className={cn("px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer", changedSections.has("reviewTemplates") ? "bg-[#FC6D41] text-white hover:bg-[#e55e35]" : "bg-gray-100 text-gray-400")}>
            {state.validatedSection === "reviewTemplates" ? "Enregistré !" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
