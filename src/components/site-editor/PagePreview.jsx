import { Star, ChevronDown, Phone, ChevronRight, Shield, ExternalLink, EyeOff, Monitor, Crop, Image as ImageIcon, Move } from "lucide-react";
import HiddenOverlay from "./HiddenOverlay";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const defaultRatingBadge = { value: "5/5", label: "Basé sur 73 avis Google", icon: "⭐" };
const defaultPatientsBadge = { value: "+900", label: "Patients Aidés", icon: "😊" };
const defaultFeatures = [];
const defaultPainTypes = [];
const defaultSessionSteps = [];
const defaultFAQItems = [];
const defaultGlobalSettings = {
  firstName: "Théo",
  lastName: "Gorbinkoff",
  profession: "Ostéopathe D.O",
  city: "Lunel",
  appointmentLink: "",
  phoneNumber: "06 25 30 30 30",
};
const defaultHeroImage = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop";

const defaultReviews = [
  { id: "1", name: "Jeanette Scharff", rating: 5, date: "Il y a 2 semaines", text: "Je suis très contente d'avoir trouvé Ambre! Elle est à l'écoute de vos maux et répond à toutes vos questions, très douce, s'adapte a chacun et analyse..." },
  { id: "2", name: "Shanna Marinas", rating: 5, date: "Il y a 3 mois", text: "Je mets 5 étoiles sans hésiter. Ambre est géniale, douce et à l'écoute. Elle me suit depuis maintenant 2 ans et je la recommande vivement !" },
  { id: "3", name: "Guillaume Mérignac", rating: 5, date: "Il y a 1 mois", text: "Je pratique le football de manière intensive et suite à des douleurs répétitives aux ischio, je suis allé voir Ambre..." },
  { id: "4", name: "Marie Dupont", rating: 5, date: "Il y a 1 semaine", text: "Excellente prise en charge, très professionnelle et à l'écoute. Je recommande vivement pour tous vos problèmes de dos !" },
  { id: "5", name: "Pierre Martin", rating: 5, date: "Il y a 2 mois", text: "Après plusieurs séances, mes douleurs chroniques au niveau lombaire ont considérablement diminué. Merci beaucoup !" },
  { id: "6", name: "Sophie Laurent", rating: 5, date: "Il y a 3 semaines", text: "Un accompagnement personnalisé et des conseils précieux. Je me sens enfin comprise dans mes douleurs quotidiennes." },
  { id: "7", name: "Thomas Bernard", rating: 5, date: "Il y a 4 mois", text: "En tant que sportif, j'avais besoin d'un suivi régulier. Les résultats sont vraiment au rendez-vous, merci !" },
  { id: "8", name: "Camille Rousseau", rating: 5, date: "Il y a 5 jours", text: "Première consultation très rassurante. Les explications sont claires et le traitement adapté à mes besoins." },
  { id: "9", name: "Lucas Petit", rating: 5, date: "Il y a 6 semaines", text: "Je consulte régulièrement depuis 1 an et je ne peux plus m'en passer. Un vrai professionnel de confiance !" },
];

const defaultSessionInfo = {
  duration: "45 minutes en moyenne",
  price: "60 € Chèque ou espèces",
  reimbursement: "Jusqu'à 85% des mutuelles",
};

const navItems = [
  { label: "Motifs", anchor: "motifs" },
  { label: "À propos", anchor: "a-propos" },
  { label: "Avis", anchor: "avis" },
  { label: "Déroulement", anchor: "deroulement" },
  { label: "Questions", anchor: "questions" },
  { label: "Contact", anchor: "contact" },
];

