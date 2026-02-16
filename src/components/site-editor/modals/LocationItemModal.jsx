import {
  Dialog,
  FloatingDialogContent,
  FloatingDialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const LocationItemModal = ({
  open,
  onOpenChange,
  location,
  onSave,
  onDelete,
  isNew = false,
}) => {
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [icon, setIcon] = useState("📍");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (open && location) {
      setTitle(location.title);
      setAddress(location.address);
      setIcon(location.icon || "📍");
    } else if (open && isNew) {
      setTitle("");
      setAddress("");
      setIcon("📍");
    }
  }, [open, location, isNew]);

  const handleSave = () => {
    if (!title.trim() || !address.trim()) return;

    onSave({
      id: location?.id || Date.now().toString(),
      title: title.trim(),
      address: address.trim(),
      icon: icon || "📍",
    });
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (location && onDelete) {
      onDelete(location.id);
      setShowDeleteConfirm(false);
      onOpenChange(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <FloatingDialogContent>
          <FloatingDialogHeader
            title={isNew ? "Nouveau lieu" : "Modifier le lieu"}
          />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Icône</Label>
              <Input
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="Ex: 📍"
                maxLength={2}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Titre</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Cabinet principal"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Adresse</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex: 123 Rue de la Paix, 75001 Paris"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="flex-1">
                Annuler
              </Button>
              <Button size="sm" onClick={handleSave} disabled={!title.trim() || !address.trim()} className="flex-1">
                {isNew ? "Ajouter" : "Enregistrer"}
              </Button>
            </div>
            {!isNew && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            )}
          </div>
        </FloatingDialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="z-[200]">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce lieu ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le lieu sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LocationItemModal;
