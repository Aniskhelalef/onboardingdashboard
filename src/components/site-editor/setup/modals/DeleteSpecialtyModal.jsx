'use client';

import { useState } from "react";
import { useSetup } from "../SetupContext";
import { SPECIALTY_EMOJIS } from "../constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function DeleteSpecialtyModal({ specialty, onClose }) {
  const { dispatch } = useSetup();
  const [showReplace, setShowReplace] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("✨");
  const [isCreating, setIsCreating] = useState(false);
  const [created, setCreated] = useState(null);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setIsCreating(true);
    await new Promise(r => setTimeout(r, 2000));
    const newSpec = { id: Date.now().toString(), icon: newIcon, title: newName.trim(), description: `Page spécialité pour ${newName.trim()}` };
    dispatch({ type: "REPLACE_SPECIALTY", payload: { oldId: specialty.id, newSpec } });
    setIsCreating(false);
    setCreated(newName.trim());
  };

  const handleFinish = () => onClose();

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[200]" onClick={onClose} />
      <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
          {!showReplace && !created && (
            <>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center"><span className="text-3xl">{"⚠️"}</span></div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Supprimer cette spécialité ?</h3>
                <p className="text-muted-foreground text-sm">Attention : la page de spécialité <strong>"{specialty.title}"</strong> va être supprimée.</p>
                <p className="text-muted-foreground text-sm mt-2">Les articles associés seront redirigés vers votre page d'accueil.</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={onClose}>Non</Button>
                <Button variant="destructive" className="flex-1" onClick={() => setShowReplace(true)}>Oui</Button>
              </div>
            </>
          )}
          {showReplace && !isCreating && !created && (
            <>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Nouvelle spécialité</h3>
                <p className="text-muted-foreground text-sm mb-4">Choisissez une icône et un nom pour votre nouvelle spécialité.</p>
                <div className="grid grid-cols-10 gap-1 mb-4 p-2 bg-gray-50 rounded-xl">
                  {SPECIALTY_EMOJIS.map((emoji) => (
                    <button key={emoji} onClick={() => setNewIcon(emoji)} className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-white transition-colors cursor-pointer", newIcon === emoji && "bg-white ring-1 ring-primary/30 shadow-sm")}>{emoji}</button>
                  ))}
                </div>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex: Mal de dos, Migraines, Stress..." autoFocus />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={onClose}>Annuler</Button>
                <Button className="flex-1" onClick={handleCreate} disabled={!newName.trim()}>Valider</Button>
              </div>
            </>
          )}
          {isCreating && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center animate-pulse"><span className="text-3xl">{"⏳"}</span></div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Création en cours...</h3>
              <p className="text-muted-foreground text-sm">Veuillez patienter le temps que l'on crée la page "{newName}".</p>
            </div>
          )}
          {created && (
            <>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center"><span className="text-3xl">{"\ud83c\udf89"}</span></div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Félicitations !</h3>
                <p className="text-muted-foreground text-sm">La page <strong>"{created}"</strong> a été créée avec succès.</p>
              </div>
              <Button className="w-full" onClick={handleFinish}>Valider la page pour la publier</Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