const PagePreview = ({
  content,
  viewMode,
  isPreviewMode = false,
  locations = [],
  ratingBadge = defaultRatingBadge,
  patientsBadge = defaultPatientsBadge,
  features = defaultFeatures,
  painTypes = defaultPainTypes,
  sessionSteps = defaultSessionSteps,
  faqItems = defaultFAQItems,
  globalSettings = defaultGlobalSettings,
  heroImage = defaultHeroImage,
  aboutImage = "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&h=400&fit=crop",
  sessionInfo = defaultSessionInfo,
  reviews = defaultReviews,
  logo,
  isGoogleConnected = false,
  googleProfileName,
  googleProfilePhoto,
  onLocationClick,
  onLogoClick,
  onRatingClick,
  onPatientsClick,
  onFeatureClick,
  onPainTypeClick,
  onSessionStepClick,
  onFAQClick,
  onCTAClick,
  onGlobalSettingsClick,
  onHeroImageClick,
  onHeroImageUpload,
  onHeroImageCrop,
  onHeroImagePosition,
  heroImagePosition = { x: 50, y: 50 },
  onAboutSectionClick,
  onReviewsClick,
  onReviewClick,
  onConnectGoogleClick,
  onSessionInfoClick,
  onReviewToggleVisibility,
  onNextTherapist,
  therapistCount = 0,
  onTherapistImageUpload,
  onTherapistImageCrop,
  onTherapistImagePosition,
  therapistImagePosition = { x: 50, y: 50 },
  isProofreadingActive = false,
  proofreadingElementId,
  onProofreadingElementClick,
  onInlineTextChange,
  clickPosition,
}) => {

  // Derive a context-specific placeholder from the field path
  const getPlaceholder = (field) => {
    if (field.includes("firstName")) return "Prénom";
    if (field.includes("lastName")) return "Nom";
    if (field.includes("phoneNumber")) return "Téléphone";
    if (field.includes("profession")) return "Profession";
    if (field.includes("city")) return "Ville";
    if (field.includes(".question")) return "Question";
    if (field.includes(".answer")) return "Réponse";
    if (field.includes(".address")) return "Adresse";
    if (field.includes(".icon") || field.includes("Icon")) return "Icône";
    if (field.includes(".title") && !field.includes("Section")) return "Titre";
    if (field.includes(".desc")) return "Description";
    if (field.includes(".value")) return "Valeur";
    if (field.includes(".label")) return "Label";
    if (field.includes("SectionSubtitle") || field.includes("Subtitle") || field.includes("subtitle")) return "Sous-titre";
    if (field.includes("SectionTitle") || field.includes("Title") || field.includes("faqSectionTitle")) return "Titre de la section";
    if (field.includes("Paragraph")) return "Paragraphe";
    if (field.includes("Cta") || field.includes("cta")) return "Texte du bouton";
    if (field.includes("duration")) return "Durée";
    if (field.includes("price")) return "Tarif";
    if (field.includes("reimbursement")) return "Remboursement";
    if (field.includes("LinkText")) return "Texte du lien";
    return "Texte";
  };

  // Check if a value is visually empty (strips HTML tags, entities, whitespace)
  const isEmptyValue = (v) => {
    if (!v) return true;
    const stripped = v.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    return stripped.length === 0;
  };

  // Character limits per field (~10% above template defaults)
  const CHAR_LIMITS = {
    "content.title": 40,
    "content.subtitle": 110,
    "content.ctaPrimary": 35,
    "content.ctaSecondary": 25,
    "ratingBadge.value": 6,
    "ratingBadge.label": 25,
    "patientsBadge.value": 6,
    "patientsBadge.label": 25,
    "content.aboutSectionSubtitle": 40,
    "content.aboutSectionTitle": 50,
    "content.aboutRichTextPresentation": 600,
    "content.aboutSectionCta": 25,
    "content.sessionInfoSectionTitle": 30,
    "content.sessionInfoSectionSubtitle": 30,
    "sessionInfo.duration": 12,
    "sessionInfo.price": 12,
    "sessionInfo.reimbursement": 40,
    "content.sessionDurationLabel": 25,
    "content.sessionPriceLabel": 20,
    "content.sessionReimbursementLabel": 20,
    "content.specialtiesSectionTitle": 50,
    "content.specialtiesSectionSubtitle": 80,
    "content.stepsSectionTitle": 30,
    "content.stepsSectionSubtitle": 30,
    "content.reviewsSectionTitle": 35,
    "content.reviewsSectionSubtitle": 20,
    "content.faqSectionTitle": 25,
  };

  const getCharLimit = (field) => {
    if (CHAR_LIMITS[field]) return CHAR_LIMITS[field];
    if (/^features\[\d+\]\.title$/.test(field)) return 30;
    if (/^features\[\d+\]\.desc$/.test(field)) return 50;
    if (/^painTypes\[\d+\]\.title$/.test(field)) return 25;
    if (/^painTypes\[\d+\]\.desc$/.test(field)) return 110;
    if (/^sessionSteps\[\d+\]\.title$/.test(field)) return 30;
    if (/^sessionSteps\[\d+\]\.desc$/.test(field)) return 70;
    if (/^faqItems\[\d+\]\.question$/.test(field)) return 60;
    if (/^faqItems\[\d+\]\.answer$/.test(field)) return 350;
    if (/^locations\[\d+\]\.title$/.test(field)) return 35;
    if (/^locations\[\d+\]\.address$/.test(field)) return 80;
    return undefined;
  };

  // Helper to make text editable when highlighted
  const makeEditable = (elementId, field, value, autoFocus = false, multiline = false) => {
    const isActive = proofreadingElementId === elementId;
    const placeholder = getPlaceholder(field);

    // When not active, still render HTML content properly
    if (!isActive || !onInlineTextChange) {
      const wrapStyle = { overflowWrap: 'break-word', wordBreak: 'break-word' };
      if (isEmptyValue(value)) {
        return <span className="opacity-40" style={wrapStyle}>{placeholder}</span>;
      }
      // Check if value contains HTML tags
      if (value.includes('<') || value.includes('&')) {
        return <span style={wrapStyle} dangerouslySetInnerHTML={{ __html: value }} />;
      }
      return <span style={wrapStyle}>{value}</span>;
    }

    const limit = getCharLimit(field);

    return (
      <span
        contentEditable
        suppressContentEditableWarning
        ref={(el) => {
          if (!el || document.activeElement === el) return;

          // Check if click was inside THIS specific field
          if (clickPosition) {
            // If we have a specific target element, only focus if this is that element
            if (clickPosition.targetElement) {
              if (el !== clickPosition.targetElement) {
                return; // This is not the clicked element, skip it
              }
            } else {
              // No specific target, use bounding box check
              const rect = el.getBoundingClientRect();
              if (
                !(clickPosition.x >= rect.left && clickPosition.x <= rect.right &&
                  clickPosition.y >= rect.top && clickPosition.y <= rect.bottom)
              ) {
                return; // Click was outside this element's bounds
              }
            }

            // This is the correct element to focus
            el.focus();
            const range = document.caretRangeFromPoint?.(clickPosition.x, clickPosition.y);
            if (range && el.contains(range.startContainer)) {
              const selection = window.getSelection();
              selection?.removeAllRanges();
              selection?.addRange(range);
            } else {
              const selection = window.getSelection();
              const range2 = document.createRange();
              range2.selectNodeContents(el);
              range2.collapse(false);
              selection?.removeAllRanges();
              selection?.addRange(range2);
            }
            return;
          }

          // Fallback: auto-focus the primary field if no field captured the click
          if (autoFocus) {
            requestAnimationFrame(() => {
              if (!el.closest('[data-proofread-id]')?.querySelector('[contenteditable]:focus')) {
                el.focus();
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(el);
                range.collapse(false);
                selection?.removeAllRanges();
                selection?.addRange(range);
              }
            });
          }
        }}
        onBlur={(e) => {
          const raw = e.currentTarget.innerHTML || '';
          const newValue = isEmptyValue(raw) ? '' : raw;
          onInlineTextChange(elementId, field, newValue);
        }}
        onBeforeInput={(e) => {
          if (limit) {
            const currentLength = e.currentTarget.textContent?.length || 0;
            const inputLength = e.data?.length || 0;
            const selectedLength = window.getSelection()?.toString().length || 0;
            if (currentLength - selectedLength + inputLength > limit) {
              e.preventDefault();
            }
          }
        }}
        onPaste={(e) => {
          e.preventDefault();
          let text = e.clipboardData.getData('text/plain');
          if (limit) {
            const currentLength = e.currentTarget.textContent?.length || 0;
            const selectedLength = window.getSelection()?.toString().length || 0;
            const remaining = limit - (currentLength - selectedLength);
            if (remaining <= 0) return;
            text = text.slice(0, remaining);
          }
          document.execCommand('insertText', false, text);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            e.currentTarget.blur();
            return;
          }
          if (e.key === 'Enter') {
            e.preventDefault();
            document.execCommand('insertLineBreak');
          }
        }}
        className="outline-none"
        style={{ minWidth: isEmptyValue(value) ? '60px' : '20px', display: 'block', width: '100%', overflowWrap: 'break-word', wordBreak: 'break-word' }}
        data-placeholder={placeholder}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    );
  };

  // Element styling - hover effect + active highlight
  // fit: "center" for centered text (w-fit mx-auto), "left" for left-aligned text (w-fit)
  const getProofreadingClass = (elementId, fit) => {
    const fitClass = fit === "center" || fit === true ? "w-fit mx-auto px-2 py-0.5 " : fit === "left" ? "w-fit px-2 py-0.5 " : "";
    if (proofreadingElementId === elementId) {
      return `${fitClass}ring-2 ring-[hsl(var(--page-accent))] bg-[hsl(var(--page-accent))]/5 rounded-lg transition-all duration-200`;
    }
    return `${fitClass}cursor-pointer hover:bg-[hsl(var(--page-accent))]/10 hover:ring-2 hover:ring-[hsl(var(--page-accent))]/30 rounded-lg transition-all duration-200`;
  };


  const ClickableWrapper = ({ children, className = "", onClick }) => (
    <div
      onClick={onClick}
      className={cn(
        "rounded-lg",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );

  const scrollToSection = (anchor) => {
    const element = document.getElementById(`page-${anchor}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };


  return (
    <div
      className={cn(
        "bg-[hsl(var(--page-bg))] overflow-auto transition-all duration-500 ease-out scrollbar-hide scroll-smooth relative",
        isPreviewMode
          ? "w-full h-full max-w-none max-h-full rounded-none shadow-none"
          : cn(
              "rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2),0_10px_25px_-10px_rgba(0,0,0,0.1)]",
              viewMode === "desktop" ? "w-full max-w-6xl max-h-[80vh]" : "w-[375px] max-h-[80vh]"
            )
      )}
    >

      {/* Navigation */}
      <nav className={cn("bg-[hsl(var(--page-hero-bg))] py-4 flex items-center justify-between sticky top-0 z-30", viewMode === "mobile" ? "px-5" : "px-8")}>
        <div className="flex items-center gap-3">
          {/* Logo - only show if exists */}
          {logo && (
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-[hsl(var(--page-bg))] border border-[hsl(var(--page-text))]/10 flex items-center justify-center">
              <img src={logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
          )}

          {/* Name */}
          <div className="font-display text-xl font-semibold text-[hsl(var(--page-text))] max-w-[200px]">
            <span className="block truncate">{globalSettings.firstName || <span className="opacity-40">Prénom</span>}</span>
            <span className="block truncate">{globalSettings.lastName || <span className="opacity-40">Nom</span>}</span>
          </div>
        </div>

        {viewMode === "desktop" && (
          <div className="flex items-center gap-6">
            {navItems.map((item) => (
              <span
                key={item.anchor}
                onClick={() => scrollToSection(item.anchor)}
                className="text-sm text-[hsl(var(--page-text-muted))] hover:text-[hsl(var(--page-text))] cursor-pointer transition-colors"
              >
                {item.label}
              </span>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm text-[hsl(var(--page-text-muted))] hover:text-[hsl(var(--page-text))] cursor-pointer transition-colors outline-none">
                Spécialités <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[200px]">
                {painTypes.length > 0 ? (
                  painTypes.map((pain) => (
                    <DropdownMenuItem key={pain.id} className="flex items-center gap-2 cursor-pointer">
                      <span>{pain.icon}</span>
                      <span>{pain.title}</span>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled className="text-muted-foreground">
                    Aucune spécialité
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <ClickableWrapper onClick={() => onCTAClick?.("appointmentLink")}>
              <button
                className="bg-[hsl(var(--page-accent-dark))] text-white px-5 py-2.5 text-sm font-medium"
                style={{ borderRadius: 'var(--page-radius, 9999px)' }}
              >
                Prendre Rendez-Vous
              </button>
            </ClickableWrapper>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="bg-[hsl(var(--page-hero-bg))] relative">
        <div className={cn("flex", viewMode === "mobile" ? "flex-col" : "flex-row")}>
          {/* Left Content */}
          <div className={cn("flex flex-col justify-center", viewMode === "desktop" ? "w-1/2 p-8 py-12" : "w-full p-5")}>
            <span
              className="self-start inline-flex mb-6 border border-[hsl(var(--page-accent))] text-[hsl(var(--page-accent))] px-4 py-1.5 text-sm"
              style={{ borderRadius: 'var(--page-radius, 9999px)' }}
            >
              {globalSettings.profession || <span className="opacity-40">Profession</span>}<span className="px-1"> à </span>{globalSettings.city || <span className="opacity-40">Ville</span>}
            </span>

            <h1
              data-proofread-id="hero-title"
              className={cn(
                cn("font-display font-bold text-[hsl(var(--page-text))] leading-tight mb-4 text-left", viewMode === "mobile" ? "text-3xl" : "text-4xl md:text-5xl"),

                getProofreadingClass("hero-title", "left")
              )}
            >
              {makeEditable("hero-title", "content.title", content.title)}
            </h1>

            <p
              data-proofread-id="hero-subtitle"
              className={cn(
                "text-[hsl(var(--page-text-muted))] mb-8 max-w-md",

                getProofreadingClass("hero-subtitle")
              )}
            >
              {makeEditable("hero-subtitle", "content.subtitle", content.subtitle)}
            </p>

            <div className={cn("flex gap-3 mb-8", viewMode === "mobile" ? "flex-col items-start" : "items-center gap-4")}>
              <ClickableWrapper onClick={() => onCTAClick?.("appointmentLink")}>
                <button
                  className="bg-[hsl(var(--page-accent))] text-white px-6 py-3 text-sm font-medium"
                  style={{ borderRadius: 'var(--page-radius, 9999px)' }}
                >
                  {content.ctaPrimary || "Prendre Rendez-Vous"}
                </button>
              </ClickableWrapper>
              {/* Phone button - only show if phone exists */}
              {(content.ctaSecondary ?? globalSettings.phoneNumber) && (
                <button
                  data-proofread-id="hero-cta-secondary"
                  className={cn(
                    "border px-6 py-3 text-sm font-medium transition-colors border-[hsl(var(--page-text))] text-[hsl(var(--page-text))]",

                    getProofreadingClass("hero-cta-secondary")
                  )}
                  style={{ borderRadius: 'var(--page-radius, 9999px)' }}
                >
                  {makeEditable("hero-cta-secondary", "content.ctaSecondary", content.ctaSecondary ?? globalSettings.phoneNumber)}
                </button>
              )}
            </div>

            {/* Decorative dots */}
            <div className="flex gap-1 mb-8">
              {Array.from({ length: viewMode === "mobile" ? 15 : 30 }).map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--page-accent))]/40" />
              ))}
            </div>

            {/* Locations */}
            {locations.length > 0 && (
              <ClickableWrapper onClick={() => onLocationClick?.()}>
                <div className={cn("flex gap-4", viewMode === "mobile" ? "flex-col items-start" : "items-center")}>
                  {locations.map((location, index) => (
                    <div
                      key={location.id}
                      className="flex items-center gap-3 p-2"
                    >
                      <div
                        className="w-12 h-12 bg-[hsl(var(--page-accent))]/20 flex items-center justify-center overflow-hidden"
                        style={{ borderRadius: 'var(--page-radius, 8px)' }}
                      >
                        {location.icon?.startsWith('http') || location.icon?.startsWith('data:') ? (
                          <img
                            src={location.icon}
                            alt={location.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xl">{location.icon}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-[hsl(var(--page-accent))] font-medium text-sm">{location.title}</p>
                        <p className="text-[hsl(var(--page-text-muted))] text-xs">{location.address}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ClickableWrapper>
            )}
          </div>

          {/* Right Image */}
          <div className={cn("relative", viewMode === "desktop" ? "w-1/2 min-h-[400px]" : "w-full aspect-video")}>
            <div
              data-proofread-id="hero-image"
              className="absolute inset-0 z-[5] group/hero"
            >
              <img
                src={heroImage}
                alt="Osteopath treating patient"
                className="w-full h-full object-cover rounded-none"
                style={{ objectPosition: `${heroImagePosition.x}% ${heroImagePosition.y}%` }}
                draggable={false}
              />
              {/* Hover Toolkit (appears on image hover) */}
              {!isPreviewMode && onHeroImageUpload && onHeroImageCrop && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/hero:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {/* Upload Button */}
                  <button
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = (e) => onHeroImageUpload(e);
                      input.click();
                    }}
                    className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <ImageIcon className="w-5 h-5 text-gray-700" />
                  </button>

                  {/* Move Button */}
                  {onHeroImagePosition && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onHeroImagePosition();
                      }}
                      className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Move className="w-5 h-5 text-gray-700" />
                    </button>
                  )}

                  {/* Crop Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onHeroImageCrop();
                    }}
                    className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Crop className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
              )}
            </div>

            {/* Rating Badge - only show if Google connected */}
            {isGoogleConnected && (
              <div
                data-proofread-id="badge-rating"
                className={cn(
                  cn("absolute z-20 bg-[hsl(var(--page-accent-dark))] text-white flex items-center gap-3", viewMode === "mobile" ? "top-4 left-4 px-3 py-2 text-sm" : "top-8 left-8 px-4 py-3"),
                  proofreadingElementId === "badge-rating"
                    ? "ring-2 ring-white shadow-lg"
                    : "cursor-pointer hover:ring-2 hover:ring-white/70 hover:shadow-lg transition-all duration-200"
                )}
                style={{ borderRadius: 'var(--page-radius, 12px)' }}
              >
                <span className="text-xl">{ratingBadge.icon}</span>
                <div>
                  <p className="font-bold">{makeEditable("badge-rating", "ratingBadge.value", ratingBadge.value)}</p>
                  <p className="text-xs opacity-80">{makeEditable("badge-rating", "ratingBadge.label", ratingBadge.label)}</p>
                </div>
              </div>
            )}

            {/* Patients Badge */}
            <ClickableWrapper onClick={onPatientsClick} className={cn("absolute z-20", viewMode === "mobile" ? "bottom-4 right-4" : "bottom-8 right-8")}>
              <div
                data-proofread-id="badge-patients"
                className={cn(
                  cn("bg-[hsl(var(--page-accent-dark))] text-white flex items-center gap-3", viewMode === "mobile" ? "px-3 py-2 text-sm" : "px-4 py-3"),
                  proofreadingElementId === "badge-patients"
                    ? "ring-2 ring-white shadow-lg"
                    : "cursor-pointer hover:ring-2 hover:ring-white/70 hover:shadow-lg transition-all duration-200"
                )}
                style={{ borderRadius: 'var(--page-radius, 12px)' }}
              >
                <span className="text-xl">{patientsBadge.icon}</span>
                <div>
                  <p className="font-bold">{makeEditable("badge-patients", "patientsBadge.value", patientsBadge.value)}</p>
                  <p className="text-xs opacity-80">{makeEditable("badge-patients", "patientsBadge.label", patientsBadge.label)}</p>
                </div>
              </div>
            </ClickableWrapper>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className={cn("bg-[hsl(var(--page-accent))] py-6 relative", viewMode === "mobile" ? "px-5" : "px-8")}>
        {/* Mobile-only warning banner */}
        {viewMode === "mobile" && !isPreviewMode && (
          <div className="mb-4 flex items-center justify-center gap-2 py-2 px-3 bg-white/20 backdrop-blur-sm rounded-lg text-white/90 text-xs">
            <Monitor className="w-3.5 h-3.5" />
            <span>Cette section n'est pas affichée sur mobile</span>
          </div>
        )}
        <div className={cn("grid gap-4", viewMode === "desktop" ? "grid-cols-4" : "grid-cols-2")}>
          {features
            .filter(feature => !isPreviewMode || !feature.hidden)
            .map((feature, index) => (
            <div key={feature.id}>
              {!isPreviewMode && feature.hidden ? (
                <ClickableWrapper onClick={() => onFeatureClick?.(feature.id)}>
                  <div className="relative flex items-center gap-3 text-white overflow-hidden rounded-lg">
                    <div className="opacity-20 pointer-events-none flex items-center gap-3 p-2">
                      <span className="text-2xl">{feature.icon}</span>
                      <div>
                        <p className="font-medium text-sm">{feature.title}</p>
                        <p className="text-xs opacity-80">{feature.desc}</p>
                      </div>
                    </div>
                    <HiddenOverlay variant="compact" />
                  </div>
                </ClickableWrapper>
              ) : (
                <ClickableWrapper onClick={isPreviewMode ? undefined : () => onFeatureClick?.(feature.id)}>
                  <div
                    data-proofread-id={`feature-${index}`}
                    className={cn(
                      "flex items-center gap-3 text-white p-2 rounded-lg transition-all",
                      "hover:bg-white/10",
                      isProofreadingActive && proofreadingElementId !== `feature-${index}` && "hover:opacity-70 cursor-pointer",
                      getProofreadingClass(`feature-${index}`)
                    )}
                  >
                    <span className="text-2xl shrink-0">{feature.icon}</span>
                    <div className="min-w-0 overflow-hidden">
                      <p className="font-medium text-sm truncate">
                        {makeEditable(`feature-${index}`, `features[${index}].title`, feature.title, true)}
                      </p>
                      <p className="text-xs opacity-80 line-clamp-2">
                        {makeEditable(`feature-${index}`, `features[${index}].desc`, feature.desc)}
                      </p>
                    </div>
                  </div>
                </ClickableWrapper>
              )}
            </div>
          ))}

        </div>
      </div>


      {/* Pain Types Section - Motifs */}
      <div id="page-motifs" className={cn("py-12 text-center scroll-mt-16", viewMode === "mobile" ? "px-5" : "px-8")}>
        <h2
          data-proofread-id="section-specialties-title"
          className={cn(
            cn("font-display font-bold text-[hsl(var(--page-text))] mb-4", viewMode === "mobile" ? "text-2xl" : "text-3xl"),

            getProofreadingClass("section-specialties-title", true)
          )}
        >
          {makeEditable("section-specialties-title", "content.specialtiesSectionTitle", content.specialtiesSectionTitle ?? "Des solutions adaptées à chaque douleur")}
        </h2>
        <p
          data-proofread-id="section-specialties-subtitle"
          className={cn(
            "text-[hsl(var(--page-text-muted))] mb-8 max-w-2xl mx-auto",

            getProofreadingClass("section-specialties-subtitle")
          )}
        >
          {makeEditable("section-specialties-subtitle", "content.specialtiesSectionSubtitle", content.specialtiesSectionSubtitle ?? "Découvrez comment l'ostéopathie peut vous aider à soulager vos douleurs")}
        </p>

        {painTypes.length > 0 && (
          <div className={cn("grid gap-4 text-left", viewMode === "desktop" ? "grid-cols-3" : "grid-cols-1")}>
            {painTypes.map((pain) => (
              <div
                key={pain.id}
                onClick={isPreviewMode ? undefined : () => onPainTypeClick?.()}
                className={cn(
                  "border border-[hsl(var(--page-accent))]/20 transition-all",
                  viewMode === "mobile" ? "p-4" : "p-6",
                  !isPreviewMode && "cursor-pointer hover:border-[hsl(var(--page-accent))]/40"
                )}
                style={{ borderRadius: 'var(--page-radius, 12px)' }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{pain.icon}</span>
                  <div>
                    <h3 className="font-semibold text-[hsl(var(--page-text))] mb-2">
                      {pain.title || <span className="opacity-40">Titre</span>}
                    </h3>
                    <p className="text-sm text-[hsl(var(--page-text-muted))]">
                      {pain.desc || <span className="opacity-40">Description</span>}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <ClickableWrapper onClick={() => onCTAClick?.("appointmentLink")} className="inline-block mt-8">
          <button
            className="bg-[hsl(var(--page-accent))] text-white px-6 py-3 text-sm font-medium"
            style={{ borderRadius: 'var(--page-radius, 9999px)' }}
          >
            Prendre Rendez-Vous
          </button>
        </ClickableWrapper>
      </div>

      {/* About Section - À propos */}
      <div id="page-a-propos" className={cn("bg-[hsl(var(--page-accent))]/10 py-12 scroll-mt-16", viewMode === "mobile" ? "px-5" : "px-8")}>
        {(() => {
            // Calculate content density to determine image size
            const richText = content.aboutRichTextPresentation || "";
            const totalTextLength = richText.replace(/<[^>]*>/g, '').length; // Strip HTML tags for length calculation

            // Determine image width based on content:
            // More content = smaller image (more space for text)
            // Less content = larger image (more visual focus)
            let imageWidth = "50%"; // default 50%

            if (viewMode === "desktop") {
              if (totalTextLength < 300) {
                // Minimal content: larger image
                imageWidth = "55%";
              } else if (totalTextLength > 800) {
                // Rich content: smaller image
                imageWidth = "40%";
              }
            }

            return (
              <div className={cn("flex gap-8 w-full", viewMode === "mobile" ? "flex-col" : "flex-row")}>
                <div
                  className={cn(viewMode === "mobile" && "w-full")}
                  style={viewMode === "desktop" ? { width: imageWidth, flexShrink: 0 } : undefined}
                >
                  <div
                    className={cn("overflow-hidden relative group", viewMode === "mobile" ? "h-48" : "min-h-[400px] h-[500px]")}
                    style={{ borderRadius: 'var(--page-radius, 12px)' }}
                  >
                    <img
                      src={aboutImage}
                      alt="Treatment room"
                      className="w-full h-full object-cover"
                      style={{ objectPosition: `${therapistImagePosition.x}% ${therapistImagePosition.y}%` }}
                      draggable={false}
                    />
                    {/* Hover Toolkit (appears on image hover) */}
                    {!isPreviewMode && onTherapistImageUpload && onTherapistImageCrop && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {/* Upload Button */}
                        <button
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = "image/*";
                            input.onchange = (e) => onTherapistImageUpload(e);
                            input.click();
                          }}
                          className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <ImageIcon className="w-5 h-5 text-gray-700" />
                        </button>

                        {/* Move Button */}
                        {onTherapistImagePosition && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onTherapistImagePosition();
                            }}
                            className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <Move className="w-5 h-5 text-gray-700" />
                          </button>
                        )}

                        {/* Crop Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTherapistImageCrop();
                          }}
                          className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Crop className="w-5 h-5 text-gray-700" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <ClickableWrapper onClick={!isPreviewMode ? () => onAboutSectionClick?.() : undefined}>
                  <div
                    className={cn(viewMode === "mobile" ? "w-full" : "flex-1")}
                  >
              <span
                className="text-[hsl(var(--page-accent))] text-sm font-medium"
              >
              {content.aboutSectionSubtitle ?? (`${globalSettings.firstName} ${globalSettings.lastName}`.trim() + (globalSettings.profession ? `, votre ${globalSettings.profession.toLowerCase()}` : "") + (globalSettings.city ? ` à ${globalSettings.city}` : "") || "Votre praticien")}
            </span>
            <h2
              className={cn("font-display font-bold text-[hsl(var(--page-text))] mt-2 mb-4", viewMode === "mobile" ? "text-2xl" : "text-3xl")}
            >
              {content.aboutSectionTitle ?? "Et si vous retrouviez confort et mobilité ?"}
            </h2>
            <div
              className="prose prose-sm max-w-none mb-6 text-[hsl(var(--page-text-muted))]"
              dangerouslySetInnerHTML={{
                __html: content.aboutRichTextPresentation ?? "<p>Diplômé(e) en ostéopathie, je vous accueille dans mon cabinet pour vous accompagner vers un mieux-être durable.</p><p>Mon approche se veut globale et personnalisée : chaque patient est unique, chaque douleur a son histoire.</p>"
              }}
            />

            {/* Session info cards — inline */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div
                className="bg-[hsl(var(--page-hero-bg))] text-center p-3"
                style={{ borderRadius: 'var(--page-radius, 12px)' }}
              >
                <span className="text-xl block mb-1">{sessionInfo.durationIcon ?? "⏱️"}</span>
                <p className="font-semibold text-xs text-[hsl(var(--page-text))]">{content.sessionDurationLabel ?? "Durée de la séance"}</p>
                <p className="text-xs text-[hsl(var(--page-text-muted))] mt-0.5">
                  {sessionInfo.showStartingFromDuration && "À partir de "}
                  {sessionInfo.duration}
                </p>
              </div>

              <div
                className="bg-[hsl(var(--page-hero-bg))] text-center p-3"
                style={{ borderRadius: 'var(--page-radius, 12px)' }}
              >
                <span className="text-xl block mb-1">{sessionInfo.priceIcon ?? "💰"}</span>
                <p className="font-semibold text-xs text-[hsl(var(--page-text))]">{content.sessionPriceLabel ?? "Tarification"}</p>
                <p className="text-xs text-[hsl(var(--page-text-muted))] mt-0.5">
                  {sessionInfo.showStartingFrom && "À partir de "}
                  {sessionInfo.price}
                </p>
              </div>

              {sessionInfo.showReimbursement !== false ? (
                <div
                  className="bg-[hsl(var(--page-hero-bg))] text-center p-3"
                  style={{ borderRadius: 'var(--page-radius, 12px)' }}
                >
                  <span className="text-xl block mb-1">{sessionInfo.reimbursementIcon ?? "🛡️"}</span>
                  <p className="font-semibold text-xs text-[hsl(var(--page-text))]">{content.sessionReimbursementLabel ?? "Remboursement"}</p>
                  <p className="text-xs text-[hsl(var(--page-text-muted))] mt-0.5">{sessionInfo.reimbursement}</p>
                </div>
              ) : (
                !isPreviewMode && (
                  <div
                    className="bg-[hsl(var(--page-hero-bg))] p-3 text-center relative overflow-hidden"
                    style={{ borderRadius: 'var(--page-radius, 12px)' }}
                  >
                    <div className="opacity-20 pointer-events-none">
                      <Shield className="w-5 h-5 mx-auto mb-1 text-[hsl(var(--page-accent))]" />
                      <p className="font-semibold text-xs text-[hsl(var(--page-text))]">Remboursement</p>
                      <p className="text-xs text-[hsl(var(--page-text-muted))] mt-0.5">{sessionInfo.reimbursement}</p>
                    </div>
                    <HiddenOverlay variant="full" />
                  </div>
                )
              )}
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                className="bg-[hsl(var(--page-accent))] text-white px-6 py-3 text-sm font-medium"
                style={{ borderRadius: 'var(--page-radius, 9999px)' }}
              >
                {content.aboutSectionCta ?? "Prendre rendez-vous"}
              </button>
              {therapistCount > 1 && onNextTherapist && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNextTherapist();
                  }}
                  className="border-2 border-[hsl(var(--page-accent))] text-[hsl(var(--page-accent))] px-6 py-3 text-sm font-medium hover:bg-[hsl(var(--page-accent))]/5 transition-colors"
                  style={{ borderRadius: 'var(--page-radius, 9999px)' }}
                >
                  Thérapeute suivant
                </button>
              )}
            </div>
          </div>
                </ClickableWrapper>
        </div>
            );
          })()}
      </div>

      {/* Reviews Section - Avis */}
      <div id="page-avis" className={cn("py-12 bg-[hsl(var(--page-hero-bg))] scroll-mt-16", viewMode === "mobile" ? "px-5" : "px-8")}>
        <div className="text-center mb-8">
          <span
            data-proofread-id="section-reviews-subtitle"
            className={cn(
              "text-[hsl(var(--page-accent))] text-sm font-medium",

              getProofreadingClass("section-reviews-subtitle")
            )}
          >
            {makeEditable("section-reviews-subtitle", "content.reviewsSectionSubtitle", content.reviewsSectionSubtitle ?? "Témoignages")}
          </span>
          <h2
            data-proofread-id="section-reviews-title"
            className={cn(
              cn("font-display font-bold text-[hsl(var(--page-text))] mt-2", viewMode === "mobile" ? "text-2xl" : "text-3xl"),

              getProofreadingClass("section-reviews-title", true)
            )}
          >
            {makeEditable("section-reviews-title", "content.reviewsSectionTitle", content.reviewsSectionTitle ?? "Ce que disent nos patients")}
          </h2>
        </div>

        {isGoogleConnected && (
          <div className={cn(
            "grid gap-4 max-w-6xl mx-auto",
            viewMode === "desktop" ? "grid-cols-4" : "grid-cols-1"
          )}>
            {/* Clinic Card with Google Profile Photo */}
            <ClickableWrapper onClick={onReviewsClick}>
              <div
                className="bg-background p-5 shadow-sm h-full"
                style={{ borderRadius: 'var(--page-radius, 12px)' }}
              >
                {googleProfilePhoto ? (
                  <img
                    src={googleProfilePhoto}
                    alt="Profil Google"
                    className="w-16 h-16 rounded-full object-cover mx-auto mb-3"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[hsl(var(--page-accent))]/20 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-[hsl(var(--page-accent))]">
                      {(googleProfileName || globalSettings.firstName)?.[0] || "G"}
                    </span>
                  </div>
                )}
                <p className="font-semibold text-[hsl(var(--page-text))] text-center">
                  {googleProfileName || `${globalSettings.firstName} ${globalSettings.lastName}`}
                </p>
                <div className="flex items-center justify-center gap-1 my-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[hsl(var(--page-accent))] text-[hsl(var(--page-accent))]" />
                  ))}
                </div>
                <p className="text-sm text-[hsl(var(--page-text-muted))] text-center">{ratingBadge.label}</p>
                <button className="text-[hsl(var(--page-accent))] text-sm mt-3 flex items-center gap-1 mx-auto hover:underline">
                  Écrire un avis <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </ClickableWrapper>

            {/* Reviews */}
            {(isPreviewMode
              ? reviews.filter(r => !r.hidden).slice(0, 3)
              : reviews.slice(0, 3)
            ).map((review) => (
              <div key={review.id} className="relative group">
                {!isPreviewMode && review.hidden ? (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onReviewToggleVisibility?.(review.id);
                    }}
                    className="bg-background p-5 shadow-sm h-full relative cursor-pointer overflow-hidden"
                    style={{ borderRadius: 'var(--page-radius, 12px)' }}
                  >
                    <div className="opacity-20 pointer-events-none">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-[hsl(var(--page-accent))]/20 flex items-center justify-center text-sm font-semibold text-[hsl(var(--page-accent))]">
                          {review.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-[hsl(var(--page-text))]">{review.name}</p>
                          <p className="text-xs text-[hsl(var(--page-text-muted))]">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 mb-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={cn("w-4 h-4", i < review.rating ? "fill-[hsl(var(--page-accent))] text-[hsl(var(--page-accent))]" : "text-muted-foreground")} />
                        ))}
                      </div>
                      <p className="text-[hsl(var(--page-text-muted))] leading-relaxed line-clamp-4">{review.text}</p>
                    </div>
                    <HiddenOverlay variant="full" />
                  </div>
                ) : (
                  <>
                    <ClickableWrapper onClick={isPreviewMode ? undefined : () => onReviewClick?.(review.id)}>
                      <div
                        className="bg-background p-5 shadow-sm h-full"
                        style={{ borderRadius: 'var(--page-radius, 12px)' }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-[hsl(var(--page-accent))]/20 flex items-center justify-center text-sm font-semibold text-[hsl(var(--page-accent))]">
                            {review.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-[hsl(var(--page-text))]">{review.name}</p>
                            <p className="text-xs text-[hsl(var(--page-text-muted))]">{review.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 mb-3">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={cn("w-4 h-4", i < review.rating ? "fill-[hsl(var(--page-accent))] text-[hsl(var(--page-accent))]" : "text-muted-foreground")} />
                          ))}
                        </div>
                        <p className="text-[hsl(var(--page-text-muted))] leading-relaxed line-clamp-4">{review.text}</p>
                      </div>
                    </ClickableWrapper>
                    {!isPreviewMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onReviewToggleVisibility?.(review.id);
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-background/90 border border-border/50 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
                        title="Masquer cet avis"
                      >
                        <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}

          </div>
        )}
      </div>

      {/* Session Steps Section - Déroulement */}
      <div id="page-deroulement" className={cn("py-12 text-center scroll-mt-16", viewMode === "mobile" ? "px-5" : "px-8")}>
        <span
          data-proofread-id="section-steps-subtitle"
          className={cn(
            "text-[hsl(var(--page-accent))] text-sm font-medium",

            getProofreadingClass("section-steps-subtitle")
          )}
        >
          {makeEditable("section-steps-subtitle", "content.stepsSectionSubtitle", content.stepsSectionSubtitle ?? "Le guide d'information")}
        </span>
        <h2
          data-proofread-id="section-steps-title"
          className={cn(
            cn("font-display font-bold text-[hsl(var(--page-text))] mt-2 mb-8", viewMode === "mobile" ? "text-2xl" : "text-3xl"),

            getProofreadingClass("section-steps-title", true)
          )}
        >
          {makeEditable("section-steps-title", "content.stepsSectionTitle", content.stepsSectionTitle ?? "Déroulement d'une séance")}
        </h2>

        <div className={cn("grid gap-6", viewMode === "desktop" ? "grid-cols-2" : "grid-cols-1")}>
          {sessionSteps.map((step, index) => (
            <ClickableWrapper key={step.id} onClick={isPreviewMode ? undefined : () => onSessionStepClick?.(step.id)}>
              <div
                data-proofread-id={`step-${index}`}
                className={cn(
                  cn("border text-left flex gap-4 transition-all h-full", viewMode === "mobile" ? "p-4" : "p-6"),
                  "hover:border-[hsl(var(--page-accent))]/50",
                  isProofreadingActive && proofreadingElementId !== `step-${index}` && "hover:opacity-70 cursor-pointer",
                  getProofreadingClass(`step-${index}`)
                )}
                style={{ borderRadius: 'var(--page-radius, 12px)' }}
              >
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--page-accent))]/20 flex items-center justify-center shrink-0">
                  <span className="text-[hsl(var(--page-accent))] font-bold">{step.num}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-[hsl(var(--page-text))]">
                    {makeEditable(`step-${index}`, `sessionSteps[${index}].title`, step.title, true)}
                  </h3>
                  <p className="text-sm text-[hsl(var(--page-text-muted))] mt-1">
                    {makeEditable(`step-${index}`, `sessionSteps[${index}].desc`, step.desc)}
                  </p>
                </div>
              </div>
            </ClickableWrapper>
          ))}

        </div>

        <ClickableWrapper onClick={() => onCTAClick?.("appointmentLink")} className="inline-block mt-8">
          <button
            className="bg-[hsl(var(--page-accent))] text-white px-6 py-3 text-sm font-medium"
            style={{ borderRadius: 'var(--page-radius, 9999px)' }}
          >
            Prendre Rendez-Vous
          </button>
        </ClickableWrapper>
      </div>

      {/* FAQ Section - Questions */}
      <div id="page-questions" className={cn("bg-[hsl(var(--page-accent-dark))] py-12 text-white text-center scroll-mt-16", viewMode === "mobile" ? "px-5" : "px-8")}>
        <h2
          data-proofread-id="section-faq-title"
          className={cn(
            cn("font-display font-bold mb-8", viewMode === "mobile" ? "text-2xl" : "text-3xl"),

            getProofreadingClass("section-faq-title", true)
          )}
        >
          {makeEditable("section-faq-title", "content.faqSectionTitle", content.faqSectionTitle ?? "Des Questions ?")}
        </h2>

        <div className="max-w-xl mx-auto space-y-3">
          {isPreviewMode ? (
            <Accordion type="single" collapsible className="space-y-3">
              {faqItems.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="border-none transition-colors bg-white/10 data-[state=open]:bg-white"
                  style={{ borderRadius: 'var(--page-radius, 8px)' }}
                >
                  <AccordionTrigger
                    className="px-4 py-4 text-left hover:no-underline transition-colors text-white data-[state=open]:text-[hsl(var(--page-text))]"
                    style={{ borderRadius: 'var(--page-radius, 8px)' }}
                  >
                    <span>{item.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 text-left text-[hsl(var(--page-text-muted))]">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <>
              {faqItems.map((item, index) => (
                <ClickableWrapper key={item.id} onClick={() => onFAQClick?.(item.id)}>
                  <div
                    data-proofread-id={`faq-${index}`}
                    className={cn(
                      "p-4 text-left transition-all rounded-lg",
                      proofreadingElementId === `faq-${index}`
                        ? "text-[hsl(var(--page-text))]"
                        : "bg-white/10 hover:bg-white/20",
                      isProofreadingActive && proofreadingElementId !== `faq-${index}` && "hover:opacity-70 cursor-pointer",
                      proofreadingElementId !== `faq-${index}` && getProofreadingClass(`faq-${index}`)
                    )}
                    style={{
                      borderRadius: 'var(--page-radius, 8px)',
                      ...(proofreadingElementId === `faq-${index}` ? { backgroundColor: '#ffffff' } : {}),
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {makeEditable(`faq-${index}`, `faqItems[${index}].question`, item.question, true)}
                      </span>
                      <ChevronRight className={cn("w-5 h-5 shrink-0 ml-2 transition-transform", proofreadingElementId === `faq-${index}` && "rotate-90")} />
                    </div>
                    {proofreadingElementId === `faq-${index}` && (
                      <div className="mt-3 pt-3 border-t border-[hsl(var(--page-text))]/10">
                        <p className="text-xs text-[hsl(var(--page-text-muted))] mb-1">Réponse</p>
                        <div className="text-[hsl(var(--page-text-muted))] text-sm">
                          {makeEditable(`faq-${index}`, `faqItems[${index}].answer`, item.answer ?? "", false, true)}
                        </div>
                      </div>
                    )}
                  </div>
                </ClickableWrapper>
              ))}

            </>
          )}
        </div>

        {isPreviewMode ? (
          <button
            className="bg-[hsl(var(--page-accent))] text-white px-6 py-3 text-sm font-medium mt-8"
            style={{ borderRadius: 'var(--page-radius, 9999px)' }}
          >
            Prendre Rendez-Vous
          </button>
        ) : (
          <ClickableWrapper onClick={() => onCTAClick?.("appointmentLink")} className="inline-block mt-8">
            <button
              className="bg-[hsl(var(--page-accent))] text-white px-6 py-3 text-sm font-medium"
              style={{ borderRadius: 'var(--page-radius, 9999px)' }}
            >
              Prendre Rendez-Vous
            </button>
          </ClickableWrapper>
        )}
      </div>

      {/* Footer - Contact */}
      <div id="page-contact" className={cn("bg-[hsl(var(--page-bg))] py-8 scroll-mt-16", viewMode === "mobile" ? "px-5" : "px-8")}>
        <div className={cn("flex gap-8 justify-between", viewMode === "mobile" ? "flex-col" : "flex-row")}>
          <div>
            <h3 className="font-display text-xl font-semibold text-[hsl(var(--page-text))]">
              {globalSettings.firstName || <span className="opacity-40">Prénom</span>} {globalSettings.lastName || <span className="opacity-40">Nom</span>}
            </h3>
            <p className="text-sm text-[hsl(var(--page-text-muted))] mt-1">
              {globalSettings.profession || <span className="opacity-40">Profession</span>} • {globalSettings.city || <span className="opacity-40">Ville</span>}
            </p>
          </div>
          <div className={cn("flex gap-3", viewMode === "mobile" ? "flex-col items-start" : "gap-4")}>
            <ClickableWrapper onClick={() => onCTAClick?.("appointmentLink")}>
              <button className="bg-[hsl(var(--page-accent))] text-white px-5 py-2 rounded-full text-sm flex items-center gap-2 whitespace-nowrap">
                <Phone className="w-4 h-4" />
                Prendre Rendez-Vous
              </button>
            </ClickableWrapper>
            <button className="bg-[hsl(var(--page-accent))] text-white px-5 py-2 rounded-full text-sm flex items-center gap-2 whitespace-nowrap">
              <Phone className="w-4 h-4" />
              {globalSettings.phoneNumber || "Appeler"}
            </button>
          </div>
        </div>

        <div className={cn("mt-8 pt-6 border-t text-sm text-[hsl(var(--page-text-muted))]", viewMode === "mobile" ? "flex flex-col items-start gap-4" : "flex items-center justify-between")}>
          <ClickableWrapper onClick={() => onLocationClick?.()} className="inline-flex">
            <div className="flex items-center gap-6">
              <span>Tous nos cabinets</span>
              {locations.map((loc) => (
                <span key={loc.id} className="flex items-center gap-2">
                  {loc.icon?.startsWith('http') || loc.icon?.startsWith('data:') ? (
                    <img
                      src={loc.icon}
                      alt={loc.title}
                      className="w-5 h-5 object-cover rounded"
                    />
                  ) : (
                    <span>{loc.icon}</span>
                  )}
                  <span>{loc.title}</span>
                </span>
              ))}
            </div>
          </ClickableWrapper>
          <div className="flex items-center gap-4">
            <span>6 Années d'expérience</span>
            <span>Cabinet facile d'accès</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagePreview;
