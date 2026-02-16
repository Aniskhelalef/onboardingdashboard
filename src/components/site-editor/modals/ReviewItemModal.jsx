import {
  Dialog,
  FloatingDialogContent,
  FloatingDialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Star } from "lucide-react";
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

const ReviewItemModal = ({
  open,
  onOpenChange,
  review,
  onSave,
  onDelete,
  isNew = false,
}) => {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [date, setDate] = useState("");
  const [text, setText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (open && review) {
      setName(review.name);
      setRating(review.rating);
      setDate(review.date);
      setText(review.text);
    } else if (open && isNew) {
      setName("");
      setRating(5);
      setDate("Il y a 1 semaine");
      setText("");
    }
  }, [open, review, isNew]);

  const handleSave = () => {
    if (!name.trim() || !text.trim()) return;

    onSave({
      id: review?.id || Date.now().toString(),
      name: name.trim(),
      rating,
      date: date.trim(),
      text: text.trim(),
      hidden: review?.hidden || false,
    });
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (review && onDelete) {
      onDelete(review.id);
      setShowDeleteConfirm(false);
      onOpenChange(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <FloatingDialogContent>
          <FloatingDialogHeader
            title={isNew ? "Nouvel avis" : "Modifier l'avis"}
          />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Nom</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Marie Dupont"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Note</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Date</Label>
              <Input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="Ex: Il y a 2 semaines"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Commentaire</Label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Rédigez le commentaire..."
                rows={4}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="flex-1">
                Annuler
              </Button>
              <Button size="sm" onClick={handleSave} disabled={!name.trim() || !text.trim()} className="flex-1">
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
            <AlertDialogTitle>Supprimer cet avis ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'avis sera définitivement supprimé.
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

export default ReviewItemModal;
