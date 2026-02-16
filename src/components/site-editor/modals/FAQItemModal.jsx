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

const FAQItemModal = ({
  open,
  onOpenChange,
  item,
  onSave,
  onDelete,
  isNew = false,
}) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (open && item) {
      setQuestion(item.question);
      setAnswer(item.answer);
    } else if (open && isNew) {
      setQuestion("");
      setAnswer("");
    }
  }, [open, item, isNew]);

  const handleSave = () => {
    if (!question.trim()) return;

    onSave({
      id: item?.id || Date.now().toString(),
      question: question.trim(),
      answer: answer.trim(),
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
            title={isNew ? "Nouvelle question" : "Modifier la question"}
          />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Question</Label>
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ex: Combien de temps dure une séance ?"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Réponse</Label>
              <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Rédigez votre réponse..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="flex-1">
                Annuler
              </Button>
              <Button size="sm" onClick={handleSave} disabled={!question.trim()} className="flex-1">
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
            <AlertDialogTitle>Supprimer cette question ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La question sera définitivement supprimée.
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

export default FAQItemModal;
