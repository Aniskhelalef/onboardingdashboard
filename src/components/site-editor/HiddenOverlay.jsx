import { EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

const HiddenOverlay = ({ variant = "full", onClick, className }) => {
  if (variant === "compact") {
    return (
      <div
        onClick={onClick}
        className={cn(
          "absolute inset-0 flex items-center justify-center cursor-pointer",
          className
        )}
      >
        <div className="w-10 h-10 rounded-full bg-muted/80 backdrop-blur-sm flex items-center justify-center">
          <EyeOff className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "absolute inset-0 bg-foreground/60 flex items-center justify-center transition-colors cursor-pointer",
        onClick && "hover:bg-foreground/70",
        className
      )}
      style={{ borderRadius: 'var(--page-radius, 12px)' }}
    >
      <div className="flex items-center gap-2 text-background font-medium">
        <EyeOff className="w-5 h-5" />
        <span>Masqué</span>
      </div>
    </div>
  );
};

export default HiddenOverlay;
