import {
  Dialog,
  FloatingDialogContent,
  FloatingDialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

const BadgeItemModal = ({
  open,
  onOpenChange,
  badge,
  onSave,
  title = "Modifier le badge",
}) => {
  const [value, setValue] = useState("");
  const [label, setLabel] = useState("");
  const [icon, setIcon] = useState("");

  useEffect(() => {
    if (open && badge) {
      setValue(badge.value);
      setLabel(badge.label);
      setIcon(badge.icon);
    }
  }, [open, badge]);

  const handleSave = () => {
    if (!value.trim() || !label.trim()) return;

    onSave({
      value: value.trim(),
      label: label.trim(),
      icon: icon || "⭐",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FloatingDialogContent>
        <FloatingDialogHeader title={title} />

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Icône</Label>
            <Input
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="Ex: ⭐ ou 😊"
              maxLength={2}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Valeur</Label>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Ex: 5/5 ou +900"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Label</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex: Basé sur 73 avis Google"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="flex-1">
            Annuler
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!value.trim() || !label.trim()} className="flex-1">
            Enregistrer
          </Button>
        </div>
      </FloatingDialogContent>
    </Dialog>
  );
};

export default BadgeItemModal;
