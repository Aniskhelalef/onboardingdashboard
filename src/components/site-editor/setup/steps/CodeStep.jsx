'use client';

import { useState } from "react";
import { Plus, Trash2, ChevronDown, Check, Code } from "lucide-react";
import { useSetup } from "../SetupContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function CodeStep() {
  const { state, dispatch, changedSections, handleValidateSection } = useSetup();
  const { customCode } = state.data;
  const [expandedCodes, setExpandedCodes] = useState(new Set());

  const toggleExpanded = (id) => {
    setExpandedCodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const addCode = () => {
    const newId = Date.now().toString();
    dispatch({ type: "ADD_CUSTOM_CODE", payload: { id: newId, name: "", placement: "head", code: "" } });
    setExpandedCodes(new Set([newId]));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-1">Code personnalisé</h2>
          <p className="text-sm text-muted-foreground">Google Tag Manager, widgets de chat, scripts analytics...</p>
        </div>
        <button onClick={() => handleValidateSection("customCode")} disabled={!changedSections.has("customCode")} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all shrink-0", state.validatedSection === "customCode" ? "bg-green-500 text-white" : changedSections.has("customCode") ? "bg-green-500 hover:bg-green-600 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed")}>
          <Check className="w-4 h-4" />
          {state.validatedSection === "customCode" ? "Validé !" : "Valider"}
        </button>
      </div>

      <div className="space-y-3">
        {customCode.map((snippet, index) => {
          const isExpanded = expandedCodes.has(snippet.id);
          const displayName = snippet.name || `Code ${index + 1}`;
          return (
            <div key={snippet.id} className="bg-gray-50 rounded-xl overflow-hidden">
              <button onClick={() => toggleExpanded(snippet.id)} className="w-full p-2.5 flex items-center justify-between hover:bg-muted/60 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <Code className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm text-foreground">{displayName}</p>
                    <p className="text-sm text-muted-foreground">{snippet.placement === "head" ? "<head>" : "</body>"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span onClick={(e) => { e.stopPropagation(); dispatch({ type: "REMOVE_CUSTOM_CODE", payload: snippet.id }); }} className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </span>
                  <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                </div>
              </button>
              {isExpanded && (
                <div className="px-3 pb-3 space-y-2 border-t border-border/50">
                  <div className="space-y-1 pt-2">
                    <Label className="text-xs">Nom</Label>
                    <Input value={snippet.name} onChange={(e) => dispatch({ type: "UPDATE_CUSTOM_CODE", payload: { id: snippet.id, updates: { name: e.target.value } } })} placeholder="Ex: Google Tag Manager, Chat widget..." className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Emplacement</Label>
                    <div className="flex gap-1.5">
                      <button onClick={() => dispatch({ type: "UPDATE_CUSTOM_CODE", payload: { id: snippet.id, updates: { placement: "head" } } })} className={cn("flex-1 py-1 px-2 rounded-lg text-xs font-medium transition-all border", snippet.placement === "head" ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-transparent hover:border-muted-foreground/30")}>
                        &lt;head&gt;
                      </button>
                      <button onClick={() => dispatch({ type: "UPDATE_CUSTOM_CODE", payload: { id: snippet.id, updates: { placement: "body" } } })} className={cn("flex-1 py-1 px-2 rounded-lg text-xs font-medium transition-all border", snippet.placement === "body" ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-transparent hover:border-muted-foreground/30")}>
                        &lt;/body&gt;
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Code</Label>
                    <Textarea value={snippet.code} onChange={(e) => dispatch({ type: "UPDATE_CUSTOM_CODE", payload: { id: snippet.id, updates: { code: e.target.value } } })} placeholder="<!-- Collez votre code ici -->" className="font-mono text-xs min-h-[60px]" />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <button onClick={addCode} className={cn("w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-colors", customCode.length === 0 ? "border-2 border-dashed border-primary/30 text-primary hover:border-primary/50 hover:bg-primary/5" : "border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary/50 hover:text-primary")}>
          <Plus className="w-4 h-4" />
          <span className="text-sm">Ajouter un code</span>
        </button>

        {customCode.length === 0 && (
          <p className="text-sm text-muted-foreground text-center">Cette étape est optionnelle. Vous pourrez ajouter du code personnalisé plus tard.</p>
        )}
      </div>
    </div>
  );
}
