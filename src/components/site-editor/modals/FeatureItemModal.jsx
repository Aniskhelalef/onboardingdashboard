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
import { FEATURE_ICONS } from "@/constants/icons";

const FeatureItemModal = ({
  open,
  onOpenChange,
  item,
  onSave,
  onDelete,
  isNew = false,
}) => {
  const [icon, setIcon] = useState("🎓");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [hidden, setHidden] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (open && item) {
      setIcon(item.icon);
      setTitle(item.title);
      setDesc(item.desc);
      setHidden(item.hidden || false);
    } else if (open && isNew) {
      setIcon("🎓");
      setTitle("");
      setDesc("");
      setHidden(false);
    }
  }, [open, item, isNew]);

  const handleSave = () => {
    if (!title.trim()) return;

    onSave({
      id: item?.id || Date.now().toString(),
      icon,
      title: title.trim(),
      desc: desc.trim(),
      hidden,
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
          <FloatingDialogHeader
            title={isNew ? "Nouvel élément" : "Modifier l'élément"}
          />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Icône</Label>
              <div className="flex flex-wrap gap-1.5">
                {FEATURE_ICONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIcon(emoji)}
                    className={`w-8 h-8 text-base rounded-lg border-2 transition-all ${
                      icon === emoji
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Titre</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: 6 années d'expérience"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Description courte..."
                rows={2}
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
            <AlertDialogTitle>Supprimer cet élément ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'élément sera définitivement supprimé.
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

export default FeatureItemModal;
