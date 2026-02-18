import { X, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useCallback, useState } from "react";

export const colorPalettes = [
  {
    id: "warm",
    name: "Chaleureux",
    colors: ["#C4A77D", "#E8DDD4", "#FAF7F5", "#5C4A3D"],
    accent: "36 35% 63%",
    accentDark: "36 35% 45%",
    background: "30 30% 97%",
    heroBg: "30 25% 92%",
    text: "30 25% 25%",
    textMuted: "30 15% 50%"
  },
  {
    id: "ocean",
    name: "Océan",
    colors: ["#7EB8DA", "#B8D4E8", "#F0F7FB", "#3D6B8C"],
    accent: "200 55% 67%",
    accentDark: "200 45% 40%",
    background: "200 50% 98%",
    heroBg: "200 45% 93%",
    text: "200 40% 25%",
    textMuted: "200 20% 50%"
  },
  {
    id: "forest",
    name: "Forêt",
    colors: ["#7EB897", "#B8D8C8", "#F0F8F4", "#3D6B52"],
    accent: "145 35% 60%",
    accentDark: "145 35% 35%",
    background: "145 40% 98%",
    heroBg: "145 35% 93%",
    text: "145 35% 25%",
    textMuted: "145 20% 50%"
  },
  {
    id: "sunset",
    name: "Coucher de soleil",
    colors: ["#E8A87C", "#F5D4C0", "#FDF8F5", "#A65D3F"],
    accent: "25 70% 70%",
    accentDark: "25 55% 45%",
    background: "25 60% 98%",
    heroBg: "25 55% 93%",
    text: "25 45% 25%",
    textMuted: "25 25% 50%"
  },
  {
    id: "lavender",
    name: "Lavande",
    colors: ["#B4A7D6", "#D8D0EB", "#F8F6FC", "#6B5B95"],
    accent: "260 40% 75%",
    accentDark: "260 35% 47%",
    background: "260 50% 98%",
    heroBg: "260 45% 93%",
    text: "260 35% 25%",
    textMuted: "260 20% 50%"
  },
  {
    id: "minimal",
    name: "Minimal",
    colors: ["#6B7280", "#9CA3AF", "#F9FAFB", "#374151"],
    accent: "220 9% 46%",
    accentDark: "220 13% 26%",
    background: "220 14% 98%",
    heroBg: "220 12% 93%",
    text: "220 13% 20%",
    textMuted: "220 9% 46%"
  },
];

export const typographyPairs = [
  { id: "modern", display: "Inter", body: "Inter", label: "Moderne", googleFont: "Inter:wght@400;600;700" },
  { id: "classic", display: "Playfair Display", body: "Inter", label: "Classique", googleFont: "Playfair+Display:wght@400;600;700" },
  { id: "elegant", display: "Cormorant Garamond", body: "Lato", label: "Élégant", googleFont: "Cormorant+Garamond:wght@400;600;700" },
  { id: "friendly", display: "Poppins", body: "Open Sans", label: "Convivial", googleFont: "Poppins:wght@400;600;700" },
];

export const radiusOptions = [
  { id: "none", value: "0px", label: "Aucun" },
  { id: "small", value: "6px", label: "Petit" },
  { id: "medium", value: "12px", label: "Moyen" },
  { id: "large", value: "20px", label: "Grand" },
  { id: "full", value: "9999px", label: "Arrondi" },
];

const StylePanel = ({ onClose, settings, onSettingsChange, logo, onLogoChange, onComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handlePaletteChange = (paletteId) => {
    onSettingsChange({ ...settings, palette: paletteId });
  };

  const handleTypographyChange = (typographyId) => {
    onSettingsChange({ ...settings, typography: typographyId });
  };

  const handleRadiusChange = (radiusId) => {
    onSettingsChange({ ...settings, radius: radiusId });
  };

  const handleFileUpload = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result;
      onLogoChange?.(dataUrl);
    };
    reader.readAsDataURL(file);
  }, [onLogoChange]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInputChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  return (
    <div className="w-72 bg-card rounded-xl shadow-xl p-3.5 flex flex-col gap-3 relative z-[50]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Style du site</h3>
        <button
          onClick={onClose}
          className="w-5 h-5 rounded-full hover:bg-accent flex items-center justify-center cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Color Palettes */}
      <div>
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Couleurs</span>
        <div className="grid grid-cols-3 gap-1.5">
          {colorPalettes.map((palette) => (
            <button
              key={palette.id}
              onClick={() => handlePaletteChange(palette.id)}
              className={cn(
                "p-1.5 rounded-lg border-2 transition-all flex flex-col items-center gap-1 cursor-pointer",
                settings.palette === palette.id
                  ? "border-primary bg-primary/5"
                  : "border-transparent bg-muted/50 hover:border-muted-foreground/30"
              )}
            >
              <div className="flex gap-0.5">
                {palette.colors.map((color, i) => (
                  <div key={i} className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: color }} />
                ))}
              </div>
              <span className="text-[10px] font-medium leading-tight">{palette.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div>
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Typo</span>
        <div className="grid grid-cols-4 gap-1.5">
          {typographyPairs.map((typo) => {
            const fontLink = `https://fonts.googleapis.com/css2?family=${typo.googleFont}&display=swap`;
            return (
              <button
                key={typo.id}
                onClick={() => handleTypographyChange(typo.id)}
                className={cn(
                  "p-1.5 rounded-lg border-2 transition-all flex flex-col items-center cursor-pointer",
                  settings.typography === typo.id
                    ? "border-primary bg-primary/5"
                    : "border-transparent bg-muted/50 hover:border-muted-foreground/30"
                )}
              >
                <link rel="stylesheet" href={fontLink} />
                <div className="text-base font-semibold leading-tight" style={{ fontFamily: `"${typo.display}", serif` }}>Aa</div>
                <span className="text-[9px] text-muted-foreground leading-tight mt-0.5">{typo.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Border Radius */}
      <div>
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Arrondis</span>
        <div className="flex gap-1">
          {radiusOptions.map((radius) => (
            <button
              key={radius.id}
              onClick={() => handleRadiusChange(radius.id)}
              className={cn(
                "flex-1 py-1.5 flex flex-col items-center gap-1 border-2 transition-all rounded-lg cursor-pointer",
                settings.radius === radius.id
                  ? "border-primary bg-primary/5"
                  : "border-transparent bg-muted/50 hover:border-muted-foreground/30"
              )}
            >
              <div className="w-6 h-4 bg-foreground/20" style={{ borderRadius: radius.value }} />
              <span className="text-[9px] text-muted-foreground">{radius.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Logo */}
      <div>
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Logo</span>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInputChange} className="hidden" />
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "border-2 border-dashed rounded-lg p-2 text-center cursor-pointer transition-colors",
            isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          {logo ? (
            <img src={logo} alt="Logo" className="max-h-8 mx-auto rounded object-contain" />
          ) : (
            <div className="flex items-center justify-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground">Glissez ou cliquez</p>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      {onComplete && (
        <button
          onClick={onComplete}
          className="w-full px-4 py-2 rounded-lg bg-green-500 text-white text-xs font-medium hover:bg-green-600 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
        >
          Terminer
        </button>
      )}
    </div>
  );
};

export default StylePanel;
