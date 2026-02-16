import {
  Dialog,
  FloatingDialogContent,
  FloatingDialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

const SessionStepItemModal = ({
  open,
  onOpenChange,
  item,
  onSave,
  onDelete,
  isNew = false,
  stepNumber = 1,
}) => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (open && item) {
      setTitle(item.title);
      setDesc(item.desc);
    } else if (open && isNew) {
      setTitle("");
      setDesc("");
    }
  }, [open, item, isNew]);

  const handleSave = () => {
    if (!title.trim()) return;

    onSave({
      id: item?.id || Date.now().toString(),
      num: item?.num || stepNumber,
      title: title.trim(),
      desc: desc.trim(),
    });
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (item && onDelete) {
      onDelete(item.id);
      setShowDeleteConfirm(false);
      onOpenChange(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <FloatingDialogContent>
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {item?.num || stepNumber}
            </span>
            <h3 className="font-semibold text-foreground">
              {isNew ? "Nouvelle étape" : "Modifier l'étape"}
            </h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Titre de l'étape</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Accueil et bilan"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Décrivez cette étape..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="flex-1">
                Annuler
              </Button>
              <Button size="sm" onClick={handleSave} disabled={!title.trim()} className="flex-1">
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
            <AlertDialogTitle>Supprimer cette étape ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'étape sera définitivement supprimée.
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

export default SessionStepItemModal;
