import { useState, useEffect } from "react";
import { User, MapPin, Building2, ChevronRight, ChevronDown, Plus, Trash2, ExternalLink, Users, Star, Code, Image, ArrowLeft, Pencil, Crop, Check } from "lucide-react";
import RichTextEditor from "./RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import ImageCropModal from "./modals/ImageCropModal";

const STEPS = [
  { id: "contact", label: "Contact", icon: User, description: "Vos informations personnelles" },
  { id: "cabinet", label: "Cabinet", icon: MapPin, description: "Adresse(s) de votre cabinet" },
  { id: "therapists", label: "Thérapeutes", icon: Users, description: "Équipe du cabinet" },
  { id: "specialties", label: "Spécialités", icon: Star, description: "Vos domaines d'expertise" },
  { id: "google", label: "Google", icon: Building2, description: "Fiche Google Business" },
  { id: "code", label: "Code", icon: Code, description: "Code personnalisé" },
];



const Setup = ({ onBackToEditor, initialStep }) => {
  const stepParam = initialStep || "0";
  const resolvedInitialStep = isNaN(Number(stepParam))
    ? Math.max(STEPS.findIndex(s => s.id === stepParam), 0)
    : parseInt(stepParam, 10);
  const [currentStep, setCurrentStep] = useState(Math.min(Math.max(resolvedInitialStep, 0), STEPS.length - 1));
  const [expandedTherapists, setExpandedTherapists] = useState(new Set());
  const [expandedCodes, setExpandedCodes] = useState(new Set());
  // Therapist photo crop state
  const [therapistCropOpen, setTherapistCropOpen] = useState(false);
  const [therapistToCrop, setTherapistToCrop] = useState(null);

  // Specialty deletion modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [specialtyToDelete, setSpecialtyToDelete] = useState(null);
  const [showReplaceInput, setShowReplaceInput] = useState(false);
  const [newSpecialtyName, setNewSpecialtyName] = useState("");
  const [isCreatingSpecialty, setIsCreatingSpecialty] = useState(false);
  const [createdSpecialty, setCreatedSpecialty] = useState(null);

  // Specialty editing state
  const [editingSpecialtyId, setEditingSpecialtyId] = useState(null);

  // Validation state for each section
  const [validatedSection, setValidatedSection] = useState(null);
  const [changedSections, setChangedSections] = useState(new Set());
  const [initialData, setInitialData] = useState(null);

  const toggleTherapistExpanded = (id) => {
    setExpandedTherapists(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleCodeExpanded = (id) => {
    setExpandedCodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Get profession from localStorage
  const userProfession = localStorage.getItem("userProfession") || "Ostéopathe D.O";

  // Icon ID to emoji mapping
  const iconMapping = {
    spine: "\ud83e\uddb4",
    bone: "\ud83e\uddb4",
    back: "\ud83e\uddb4",
    posture: "\ud83d\udcbc",
    activity: "⚽",
    sport: "⚽",
    brain: "\ud83e\udde0",
    stress: "\ud83e\udde0",
    baby: "\ud83d\udc76",
    pediatric: "\ud83d\udc76",
    nourrisson: "\ud83d\udc76",
    pregnant: "\ud83e\udd30",
    pregnancy: "\ud83e\udd30",
    senior: "\ud83e\uddd3",
    elderly: "\ud83e\uddd3",
    muscle: "\ud83d\udcaa",
    head: "\ud83e\udd15",
    migraine: "\ud83e\udd15",
    joint: "\ud83e\uddbb",
    knee: "\ud83e\uddbb",
    shoulder: "\ud83e\uddb4",
    neck: "\ud83e\uddb4",
    // Default fallback
    default: "✨",
  };

  // Helper to get emoji from icon (handles both emoji and ID)
  const getIconEmoji = (icon) => {
    // If it's already an emoji (contains non-ASCII), return as-is
    if (/[^\x00-\x7F]/.test(icon)) {
      return icon;
    }
    // Otherwise look up the mapping
    return iconMapping[icon.toLowerCase()] || iconMapping.default;
  };

  // Default specialties for healthcare professionals
  const defaultSpecialties = [
    { id: "1", icon: "\ud83e\uddb4", title: "Douleurs musculaires", description: "Traitement des tensions, contractures et douleurs musculaires" },
    { id: "2", icon: "\ud83e\udd30", title: "Femmes enceintes", description: "Accompagnement de la grossesse et du post-partum" },
    { id: "3", icon: "\ud83d\udc76", title: "Nourrissons", description: "Prise en charge des bébés et jeunes enfants" },
    { id: "4", icon: "⚽", title: "Sportifs", description: "Optimisation des performances et récupération" },
    { id: "5", icon: "\ud83d\udcbc", title: "Troubles posturaux", description: "Correction des déséquilibres liés au travail de bureau" },
    { id: "6", icon: "\ud83e\uddd3", title: "Seniors", description: "Maintien de la mobilité et du confort au quotidien" },
  ];

  // Migration helper: convert old paragraph1-5 to richTextPresentation
  const migrateParagraphsToRichText = (therapist) => {
    // If already has richTextPresentation, use it
    if (therapist.richTextPresentation) {
      return therapist;
    }

    // Otherwise, convert paragraph1-5 to HTML
    const paragraphs = [
      therapist.paragraph1,
      therapist.paragraph2,
      therapist.paragraph3,
      therapist.paragraph4,
      therapist.paragraph5,
    ].filter(p => p && p.trim());

    const richTextPresentation = paragraphs.length > 0
      ? paragraphs.map(p => `<p>${p}</p>`).join('')
      : "<p>Diplômé(e) en ostéopathie, je vous accueille dans mon cabinet pour vous accompagner vers un mieux-être durable.</p><p>Mon approche se veut globale et personnalisée : chaque patient est unique, chaque douleur a son histoire.</p>";

    return {
      id: therapist.id,
      accroche: therapist.accroche || "",
      richTextPresentation,
      price: therapist.price || "",
      duration: therapist.duration || "",
      reimbursement: therapist.reimbursement || "",
      photo: therapist.photo || "",
    };
  };

  // Initialize data from localStorage if available
  const [data, setData] = useState(() => {
    const setupDataJson = localStorage.getItem("setupData");
    if (setupDataJson) {
      try {
        const saved = JSON.parse(setupDataJson);
        return {
          contact: saved.contact || {
            firstName: "",
            lastName: "",
            profession: userProfession,
            city: "",
            phoneNumber: "",
            appointmentLink: "",
          },
          locations: saved.locations || [],
          therapists: (saved.therapists || []).map(migrateParagraphsToRichText),
          specialties: saved.specialties || defaultSpecialties,
          google: saved.google || {
            connected: false,
            profile: null,
          },
          customCode: saved.customCode || [],
        };
      } catch (e) {
        console.error("Failed to parse setupData:", e);
      }
    }
    return {
      contact: {
        firstName: "",
        lastName: "",
        profession: userProfession,
        city: "",
        phoneNumber: "",
        appointmentLink: "",
      },
      locations: [],
      therapists: [],
      specialties: defaultSpecialties,
      google: {
        connected: false,
        profile: null,
      },
      customCode: [],
    };
  });

  // Track initial data on mount for change detection
  useEffect(() => {
    if (!initialData) {
      setInitialData(JSON.parse(JSON.stringify(data)));
    }
  }, [data, initialData]);

  // Detect changes in each section
  useEffect(() => {
    if (!initialData) return;

    const changed = new Set();

    if (JSON.stringify(data.contact) !== JSON.stringify(initialData.contact)) {
      changed.add("contact");
    }
    if (JSON.stringify(data.locations) !== JSON.stringify(initialData.locations)) {
      changed.add("locations");
    }
    if (JSON.stringify(data.therapists) !== JSON.stringify(initialData.therapists)) {
      changed.add("therapists");
    }
    if (JSON.stringify(data.specialties) !== JSON.stringify(initialData.specialties)) {
      changed.add("specialties");
    }
    if (JSON.stringify(data.google) !== JSON.stringify(initialData.google)) {
      changed.add("google");
    }
    if (JSON.stringify(data.customCode) !== JSON.stringify(initialData.customCode)) {
      changed.add("customCode");
    }

    setChangedSections(changed);
  }, [data, initialData]);

  // Handle section validation
  const handleValidateSection = (sectionName) => {
    // Save to localStorage
    localStorage.setItem("setupData", JSON.stringify(data));

    // Notify other components that setupData has been updated
    window.dispatchEvent(new Event("setupDataUpdated"));

    // Update initial data to reflect saved state
    setInitialData(JSON.parse(JSON.stringify(data)));

    // Show success feedback
    setValidatedSection(sectionName);
    setTimeout(() => setValidatedSection(null), 2000);
  };

  // Also load data from generatedContent if setupData is not available
  useEffect(() => {
    const generatedContentJson = localStorage.getItem("generatedContent");
    if (generatedContentJson && !localStorage.getItem("setupData")) {
      try {
        const generated = JSON.parse(generatedContentJson);
        if (generated.contact) {
          setData(prev => ({
            ...prev,
            contact: {
              ...prev.contact,
              firstName: generated.contact.firstName || prev.contact.firstName,
              lastName: generated.contact.lastName || prev.contact.lastName,
              profession: generated.contact.profession || prev.contact.profession,
              city: generated.contact.city || prev.contact.city,
              phoneNumber: generated.contact.phone || prev.contact.phoneNumber,
              appointmentLink: generated.contact.website || prev.contact.appointmentLink,
            },
          }));
        }
        // Load specialties from generated content if available
        if (generated.specialties && Array.isArray(generated.specialties)) {
          setData(prev => ({
            ...prev,
            specialties: generated.specialties.map((spec, index) => ({
              id: spec.id || String(index + 1),
              icon: spec.icon,
              title: spec.title,
              description: spec.description || "",
            })),
          }));
        }
      } catch (e) {
        console.error("Failed to parse generatedContent:", e);
      }
    }
  }, []);


  // Navigation
  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };


  const handleComplete = () => {
    localStorage.setItem("setupData", JSON.stringify(data));
    localStorage.setItem("setupComplete", "true");
    onBackToEditor();
  };

  // Contact handlers
  const updateContact = (updates) => {
    setData(prev => ({
      ...prev,
      contact: { ...prev.contact, ...updates },
    }));
  };

  // Location handlers
  const addLocation = () => {
    const newLocation = {
      id: Date.now().toString(),
      title: "",
      address: "",
      image: "",
      bookingLink: "",
    };
    setData(prev => ({
      ...prev,
      locations: [...prev.locations, newLocation],
    }));
  };

  const updateLocation = (id, updates) => {
    setData(prev => ({
      ...prev,
      locations: prev.locations.map(loc =>
        loc.id === id ? { ...loc, ...updates } : loc
      ),
    }));
  };

  const removeLocation = (id) => {
    setData(prev => ({
      ...prev,
      locations: prev.locations.filter(loc => loc.id !== id),
    }));
  };

  // Therapist handlers
  const addTherapist = () => {
    const newTherapist = {
      id: Date.now().toString(),
      accroche: "Et si vous retrouviez confort et mobilité ?",
      richTextPresentation: "<p>Diplômé(e) en ostéopathie, je vous accueille dans mon cabinet pour vous accompagner vers un mieux-être durable.</p><p>Mon approche se veut globale et personnalisée : chaque patient est unique, chaque douleur a son histoire.</p>",
      price: "60 €",
      duration: "45 min",
      reimbursement: "Remboursement mutuelle possible",
      photo: "",
    };
    setData(prev => ({
      ...prev,
      therapists: [...prev.therapists, newTherapist],
    }));
    setExpandedTherapists(new Set([newTherapist.id]));
  };

  const updateTherapist = (id, updates) => {
    setData(prev => ({
      ...prev,
      therapists: prev.therapists.map(t =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }));
  };

  const removeTherapist = (id) => {
    setData(prev => ({
      ...prev,
      therapists: prev.therapists.filter(t => t.id !== id),
    }));
  };

  // Specialty deletion handlers
  const handleDeleteSpecialtyClick = (specialty) => {
    setSpecialtyToDelete(specialty);
    setDeleteModalOpen(true);
    setShowReplaceInput(false);
    setNewSpecialtyName("");
    setIsCreatingSpecialty(false);
    setCreatedSpecialty(null);
  };

  const updateSpecialtyDescription = (id, newDescription) => {
    setData(prev => ({
      ...prev,
      specialties: prev.specialties.map(spec =>
        spec.id === id ? { ...spec, description: newDescription } : spec
      ),
    }));
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setSpecialtyToDelete(null);
    setShowReplaceInput(false);
    setNewSpecialtyName("");
    setIsCreatingSpecialty(false);
    setCreatedSpecialty(null);
  };

  const handleConfirmDelete = () => {
    setShowReplaceInput(true);
  };

  const handleCreateReplacement = async () => {
    if (!newSpecialtyName.trim() || !specialtyToDelete) return;

    setIsCreatingSpecialty(true);

    // Simulate creation delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Replace the specialty in the list
    const newSpecialty = {
      id: Date.now().toString(),
      icon: "✨",
      title: newSpecialtyName.trim(),
      description: `Page spécialité pour ${newSpecialtyName.trim()}`,
    };

    setData(prev => ({
      ...prev,
      specialties: prev.specialties.map(s =>
        s.id === specialtyToDelete.id ? newSpecialty : s
      ),
    }));

    setIsCreatingSpecialty(false);
    setCreatedSpecialty(newSpecialtyName.trim());
  };

  const handleFinishReplacement = () => {
    handleCancelDelete();
  };

  // Google connection (mock)
  const handleConnectGoogle = () => {
    // Mock Google connection
    setData(prev => ({
      ...prev,
      google: {
        connected: true,
        profile: {
          name: `${data.contact.firstName} ${data.contact.lastName}`.trim() || "Votre Cabinet",
          rating: 4.8,
          reviewCount: 42,
        },
      },
    }));
  };

  // Custom code handlers
  const addCustomCode = () => {
    const newId = Date.now().toString();
    const newSnippet = {
      id: newId,
      name: "",
      placement: "head",
      code: "",
    };
    setData(prev => ({
      ...prev,
      customCode: [...prev.customCode, newSnippet],
    }));
    setExpandedCodes(new Set([newId]));
  };

  const updateCustomCode = (id, updates) => {
    setData(prev => ({
      ...prev,
      customCode: prev.customCode.map(c =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
  };

  const removeCustomCode = (id) => {
    setData(prev => ({
      ...prev,
      customCode: prev.customCode.filter(c => c.id !== id),
    }));
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">
                  Vos informations de contact
                </h2>
                <p className="text-sm text-muted-foreground">
                  Affichées sur votre site pour que vos patients puissent vous contacter.
                </p>
              </div>
              <button
                onClick={() => handleValidateSection("contact")}
                disabled={!changedSections.has("contact")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all shrink-0",
                  validatedSection === "contact"
                    ? "bg-green-500 text-white"
                    : changedSections.has("contact")
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                )}
              >
                <Check className="w-4 h-4" />
                {validatedSection === "contact" ? "Validé !" : "Valider"}
              </button>
            </div>

            {/* Identity */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="firstName" className="text-xs">Prénom *</Label>
                  <Input
                    id="firstName"
                    value={data.contact.firstName}
                    onChange={(e) => updateContact({ firstName: e.target.value })}
                    placeholder="Jean"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lastName" className="text-xs">Nom *</Label>
                  <Input
                    id="lastName"
                    value={data.contact.lastName}
                    onChange={(e) => updateContact({ lastName: e.target.value })}
                    placeholder="Dupont"
                    className="h-9"
                  />
                </div>
              </div>
            </div>

            {/* Activity */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="profession" className="text-xs">Métier</Label>
                  <Input
                    id="profession"
                    value={data.contact.profession}
                    onChange={(e) => updateContact({ profession: e.target.value })}
                    placeholder="Ostéopathe"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="city" className="text-xs">Ville</Label>
                  <Input
                    id="city"
                    value={data.contact.city}
                    onChange={(e) => updateContact({ city: e.target.value })}
                    placeholder="Paris"
                    className="h-9"
                  />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="phoneNumber" className="text-xs">Téléphone</Label>
                  <Input
                    id="phoneNumber"
                    value={data.contact.phoneNumber}
                    onChange={(e) => updateContact({ phoneNumber: e.target.value })}
                    placeholder="06 12 34 56 78"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="appointmentLink" className="text-xs">Lien de réservation *</Label>
                  <Input
                    id="appointmentLink"
                    value={data.contact.appointmentLink}
                    onChange={(e) => updateContact({ appointmentLink: e.target.value })}
                    placeholder="https://doctolib.fr/..."
                    className="h-9"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Doctolib, Calendly, ou tout autre service de prise de rendez-vous
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">
                  Adresse(s) de votre cabinet
                </h2>
                <p className="text-sm text-muted-foreground">
                  Vos patients pourront localiser votre cabinet sur une carte.
                </p>
              </div>
              <button
                onClick={() => handleValidateSection("locations")}
                disabled={!changedSections.has("locations")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all shrink-0",
                  validatedSection === "locations"
                    ? "bg-green-500 text-white"
                    : changedSections.has("locations")
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                )}
              >
                <Check className="w-4 h-4" />
                {validatedSection === "locations" ? "Validé !" : "Valider"}
              </button>
            </div>

            <div className="space-y-3">
              {data.locations.map((location) => (
                <div
                  key={location.id}
                  className="p-3 bg-gray-50 rounded-xl flex gap-3"
                >
                  {/* Image upload */}
                  <button
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => updateLocation(location.id, { image: ev.target?.result });
                          reader.readAsDataURL(file);
                        }
                      };
                      input.click();
                    }}
                    className="w-20 h-20 rounded-xl bg-muted/60 border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 flex items-center justify-center shrink-0 overflow-hidden transition-colors"
                  >
                    {location.image ? (
                      <img src={location.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Image className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>

                  {/* Inputs */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <Input
                        value={location.title}
                        onChange={(e) => updateLocation(location.id, { title: e.target.value })}
                        placeholder="Nom du cabinet *"
                        className="h-8 text-sm"
                      />
                      <button
                        onClick={() => removeLocation(location.id)}
                        className="ml-2 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <Input
                      value={location.address}
                      onChange={(e) => updateLocation(location.id, { address: e.target.value })}
                      placeholder="Adresse complète *"
                      className="h-8 text-sm"
                    />
                    <Input
                      value={location.bookingLink}
                      onChange={(e) => updateLocation(location.id, { bookingLink: e.target.value })}
                      placeholder="Lien de réservation (Doctolib, Calendly...)"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              ))}

              {data.locations.length < 2 && (
                <button
                  onClick={addLocation}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm transition-colors",
                    data.locations.length === 0
                      ? "border-2 border-dashed border-primary/30 text-primary hover:border-primary/50 hover:bg-primary/5"
                      : "border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary/50 hover:text-primary"
                  )}
                >
                  <Plus className="w-4 h-4" />
                  {data.locations.length === 0 ? "Ajouter votre cabinet" : "Ajouter un second cabinet"}
                </button>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">
                  Équipe du cabinet
                </h2>
                <p className="text-sm text-muted-foreground">
                  Chaque thérapeute aura sa propre section sur votre site.
                </p>
              </div>
              <button
                onClick={() => handleValidateSection("therapists")}
                disabled={!changedSections.has("therapists")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all shrink-0",
                  validatedSection === "therapists"
                    ? "bg-green-500 text-white"
                    : changedSections.has("therapists")
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                )}
              >
                <Check className="w-4 h-4" />
                {validatedSection === "therapists" ? "Validé !" : "Valider"}
              </button>
            </div>

            <div className="space-y-3">
              {data.therapists.map((therapist, index) => {
                const isExpanded = expandedTherapists.has(therapist.id);
                const displayName = `Thérapeute ${index + 1}`;

                return (
                  <div
                    key={therapist.id}
                    className="bg-gray-50 rounded-xl overflow-hidden"
                  >
                    {/* Collapsible Header */}
                    <button
                      onClick={() => toggleTherapistExpanded(therapist.id)}
                      className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-muted/60 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary overflow-hidden shrink-0">
                          {therapist.photo ? (
                            <img src={therapist.photo} alt="" className="w-full h-full object-cover" />
                          ) : (
                            "T"
                          )}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-foreground">{displayName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          onClick={(e) => { e.stopPropagation(); removeTherapist(therapist.id); }}
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </span>
                        <ChevronDown className={cn(
                          "w-4 h-4 text-muted-foreground transition-transform",
                          isExpanded && "rotate-180"
                        )} />
                      </div>
                    </button>

                    {/* Collapsible Content */}
                    {isExpanded && (
                      <div className="px-3 pb-3 space-y-3 border-t border-border/50">
                        {/* Photo upload */}
                        <div className="flex items-center gap-3 pt-3">
                          {therapist.photo ? (
                            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-border/50">
                              <img src={therapist.photo} alt="" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                const input = document.createElement("input");
                                input.type = "file";
                                input.accept = "image/*";
                                input.onchange = (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => updateTherapist(therapist.id, { photo: ev.target?.result });
                                    reader.readAsDataURL(file);
                                  }
                                };
                                input.click();
                              }}
                              className="w-16 h-16 rounded-xl bg-muted/60 border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 flex items-center justify-center shrink-0 transition-colors"
                            >
                              <Image className="w-5 h-5 text-muted-foreground" />
                            </button>
                          )}
                          <p className="text-xs text-muted-foreground">Photo affichée sur la section "À propos" de votre site</p>
                        </div>

                        {/* Accroche -- maps to canvas aboutSectionTitle */}
                        <div className="space-y-1">
                          <Label className="text-xs">Accroche</Label>
                          <Input
                            value={therapist.accroche}
                            onChange={(e) => updateTherapist(therapist.id, { accroche: e.target.value })}
                            placeholder="Et si vous retrouviez confort et mobilité ?"
                            className="h-8 text-sm"
                          />
                        </div>

                        {/* Rich Text Presentation */}
                        <div className="space-y-1.5">
                          <Label className="text-xs">Présentation</Label>
                          <RichTextEditor
                            content={therapist.richTextPresentation}
                            onChange={(html) => updateTherapist(therapist.id, { richTextPresentation: html })}
                            placeholder="Présentez-vous et votre approche thérapeutique..."
                          />
                        </div>

                        {/* Session info -- matches canvas order */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Durée</Label>
                            <Input
                              value={therapist.duration}
                              onChange={(e) => updateTherapist(therapist.id, { duration: e.target.value })}
                              placeholder="45 min"
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Prix</Label>
                            <Input
                              value={therapist.price}
                              onChange={(e) => updateTherapist(therapist.id, { price: e.target.value })}
                              placeholder="60 €"
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Remboursement</Label>
                            <Input
                              value={therapist.reimbursement}
                              onChange={(e) => updateTherapist(therapist.id, { reimbursement: e.target.value })}
                              placeholder="Mutuelle"
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}

              <button
                onClick={addTherapist}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm transition-colors",
                  data.therapists.length === 0
                    ? "border-2 border-dashed border-primary/30 text-primary hover:border-primary/50 hover:bg-primary/5"
                    : "border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary/50 hover:text-primary"
                )}
              >
                <Plus className="w-4 h-4" />
                {data.therapists.length === 0 ? "Ajouter un thérapeute" : "Ajouter un autre thérapeute"}
              </button>

              {data.therapists.length === 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  Optionnel. Vous pourrez ajouter des thérapeutes plus tard.
                </p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">
                  Vos spécialités
                </h2>
                <p className="text-sm text-muted-foreground">
                  Chaque spécialité génère une page dédiée pour votre référencement.
                </p>
              </div>
              <button
                onClick={() => handleValidateSection("specialties")}
                disabled={!changedSections.has("specialties")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all shrink-0",
                  validatedSection === "specialties"
                    ? "bg-green-500 text-white"
                    : changedSections.has("specialties")
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                )}
              >
                <Check className="w-4 h-4" />
                {validatedSection === "specialties" ? "Validé !" : "Valider"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {data.specialties.map((specialty) => {
                const isEditing = editingSpecialtyId === specialty.id;
                return (
                  <div
                    key={specialty.id}
                    className="p-3 bg-gray-50 rounded-xl flex items-start gap-3 group relative"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl shrink-0">
                      {getIconEmoji(specialty.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground">{specialty.title}</h3>
                      {isEditing ? (
                        <textarea
                          value={specialty.description}
                          onChange={(e) => updateSpecialtyDescription(specialty.id, e.target.value)}
                          onBlur={() => setEditingSpecialtyId(null)}
                          className="w-full text-xs text-muted-foreground bg-white border rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-primary/30 resize-none mt-1"
                          rows={3}
                          autoFocus
                        />
                      ) : (
                        <p className="text-xs text-muted-foreground line-clamp-2">{specialty.description}</p>
                      )}
                    </div>
                    <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => setEditingSpecialtyId(specialty.id)}
                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSpecialtyClick(specialty)}
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Modifiable depuis l'éditeur après publication.
            </p>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">
                  Connectez votre fiche Google
                </h2>
                <p className="text-sm text-muted-foreground">
                  Vos avis Google seront automatiquement affichés sur votre site.
                </p>
              </div>
              <button
                onClick={() => handleValidateSection("google")}
                disabled={!changedSections.has("google")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all shrink-0",
                  validatedSection === "google"
                    ? "bg-green-500 text-white"
                    : changedSections.has("google")
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                )}
              >
                <Check className="w-4 h-4" />
                {validatedSection === "google" ? "Validé !" : "Valider"}
              </button>
            </div>

            {data.google.connected && data.google.profile ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {data.google.profile.name}
                    </p>
                    {data.google.profile.rating && (
                      <p className="text-xs text-muted-foreground">
                        {data.google.profile.rating}/5 · {data.google.profile.reviewCount} avis
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => window.open("https://business.google.com", "_blank")}
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setData(prev => ({ ...prev, google: { connected: false, profile: null } }))}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 border-2 border-dashed border-muted-foreground/20 rounded-xl text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    Importez automatiquement vos avis et informations
                  </p>
                  <Button size="sm" className="gap-2" onClick={handleConnectGoogle}>
                    <Building2 className="w-4 h-4" />
                    Connecter Google Business
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Optionnel. Configurable plus tard.
                </p>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">
                  Code personnalisé
                </h2>
                <p className="text-sm text-muted-foreground">
                  Google Tag Manager, widgets de chat, scripts analytics...
                </p>
              </div>
              <button
                onClick={() => handleValidateSection("customCode")}
                disabled={!changedSections.has("customCode")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all shrink-0",
                  validatedSection === "customCode"
                    ? "bg-green-500 text-white"
                    : changedSections.has("customCode")
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                )}
              >
                <Check className="w-4 h-4" />
                {validatedSection === "customCode" ? "Validé !" : "Valider"}
              </button>
            </div>

            <div className="space-y-3">
              {data.customCode.map((snippet, index) => {
                const isExpanded = expandedCodes.has(snippet.id);
                const displayName = snippet.name || `Code ${index + 1}`;

                return (
                  <div
                    key={snippet.id}
                    className="bg-gray-50 rounded-xl overflow-hidden"
                  >
                    {/* Collapsible Header */}
                    <button
                      onClick={() => toggleCodeExpanded(snippet.id)}
                      className="w-full p-2.5 flex items-center justify-between hover:bg-muted/60 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                          <Code className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-sm text-foreground">{displayName}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {snippet.placement === "head" ? "<head>" : "</body>"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span
                          onClick={(e) => { e.stopPropagation(); removeCustomCode(snippet.id); }}
                          className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </span>
                        <ChevronDown className={cn(
                          "w-3.5 h-3.5 text-muted-foreground transition-transform",
                          isExpanded && "rotate-180"
                        )} />
                      </div>
                    </button>

                    {/* Collapsible Content */}
                    {isExpanded && (
                      <div className="px-3 pb-3 space-y-2 border-t border-border/50">
                        <div className="space-y-1 pt-2">
                          <Label className="text-xs">Nom</Label>
                          <Input
                            value={snippet.name}
                            onChange={(e) => updateCustomCode(snippet.id, { name: e.target.value })}
                            placeholder="Ex: Google Tag Manager, Chat widget..."
                            className="h-8 text-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Emplacement</Label>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => updateCustomCode(snippet.id, { placement: "head" })}
                              className={cn(
                                "flex-1 py-1 px-2 rounded-lg text-xs font-medium transition-all border",
                                snippet.placement === "head"
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-muted/50 text-muted-foreground border-transparent hover:border-muted-foreground/30"
                              )}
                            >
                              &lt;head&gt;
                            </button>
                            <button
                              onClick={() => updateCustomCode(snippet.id, { placement: "body" })}
                              className={cn(
                                "flex-1 py-1 px-2 rounded-lg text-xs font-medium transition-all border",
                                snippet.placement === "body"
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-muted/50 text-muted-foreground border-transparent hover:border-muted-foreground/30"
                              )}
                            >
                              &lt;/body&gt;
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Code</Label>
                          <Textarea
                            value={snippet.code}
                            onChange={(e) => updateCustomCode(snippet.id, { code: e.target.value })}
                            placeholder="<!-- Collez votre code ici -->"
                            className="font-mono text-xs min-h-[60px]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <button
                onClick={addCustomCode}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-colors",
                  data.customCode.length === 0
                    ? "border-2 border-dashed border-primary/30 text-primary hover:border-primary/50 hover:bg-primary/5"
                    : "border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary/50 hover:text-primary"
                )}
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Ajouter un code</span>
              </button>

              {data.customCode.length === 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  Cette étape est optionnelle. Vous pourrez ajouter du code personnalisé plus tard.
                </p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gray-50 overflow-hidden flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-[1200px] px-6 pt-4 pb-1 shrink-0 z-[70]">
        <button
          onClick={onBackToEditor}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={16} />
          Retour à l'éditeur
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 overflow-hidden w-full max-w-[1200px] px-6 py-4 min-h-0">
        {/* Left Sidebar */}
        <div className="w-[240px] shrink-0 flex flex-col gap-4">
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
            <h2 className="text-base font-bold text-[#2D2D2D] mb-4">Configuration</h2>
            <div className="flex flex-col gap-0.5">
              {STEPS.map((step, index) => {
                const isActive = index === currentStep;
                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(index)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer text-left",
                      isActive ? "text-[#FC6D41] font-semibold" : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    {isActive && <div className="w-2 h-2 rounded-full bg-[#FC6D41]" />}
                    {step.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 overflow-auto min-h-0 rounded-2xl">
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 h-full overflow-auto">
            {renderStepContent()}
          </div>
        </div>
      </div>

      {/* Delete Specialty Modal */}
      {deleteModalOpen && specialtyToDelete && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleCancelDelete}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
              {!showReplaceInput && !createdSpecialty && (
                <>
                  {/* Warning state */}
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                      <span className="text-3xl">{"⚠️"}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Supprimer cette spécialité ?
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Attention : la page de spécialité <strong>"{specialtyToDelete.title}"</strong> va être supprimée.
                    </p>
                    <p className="text-muted-foreground text-sm mt-2">
                      Les articles associés seront redirigés vers votre page d'accueil.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleCancelDelete}
                    >
                      Non
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={handleConfirmDelete}
                    >
                      Oui
                    </Button>
                  </div>
                </>
              )}

              {showReplaceInput && !isCreatingSpecialty && !createdSpecialty && (
                <>
                  {/* Replace input state */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Nouvelle spécialité
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Quelle spécialité souhaitez-vous créer à la place ?
                    </p>
                    <Input
                      value={newSpecialtyName}
                      onChange={(e) => setNewSpecialtyName(e.target.value)}
                      placeholder="Ex: Mal de dos, Migraines, Stress..."
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleCancelDelete}
                    >
                      Annuler
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleCreateReplacement}
                      disabled={!newSpecialtyName.trim()}
                    >
                      Valider
                    </Button>
                  </div>
                </>
              )}

              {isCreatingSpecialty && (
                <>
                  {/* Loading state */}
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                      <span className="text-3xl">{"⏳"}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Création en cours...
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Veuillez patienter le temps que l'on crée la page "{newSpecialtyName}".
                    </p>
                  </div>
                </>
              )}

              {createdSpecialty && (
                <>
                  {/* Success state */}
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                      <span className="text-3xl">{"\ud83c\udf89"}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Félicitations !
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      La page <strong>"{createdSpecialty}"</strong> a été créée avec succès.
                    </p>
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleFinishReplacement}
                  >
                    Valider la page pour la publier
                  </Button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Therapist Photo Crop Modal */}
      {therapistToCrop && data.therapists.find(t => t.id === therapistToCrop)?.photo && (
        <ImageCropModal
          open={therapistCropOpen}
          onOpenChange={setTherapistCropOpen}
          imageSrc={data.therapists.find(t => t.id === therapistToCrop).photo}
          aspect={1}
          onCropComplete={(croppedUrl) => {
            updateTherapist(therapistToCrop, { photo: croppedUrl });
            setTherapistCropOpen(false);
            setTherapistToCrop(null);
          }}
        />
      )}
    </div>
  );
};

export default Setup;
