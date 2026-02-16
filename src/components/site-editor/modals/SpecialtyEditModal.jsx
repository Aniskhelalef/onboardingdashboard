import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const iconOptions = ["🦴", "💪", "🧠", "🫁", "🏃", "🤕", "👁️", "🦷", "🫀", "🦵", "👂", "🤰", "🤚", "👶", "🧘", "💆", "🩺", "⚡"];

const SpecialtyEditModal = ({
  open,
  onOpenChange,
  specialty,
  onSave,
}) => {
  const [editedSpecialty, setEditedSpecialty] = useState(null);

  useEffect(() => {
    if (open && specialty) {
      setEditedSpecialty({ ...specialty });
    }
  }, [open, specialty]);

  if (!editedSpecialty) return null;

  const handleChange = (field, value) => {
    setEditedSpecialty({ ...editedSpecialty, [field]: value });
  };

  const handleSave = () => {
    onSave(editedSpecialty);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="pb-4">
            {/* Specialty preview card */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-background shadow-md border border-border/50 flex items-center justify-center text-3xl">
                {editedSpecialty.icon}
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-xl truncate">
                  {editedSpecialty.title || "Sans titre"}
                </DialogTitle>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Page de spécialité • Menu • Accueil</span>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Icon selector */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Icône
              </Label>
              <div className="flex flex-wrap gap-2">
                {iconOptions.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => handleChange("icon", icon)}
                    className={cn(
                      "w-11 h-11 rounded-xl text-xl flex items-center justify-center transition-all",
                      editedSpecialty.icon === icon
                        ? "bg-primary/15 ring-2 ring-primary shadow-sm"
                        : "bg-muted/50 hover:bg-muted border border-transparent hover:border-border"
                    )}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Titre de la spécialité
              </Label>
              <Input
                value={editedSpecialty.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="ex: Douleurs du rachis"
                className="h-12 text-base rounded-xl"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Description courte
              </Label>
              <Textarea
                value={editedSpecialty.desc}
                onChange={(e) => handleChange("desc", e.target.value)}
                placeholder="ex: Cervicalgies, dorsalgies, lombalgies..."
                rows={3}
                className="rounded-xl resize-none"
              />
            </div>
          </div>

          <DialogFooter className="border-t pt-4 mt-6">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={!editedSpecialty.title.trim()}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
    </Dialog>
  );
};

export default SpecialtyEditModal;
