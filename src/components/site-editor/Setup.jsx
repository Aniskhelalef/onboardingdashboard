import { useState, useEffect, useRef } from "react";
import { User, MapPin, Building2, ChevronRight, ChevronDown, Plus, Trash2, ExternalLink, Users, Star, Code, Image, ArrowLeft, Pencil, Crop, Check, Globe, Search, Loader2 } from "lucide-react";
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
  { id: "domain", label: "Domaine", icon: Globe, description: "Nom de domaine personnalisé" },
  { id: "code", label: "Code", icon: Code, description: "Code personnalisé" },
];

// Airbnb-flow helper components (defined outside to avoid DOM repaint)
const ProgressDots = ({ total, current }) => (
  <div className="flex items-center gap-2 mb-8">
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} className={`rounded-full transition-all duration-300 ${current > i ? 'w-2 h-2 bg-[#FC6D41]' : current === i ? 'w-6 h-2 bg-[#FC6D41]' : 'w-2 h-2 bg-gray-200'}`} />
    ))}
  </div>
);

const SteppedFlowWrapper = ({ children }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[400px]" style={{ animation: 'tab-fade-in 0.35s cubic-bezier(0.4, 0, 0.2, 1)' }}>
    {children}
  </div>
);

const IntroStep = ({ icon: Icon, title, description, ctaText, onCta, onSkip, children }) => (
  <div className="flex flex-col items-center text-center max-w-sm" style={{ animation: 'tab-fade-in 0.3s ease' }}>
    <div className="w-16 h-16 rounded-2xl bg-[#FC6D41]/10 flex items-center justify-center mb-5">
      <Icon className="w-8 h-8 text-[#FC6D41]" />
    </div>
    <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
    <p className="text-sm text-muted-foreground leading-relaxed mb-6">{description}</p>
    {children}
    <button onClick={onCta} className="px-8 py-3 rounded-xl bg-[#FC6D41] text-white text-sm font-semibold hover:bg-[#e55e35] transition-colors cursor-pointer">
      {ctaText}
    </button>
    {onSkip && (
      <button onClick={onSkip} className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
        Plus tard
      </button>
    )}
  </div>
);

const SavingStep = ({ icon: Icon, title, description, onComplete, onValidate }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onValidate) onValidate();
      onComplete();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="flex flex-col items-center text-center max-w-sm" style={{ animation: 'tab-fade-in 0.3s ease' }}>
      <div className="w-16 h-16 rounded-2xl bg-[#FC6D41]/10 flex items-center justify-center mb-5 animate-pulse">
        <Icon className="w-8 h-8 text-[#FC6D41]" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">{title || "Enregistrement..."}</h2>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      <div className="w-48 h-1 bg-gray-200 rounded-full mt-6 overflow-hidden">
        <div className="h-full bg-[#FC6D41] rounded-full" style={{ animation: 'domain-progress 1.5s ease-in-out forwards' }} />
      </div>
    </div>
  );
};

const DemoResetButton = ({ onClick }) => (
  <button onClick={onClick} className="text-sm text-gray-400 hover:text-gray-600 border border-gray-200 px-2 py-1 rounded-lg transition-colors shrink-0">Demo: reset</button>
);

const Setup = ({ onBackToEditor, initialStep }) => {
  const stepParam = initialStep || "0";
  const resolvedInitialStep = isNaN(Number(stepParam))
    ? Math.max(STEPS.findIndex(s => s.id === stepParam), 0)
    : parseInt(stepParam, 10);
  const [currentStep, setCurrentStep] = useState(Math.min(Math.max(resolvedInitialStep, 0), STEPS.length - 1));
  const [expandedTherapists, setExpandedTherapists] = useState(new Set());
  const [expandedCodes, setExpandedCodes] = useState(new Set());
  // Airbnb-style stepped flow states
  const [contactCompleted, setContactCompleted] = useState(false);
  const [contactStep, setContactStep] = useState(0);
  const [cabinetCompleted, setCabinetCompleted] = useState(false);
  const [cabinetStep, setCabinetStep] = useState(0);
  const [therapistsCompleted, setTherapistsCompleted] = useState(false);
  const [therapistsStep, setTherapistsStep] = useState(0);
  const [specialtiesCompleted, setSpecialtiesCompleted] = useState(false);
  const [specialtiesStep, setSpecialtiesStep] = useState(0);
  const [googleCompleted, setGoogleCompleted] = useState(false);
  const [googleStep, setGoogleStep] = useState(0);
  const [googleQuery, setGoogleQuery] = useState("");
  const [googleResults, setGoogleResults] = useState([]);
  const [googleSearching, setGoogleSearching] = useState(false);
  const [selectedGoogleResult, setSelectedGoogleResult] = useState(null);
  // Edit index trackers (which item is being edited in multi-item tabs)
  const [editingCabinetIdx, setEditingCabinetIdx] = useState(0);
  const [editingTherapistIdx, setEditingTherapistIdx] = useState(0);
  // Domain tab state
  const [domainBought, setDomainBought] = useState(false);
  const [domainStep, setDomainStep] = useState(0);
  const [domainSearch, setDomainSearch] = useState('');
  const [domainSearchResult, setDomainSearchResult] = useState(null);
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
  const [pickingIconForId, setPickingIconForId] = useState(null);
  const [newSpecialtyIcon, setNewSpecialtyIcon] = useState("✨");
  const [reviewingSpecialtyIdx, setReviewingSpecialtyIdx] = useState(0);

  const SPECIALTY_EMOJIS = ["🦴", "🤰", "👶", "⚽", "💼", "🧓", "🧠", "💆", "🏃", "❤️", "🌿", "🔥", "🎯", "✨", "🩺", "🧘", "😴", "🦵", "👩‍⚕️", "🤕"];

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
      accroche: "",
      richTextPresentation: "<p>Diplômé(e) en ostéopathie, je vous accueille dans mon cabinet pour vous accompagner vers un mieux-être durable.</p><p>Mon approche se veut globale et personnalisée : chaque patient est unique, chaque douleur a son histoire.</p>",
      price: "60 €",
      duration: "45 min",
      reimbursement: "Remboursement mutuelle possible",
      bookingLink: "",
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
    setNewSpecialtyIcon("✨");
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
      icon: newSpecialtyIcon,
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
  // Google Places: load Maps JS SDK once
  const googleMapsLoaded = useRef(false);
  const autocompleteService = useRef(null);
  const placesService = useRef(null);
  const placesDiv = useRef(null);

  const loadGoogleMaps = () => {
    return new Promise((resolve) => {
      if (window.google?.maps?.places) { resolve(); return; }
      if (googleMapsLoaded.current) {
        const check = setInterval(() => { if (window.google?.maps?.places) { clearInterval(check); resolve(); } }, 100);
        return;
      }
      googleMapsLoaded.current = true;
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY}&libraries=places&language=fr`;
      script.async = true;
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  };

  const searchGooglePlaces = async (query) => {
    if (!query.trim()) { setGoogleResults([]); return; }
    setGoogleSearching(true);
    try {
      await loadGoogleMaps();
      if (!autocompleteService.current) {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
      }
      if (!placesDiv.current) {
        placesDiv.current = document.createElement("div");
      }
      if (!placesService.current) {
        placesService.current = new window.google.maps.places.PlacesService(placesDiv.current);
      }

      // Autocomplete predictions
      const predictions = await new Promise((resolve) => {
        autocompleteService.current.getPlacePredictions(
          { input: query, types: ["establishment"], componentRestrictions: { country: "fr" } },
          (results) => resolve(results || [])
        );
      });

      // Get details for each (up to 5)
      const details = await Promise.all(
        predictions.slice(0, 5).map((pred) =>
          new Promise((resolve) => {
            placesService.current.getDetails(
              { placeId: pred.place_id, fields: ["name", "formatted_address", "rating", "user_ratings_total", "place_id"] },
              (place) => resolve(place ? {
                placeId: place.place_id,
                name: place.name,
                address: place.formatted_address,
                rating: place.rating || null,
                reviewCount: place.user_ratings_total || 0,
              } : null)
            );
          })
        )
      );
      setGoogleResults(details.filter(Boolean));
    } catch {
      setGoogleResults([]);
    }
    setGoogleSearching(false);
  };

  // Debounce Google search
  const googleSearchTimeout = useRef(null);
  const handleGoogleQueryChange = (value) => {
    setGoogleQuery(value);
    setSelectedGoogleResult(null);
    if (googleSearchTimeout.current) clearTimeout(googleSearchTimeout.current);
    googleSearchTimeout.current = setTimeout(() => searchGooglePlaces(value), 400);
  };

  const handleConnectGoogle = (result) => {
    const r = result || selectedGoogleResult;
    setData(prev => ({
      ...prev,
      google: {
        connected: true,
        profile: {
          name: r?.name || "Votre Cabinet",
          rating: r?.rating || null,
          reviewCount: r?.reviewCount || 0,
          address: r?.address || "",
          placeId: r?.placeId || null,
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
        // Flat edit mode (after first completion)
        if (contactStep === -1) return (
          <div className="space-y-4" style={{ animation: 'tab-fade-in 0.3s ease' }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">Informations de contact</h2>
                <p className="text-sm text-muted-foreground">Modifiez vos informations personnelles.</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Prénom</Label>
                  <Input value={data.contact.firstName} onChange={(e) => updateContact({ firstName: e.target.value })} placeholder="Jean" className="h-10" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Nom</Label>
                  <Input value={data.contact.lastName} onChange={(e) => updateContact({ lastName: e.target.value })} placeholder="Dupont" className="h-10" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Métier</Label>
                  <Input value={data.contact.profession} onChange={(e) => updateContact({ profession: e.target.value })} placeholder="Ostéopathe D.O" className="h-10" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Ville</Label>
                  <Input value={data.contact.city} onChange={(e) => updateContact({ city: e.target.value })} placeholder="Lyon" className="h-10" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Téléphone</Label>
                <Input value={data.contact.phoneNumber} onChange={(e) => updateContact({ phoneNumber: e.target.value })} placeholder="06 12 34 56 78" className="h-10" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Lien de réservation</Label>
                <Input value={data.contact.appointmentLink} onChange={(e) => updateContact({ appointmentLink: e.target.value })} placeholder="https://doctolib.fr/..." className="h-10" />
                <p className="text-sm text-muted-foreground">Doctolib, Calendly, ou tout autre service</p>
              </div>
            </div>
            <button
              onClick={() => { handleValidateSection("contact"); setContactCompleted(true); setContactStep(0); }}
              className="w-full px-6 py-2.5 rounded-xl bg-[#FC6D41] text-white text-sm font-semibold hover:bg-[#e55e35] transition-colors cursor-pointer"
            >
              Enregistrer
            </button>
          </div>
        );

        return contactCompleted ? (
          <div className="space-y-4" style={{ animation: 'tab-fade-in 0.3s ease' }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">Informations de contact</h2>
                <p className="text-sm text-muted-foreground">Vos informations sont à jour.</p>
              </div>
              <button onClick={() => { setContactCompleted(false); setContactStep(-1); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-gray-100 transition-all shrink-0 cursor-pointer">
                <Pencil className="w-3.5 h-3.5" />
                Modifier
              </button>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              {data.contact.firstName && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Nom</span>
                  <span className="text-sm font-semibold text-foreground">{data.contact.firstName} {data.contact.lastName}</span>
                </div>
              )}
              {data.contact.profession && (
                <>
                  <div className="h-px bg-gray-200" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Métier</span>
                    <span className="text-sm text-foreground">{data.contact.profession}</span>
                  </div>
                </>
              )}
              {data.contact.city && (
                <>
                  <div className="h-px bg-gray-200" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Ville</span>
                    <span className="text-sm text-foreground">{data.contact.city}</span>
                  </div>
                </>
              )}
              {data.contact.phoneNumber && (
                <>
                  <div className="h-px bg-gray-200" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Téléphone</span>
                    <span className="text-sm text-foreground">{data.contact.phoneNumber}</span>
                  </div>
                </>
              )}
              {data.contact.appointmentLink && (
                <>
                  <div className="h-px bg-gray-200" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Réservation</span>
                    <span className="text-sm text-[#FC6D41] font-medium truncate max-w-[200px]">{data.contact.appointmentLink}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <SteppedFlowWrapper>
            <ProgressDots total={4} current={contactStep} />

            {/* Step 0 — Intro */}
            {contactStep === 0 && (
              <IntroStep
                icon={User}
                title="Qui êtes-vous ?"
                description="Vos patients ont besoin de savoir à qui ils confient leur santé. Renseignez vos informations pour personnaliser votre site."
                ctaText="Commencer"
                onCta={() => setContactStep(1)}
                onSkip={() => setContactStep(0)}
              />
            )}

            {/* Step 1 — Identity */}
            {contactStep === 1 && (
              <div className="flex flex-col items-center text-center w-full max-w-sm" style={{ animation: 'tab-fade-in 0.3s ease' }}>
                <h2 className="text-2xl font-bold text-foreground mb-1">Comment vous appelez-vous ?</h2>
                <p className="text-sm text-muted-foreground mb-6">Votre nom sera affiché sur votre site professionnel.</p>
                <div className="w-full space-y-3 text-left">
                  <div className="space-y-1">
                    <Label htmlFor="firstName" className="text-xs">Prénom *</Label>
                    <Input id="firstName" value={data.contact.firstName} onChange={(e) => updateContact({ firstName: e.target.value })} placeholder="Jean" className="h-11 text-base" autoFocus />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lastName" className="text-xs">Nom *</Label>
                    <Input id="lastName" value={data.contact.lastName} onChange={(e) => updateContact({ lastName: e.target.value })} placeholder="Dupont" className="h-11 text-base" />
                  </div>
                </div>
                <button
                  onClick={() => setContactStep(2)}
                  disabled={!data.contact.firstName.trim() || !data.contact.lastName.trim()}
                  className={cn("mt-6 px-8 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer w-full", data.contact.firstName.trim() && data.contact.lastName.trim() ? "bg-[#FC6D41] text-white hover:bg-[#e55e35]" : "bg-gray-200 text-gray-400 cursor-not-allowed")}
                >
                  Continuer
                </button>
                <button onClick={() => setContactStep(0)} className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Retour</button>
              </div>
            )}

            {/* Step 2 — Activity */}
            {contactStep === 2 && (
              <div className="flex flex-col items-center text-center w-full max-w-sm" style={{ animation: 'tab-fade-in 0.3s ease' }}>
                <h2 className="text-2xl font-bold text-foreground mb-1">Quelle est votre activité ?</h2>
                <p className="text-sm text-muted-foreground mb-6">Aidez vos patients à vous trouver en précisant votre métier et votre ville.</p>
                <div className="w-full space-y-3 text-left">
                  <div className="space-y-1">
                    <Label htmlFor="profession" className="text-xs">Métier *</Label>
                    <Input id="profession" value={data.contact.profession} onChange={(e) => updateContact({ profession: e.target.value })} placeholder="Ostéopathe D.O" className="h-11 text-base" autoFocus />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="city" className="text-xs">Ville *</Label>
                    <Input id="city" value={data.contact.city} onChange={(e) => updateContact({ city: e.target.value })} placeholder="Lyon" className="h-11 text-base" />
                  </div>
                </div>
                <button
                  onClick={() => setContactStep(3)}
                  disabled={!data.contact.profession.trim()}
                  className={cn("mt-6 px-8 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer w-full", data.contact.profession.trim() ? "bg-[#FC6D41] text-white hover:bg-[#e55e35]" : "bg-gray-200 text-gray-400 cursor-not-allowed")}
                >
                  Continuer
                </button>
                <button onClick={() => setContactStep(1)} className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Retour</button>
              </div>
            )}

            {/* Step 3 — Contact info */}
            {contactStep === 3 && (
              <div className="flex flex-col items-center text-center w-full max-w-sm" style={{ animation: 'tab-fade-in 0.3s ease' }}>
                <h2 className="text-2xl font-bold text-foreground mb-1">Comment vous contacter ?</h2>
                <p className="text-sm text-muted-foreground mb-6">Vos patients pourront prendre rendez-vous directement depuis votre site.</p>
                <div className="w-full space-y-3 text-left">
                  <div className="space-y-1">
                    <Label htmlFor="phoneNumber" className="text-xs">Téléphone</Label>
                    <Input id="phoneNumber" value={data.contact.phoneNumber} onChange={(e) => updateContact({ phoneNumber: e.target.value })} placeholder="06 12 34 56 78" className="h-11 text-base" autoFocus />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="appointmentLink" className="text-xs">Lien de réservation *</Label>
                    <Input id="appointmentLink" value={data.contact.appointmentLink} onChange={(e) => updateContact({ appointmentLink: e.target.value })} placeholder="https://doctolib.fr/..." className="h-11 text-base" />
                    <p className="text-sm text-muted-foreground">Doctolib, Calendly, ou tout autre service de prise de rendez-vous</p>
                  </div>
                </div>
                <button
                  onClick={() => setContactStep(4)}
                  className="mt-6 px-8 py-3 rounded-xl bg-[#FC6D41] text-white text-sm font-semibold hover:bg-[#e55e35] transition-colors cursor-pointer w-full"
                >
                  Enregistrer
                </button>
                <button onClick={() => setContactStep(2)} className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Retour</button>
              </div>
            )}

            {/* Step 4 — Saving */}
            {contactStep === 4 && (
              <SavingStep
                icon={User}
                description="Mise à jour de vos informations de contact"
                onValidate={() => handleValidateSection("contact")}
                onComplete={() => { setContactCompleted(true); setContactStep(0); }}
              />
            )}
          </SteppedFlowWrapper>
        );

      case 1:
        // Flat edit mode (after first completion)
        if (cabinetStep === -1) {
          const idx = Math.min(editingCabinetIdx, data.locations.length - 1);
          const loc = data.locations[idx];
          return (
            <div className="space-y-4" style={{ animation: 'tab-fade-in 0.3s ease' }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-1">Adresse(s) de cabinet</h2>
                  <p className="text-sm text-muted-foreground">Modifiez les informations de vos cabinets.</p>
                </div>
              </div>
              {/* Nav pills */}
              {data.locations.length > 1 && (
                <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
                  {data.locations.map((l, i) => (
                    <button key={l.id} onClick={() => setEditingCabinetIdx(i)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer", i === idx ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                      {l.title || `Cabinet ${i + 1}`}
                    </button>
                  ))}
                </div>
              )}
              {loc && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file"; input.accept = "image/*";
                        input.onchange = (e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = (ev) => updateLocation(loc.id, { image: ev.target?.result }); reader.readAsDataURL(file); } };
                        input.click();
                      }}
                      className="w-14 h-14 rounded-xl bg-muted/60 border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 flex items-center justify-center shrink-0 overflow-hidden transition-colors"
                    >
                      {loc.image ? <img src={loc.image} alt="" className="w-full h-full object-cover" /> : <Image className="w-5 h-5 text-muted-foreground" />}
                    </button>
                    <div className="flex-1 min-w-0 space-y-1">
                      <Label className="text-xs">Nom du cabinet</Label>
                      <Input value={loc.title} onChange={(e) => updateLocation(loc.id, { title: e.target.value })} placeholder="Cabinet Dupont" className="h-10" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Adresse complète</Label>
                    <Input value={loc.address} onChange={(e) => updateLocation(loc.id, { address: e.target.value })} placeholder="12 rue de la Santé, 75014 Paris" className="h-10" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Lien de réservation</Label>
                    <Input value={loc.bookingLink} onChange={(e) => updateLocation(loc.id, { bookingLink: e.target.value })} placeholder="https://doctolib.fr/..." className="h-10" />
                  </div>
                </div>
              )}
              {data.locations.length < 2 && (
                <button
                  onClick={() => { addLocation(); setEditingCabinetIdx(data.locations.length); }}
                  className="flex items-center justify-center gap-1.5 w-full p-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm text-muted-foreground hover:border-[#FC6D41]/40 hover:text-[#FC6D41] transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter un second cabinet
                </button>
              )}
              <button
                onClick={() => { handleValidateSection("locations"); setCabinetCompleted(true); setCabinetStep(0); }}
                className="w-full px-6 py-2.5 rounded-xl bg-[#FC6D41] text-white text-sm font-semibold hover:bg-[#e55e35] transition-colors cursor-pointer"
              >
                Enregistrer
              </button>
            </div>
          );
        }

        return cabinetCompleted ? (
          <div className="space-y-4" style={{ animation: 'tab-fade-in 0.3s ease' }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">Adresse(s) de cabinet</h2>
                <p className="text-sm text-muted-foreground">{data.locations.length} cabinet{data.locations.length > 1 ? 's' : ''} configuré{data.locations.length > 1 ? 's' : ''}.</p>
              </div>
              <button onClick={() => { setCabinetCompleted(false); setEditingCabinetIdx(0); setCabinetStep(-1); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-gray-100 transition-all shrink-0 cursor-pointer">
                <Pencil className="w-3.5 h-3.5" />
                Modifier
              </button>
            </div>
            {data.locations.map((location) => (
              <div key={location.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-[#FC6D41]/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {location.image ? (
                    <img src={location.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <MapPin className="w-5 h-5 text-[#FC6D41]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{location.title || "Cabinet"}</p>
                  <p className="text-xs text-muted-foreground truncate">{location.address}</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold shrink-0">Configuré</span>
              </div>
            ))}
          </div>
        ) : (
          <SteppedFlowWrapper>
            <ProgressDots total={3} current={cabinetStep} />

            {/* Step 0 — Intro */}
            {cabinetStep === 0 && (
              <IntroStep
                icon={MapPin}
                title="Où exercez-vous ?"
                description="Vos patients pourront localiser votre cabinet sur une carte interactive. Ajoutez jusqu'à 2 adresses si vous exercez dans plusieurs cabinets."
                ctaText="Ajouter mon cabinet"
                onCta={() => { if (data.locations.length === 0) addLocation(); setCabinetStep(1); }}
                onSkip={() => setCabinetStep(0)}
              />
            )}

            {/* Step 1 — Fill cabinet info */}
            {cabinetStep === 1 && (() => {
              const idx = Math.min(editingCabinetIdx, data.locations.length - 1);
              const loc = data.locations[idx];
              if (!loc) return null;
              return (
                <div className="flex flex-col items-center text-center w-full max-w-sm" style={{ animation: 'tab-fade-in 0.3s ease' }}>
                  {/* Nav pills for multiple cabinets */}
                  {data.locations.length > 1 && (
                    <div className="flex items-center gap-1 mb-4 p-1 bg-gray-100 rounded-xl">
                      {data.locations.map((l, i) => (
                        <button key={l.id} onClick={() => setEditingCabinetIdx(i)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer", i === idx ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                          {l.title || `Cabinet ${i + 1}`}
                        </button>
                      ))}
                    </div>
                  )}

                  <h2 className="text-2xl font-bold text-foreground mb-1">Cabinet {idx + 1}</h2>
                  <p className="text-sm text-muted-foreground mb-6">Renseignez les informations de votre {idx === 0 ? 'cabinet' : 'second cabinet'}.</p>

                  <div className="w-full space-y-3 text-left">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "image/*";
                          input.onchange = (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => updateLocation(loc.id, { image: ev.target?.result });
                              reader.readAsDataURL(file);
                            }
                          };
                          input.click();
                        }}
                        className="w-16 h-16 rounded-xl bg-muted/60 border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 flex items-center justify-center shrink-0 overflow-hidden transition-colors"
                      >
                        {loc.image ? <img src={loc.image} alt="" className="w-full h-full object-cover" /> : <Image className="w-5 h-5 text-muted-foreground" />}
                      </button>
                      <div className="flex-1 min-w-0 space-y-1">
                        <Label className="text-xs">Nom du cabinet *</Label>
                        <Input value={loc.title} onChange={(e) => updateLocation(loc.id, { title: e.target.value })} placeholder="Cabinet Dupont" className="h-11 text-base" autoFocus />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Adresse complète *</Label>
                      <Input value={loc.address} onChange={(e) => updateLocation(loc.id, { address: e.target.value })} placeholder="12 rue de la Santé, 75014 Paris" className="h-11 text-base" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Lien de réservation</Label>
                      <Input value={loc.bookingLink} onChange={(e) => updateLocation(loc.id, { bookingLink: e.target.value })} placeholder="https://doctolib.fr/..." className="h-11 text-base" />
                      <p className="text-sm text-muted-foreground">Doctolib, Calendly, ou tout autre service</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setCabinetStep(2)}
                    disabled={!loc.title?.trim() || !loc.address?.trim()}
                    className={cn("mt-6 px-8 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer w-full", loc.title?.trim() && loc.address?.trim() ? "bg-[#FC6D41] text-white hover:bg-[#e55e35]" : "bg-gray-200 text-gray-400 cursor-not-allowed")}
                  >
                    Continuer
                  </button>
                  <button onClick={() => setCabinetStep(0)} className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Retour</button>
                </div>
              );
            })()}

            {/* Step 2 — Add another? */}
            {cabinetStep === 2 && (
              <div className="flex flex-col items-center text-center max-w-sm" style={{ animation: 'tab-fade-in 0.3s ease' }}>
                <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mb-5">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {data.locations.length === 1 ? "Cabinet ajouté !" : `${data.locations.length} cabinets ajoutés !`}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                  {data.locations.map(l => l.title).filter(Boolean).join(' & ')}
                </p>

                {data.locations.length < 2 ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-6">Exercez-vous dans un second cabinet ?</p>
                    <button
                      onClick={() => setCabinetStep(3)}
                      className="px-8 py-3 rounded-xl bg-[#FC6D41] text-white text-sm font-semibold hover:bg-[#e55e35] transition-colors cursor-pointer w-full"
                    >
                      Enregistrer
                    </button>
                    <button
                      onClick={() => { addLocation(); setCabinetStep(1); }}
                      className="mt-3 text-xs text-muted-foreground hover:text-[#FC6D41] transition-colors cursor-pointer"
                    >
                      + Ajouter un second cabinet
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setCabinetStep(3)}
                    className="mt-4 px-8 py-3 rounded-xl bg-[#FC6D41] text-white text-sm font-semibold hover:bg-[#e55e35] transition-colors cursor-pointer w-full"
                  >
                    Enregistrer
                  </button>
                )}
                <button onClick={() => setCabinetStep(1)} className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Retour</button>
              </div>
            )}

            {/* Step 3 — Saving */}
            {cabinetStep === 3 && (
              <SavingStep
                icon={MapPin}
                description="Mise à jour de vos adresses de cabinet"
                onValidate={() => handleValidateSection("locations")}
                onComplete={() => { setCabinetCompleted(true); setCabinetStep(0); }}
              />
            )}
          </SteppedFlowWrapper>
        );

      case 2:
        // Flat edit mode (after first completion)
        if (therapistsStep === -1) {
          const idx = Math.min(editingTherapistIdx, data.therapists.length - 1);
          const t = data.therapists[idx];
          return (
            <div className="space-y-4" style={{ animation: 'tab-fade-in 0.3s ease' }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-1">Équipe du cabinet</h2>
                  <p className="text-sm text-muted-foreground">Modifiez les informations de vos thérapeutes.</p>
                </div>
              </div>
              {/* Nav pills */}
              {data.therapists.length > 1 && (
                <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
                  {data.therapists.map((th, i) => (
                    <button key={th.id} onClick={() => setEditingTherapistIdx(i)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer", i === idx ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                      {th.accroche?.split(' ').slice(0, 2).join(' ') || `Thérapeute ${i + 1}`}
                    </button>
                  ))}
                </div>
              )}
              {t && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file"; input.accept = "image/*";
                        input.onchange = (e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = (ev) => updateTherapist(t.id, { photo: ev.target?.result }); reader.readAsDataURL(file); } };
                        input.click();
                      }}
                      className="w-14 h-14 rounded-full bg-muted/60 border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 flex items-center justify-center shrink-0 overflow-hidden transition-colors"
                    >
                      {t.photo ? <img src={t.photo} alt="" className="w-full h-full object-cover" /> : <Image className="w-5 h-5 text-muted-foreground" />}
                    </button>
                    <div className="flex-1 min-w-0 space-y-1">
                      <Label className="text-xs">Nom Prénom Métier Ville</Label>
                      <Input value={t.accroche} onChange={(e) => updateTherapist(t.id, { accroche: e.target.value })} placeholder={`${data.contact.lastName || "Dupont"} ${data.contact.firstName || "Marie"} ${data.contact.profession || "Ostéopathe"} à ${data.contact.city || "Lyon"}`} className="h-10" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Présentation</Label>
                    <RichTextEditor content={t.richTextPresentation} onChange={(html) => updateTherapist(t.id, { richTextPresentation: html })} placeholder="Présentez-vous et votre approche thérapeutique..." />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Durée</Label>
                      <Input value={t.duration} onChange={(e) => updateTherapist(t.id, { duration: e.target.value })} placeholder="45 min" className="h-10" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Prix</Label>
                      <Input value={t.price} onChange={(e) => updateTherapist(t.id, { price: e.target.value })} placeholder="60 €" className="h-10" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Remboursement</Label>
                      <Input value={t.reimbursement} onChange={(e) => updateTherapist(t.id, { reimbursement: e.target.value })} placeholder="Mutuelle" className="h-10" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Lien de réservation</Label>
                    <Input value={t.bookingLink || ''} onChange={(e) => updateTherapist(t.id, { bookingLink: e.target.value })} placeholder="https://doctolib.fr/..." className="h-10" />
                  </div>
                </div>
              )}
              <button
                onClick={() => { addTherapist(); setEditingTherapistIdx(data.therapists.length); }}
                className="flex items-center justify-center gap-1.5 w-full p-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm text-muted-foreground hover:border-[#FC6D41]/40 hover:text-[#FC6D41] transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Ajouter un thérapeute
              </button>
              <button
                onClick={() => { handleValidateSection("therapists"); setTherapistsCompleted(true); setTherapistsStep(0); }}
                className="w-full px-6 py-2.5 rounded-xl bg-[#FC6D41] text-white text-sm font-semibold hover:bg-[#e55e35] transition-colors cursor-pointer"
              >
                Enregistrer
              </button>
            </div>
          );
        }

        return therapistsCompleted ? (
          <div className="space-y-4" style={{ animation: 'tab-fade-in 0.3s ease' }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">Équipe du cabinet</h2>
                <p className="text-sm text-muted-foreground">{data.therapists.length > 0 ? `${data.therapists.length} thérapeute${data.therapists.length > 1 ? 's' : ''} configuré${data.therapists.length > 1 ? 's' : ''}.` : "Aucun thérapeute ajouté."}</p>
              </div>
              <button onClick={() => { setTherapistsCompleted(false); setEditingTherapistIdx(0); setTherapistsStep(-1); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-gray-100 transition-all shrink-0 cursor-pointer">
                <Pencil className="w-3.5 h-3.5" />
                Modifier
              </button>
            </div>
            {data.therapists.length > 0 ? (
              <div className="space-y-2">
                {data.therapists.map((therapist, index) => (
                  <div key={therapist.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary overflow-hidden shrink-0">
                      {therapist.photo ? (
                        <img src={therapist.photo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        "T"
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{therapist.accroche?.split(' ').slice(0, 2).join(' ') || `Thérapeute ${index + 1}`}</p>
                      {therapist.accroche && <p className="text-xs text-muted-foreground truncate">{therapist.accroche}</p>}
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold shrink-0">Configuré</span>
                  </div>
                ))}
                <button
                  onClick={() => { addTherapist(); setEditingTherapistIdx(data.therapists.length); setTherapistsCompleted(false); setTherapistsStep(-1); }}
                  className="flex items-center justify-center gap-1.5 w-full p-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm text-muted-foreground hover:border-[#FC6D41]/40 hover:text-[#FC6D41] transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter un thérapeute
                </button>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <p className="text-sm text-muted-foreground">Vous pourrez ajouter des thérapeutes plus tard.</p>
              </div>
            )}
          </div>
        ) : (
          <SteppedFlowWrapper>
            <ProgressDots total={4} current={therapistsStep} />

            {/* Step 0 — Intro */}
            {therapistsStep === 0 && (
              <IntroStep
                icon={Users}
                title="Présentez votre équipe"
                description="Chaque thérapeute aura sa propre section sur votre site. Ajoutez une photo, une accroche et une présentation pour humaniser votre cabinet."
                ctaText="Ajouter un thérapeute"
                onCta={() => { if (data.therapists.length === 0) addTherapist(); setEditingTherapistIdx(data.therapists.length === 0 ? 0 : data.therapists.length - 1); setTherapistsStep(1); }}
                onSkip={() => { setTherapistsCompleted(true); }}
              >
                <p className="text-xs text-muted-foreground mb-4">Optionnel — vous pourrez en ajouter plus tard.</p>
              </IntroStep>
            )}

            {/* Step 1 — Photo + Accroche */}
            {therapistsStep === 1 && (() => {
              const idx = Math.min(editingTherapistIdx, data.therapists.length - 1);
              const t = data.therapists[idx];
              if (!t) return null;
              return (
                <div className="flex flex-col items-center text-center w-full max-w-sm" style={{ animation: 'tab-fade-in 0.3s ease' }}>
                  {/* Nav pills for multiple therapists */}
                  {data.therapists.length > 1 && (
                    <div className="flex items-center gap-1 mb-4 p-1 bg-gray-100 rounded-xl">
                      {data.therapists.map((th, i) => (
                        <button key={th.id} onClick={() => setEditingTherapistIdx(i)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer", i === idx ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                          {th.accroche?.split(' ').slice(0, 2).join(' ') || `Thérapeute ${i + 1}`}
                        </button>
                      ))}
                    </div>
                  )}

                  <h2 className="text-2xl font-bold text-foreground mb-1">Ajoutez votre photo</h2>
                  <p className="text-sm text-muted-foreground mb-6">Vos patients aiment voir à qui ils s'adressent. Ajoutez une photo et une accroche.</p>

                  <button
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => updateTherapist(t.id, { photo: ev.target?.result });
                          reader.readAsDataURL(file);
                        }
                      };
                      input.click();
                    }}
                    className="w-24 h-24 rounded-2xl bg-muted/60 border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 flex items-center justify-center shrink-0 overflow-hidden transition-colors mb-4"
                  >
                    {t.photo ? <img src={t.photo} alt="" className="w-full h-full object-cover" /> : <Image className="w-8 h-8 text-muted-foreground" />}
                  </button>
                  <p className="text-sm text-muted-foreground mb-4">Photo affichée sur la section "À propos"</p>

                  <div className="w-full space-y-1 text-left">
                    <Label className="text-xs">Nom Prénom Métier Ville</Label>
                    <Input value={t.accroche} onChange={(e) => updateTherapist(t.id, { accroche: e.target.value })} placeholder={`${data.contact.lastName || "Dupont"} ${data.contact.firstName || "Marie"} ${data.contact.profession || "Ostéopathe"} à ${data.contact.city || "Lyon"}`} className="h-11 text-base" autoFocus />
                    <p className="text-sm text-muted-foreground">Ex : Flora Morell Sophrologue à Albi</p>
                  </div>

                  <button
                    onClick={() => setTherapistsStep(2)}
                    className="mt-6 px-8 py-3 rounded-xl bg-[#FC6D41] text-white text-sm font-semibold hover:bg-[#e55e35] transition-colors cursor-pointer w-full"
                  >
                    Continuer
                  </button>
                  <button onClick={() => setTherapistsStep(0)} className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Retour</button>
                </div>
              );
            })()}

            {/* Step 2 — Présentation */}
            {therapistsStep === 2 && (() => {
              const idx = Math.min(editingTherapistIdx, data.therapists.length - 1);
              const t = data.therapists[idx];
              if (!t) return null;
              return (
                <div className="flex flex-col items-center text-center w-full max-w-md" style={{ animation: 'tab-fade-in 0.3s ease' }}>
                  {/* Nav pills for multiple therapists */}
                  {data.therapists.length > 1 && (
                    <div className="flex items-center gap-1 mb-4 p-1 bg-gray-100 rounded-xl">
                      {data.therapists.map((th, i) => (
                        <button key={th.id} onClick={() => setEditingTherapistIdx(i)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer", i === idx ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                          {th.accroche?.split(' ').slice(0, 2).join(' ') || `Thérapeute ${i + 1}`}
                        </button>
                      ))}
                    </div>
                  )}

                  <h2 className="text-2xl font-bold text-foreground mb-1">Présentez-vous</h2>
                  <p className="text-sm text-muted-foreground mb-6">Parlez de votre parcours et de votre approche. Vos patients veulent vous connaître.</p>

                  <div className="w-full text-left">
                    <RichTextEditor content={t.richTextPresentation} onChange={(html) => updateTherapist(t.id, { richTextPresentation: html })} placeholder="Présentez-vous et votre approche thérapeutique..." />
                  </div>

                  <button
                    onClick={() => setTherapistsStep(3)}
                    className="mt-6 px-8 py-3 rounded-xl bg-[#FC6D41] text-white text-sm font-semibold hover:bg-[#e55e35] transition-colors cursor-pointer w-full"
                  >
                    Continuer
                  </button>
                  <button onClick={() => setTherapistsStep(1)} className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Retour</button>
                </div>
              );
            })()}

            {/* Step 3 — Tarifs */}
            {therapistsStep === 3 && (() => {
              const idx = Math.min(editingTherapistIdx, data.therapists.length - 1);
              const t = data.therapists[idx];
              if (!t) return null;
              return (
                <div className="flex flex-col items-center text-center w-full max-w-sm" style={{ animation: 'tab-fade-in 0.3s ease' }}>
                  {/* Nav pills for multiple therapists */}
                  {data.therapists.length > 1 && (
                    <div className="flex items-center gap-1 mb-4 p-1 bg-gray-100 rounded-xl">
                      {data.therapists.map((th, i) => (
                        <button key={th.id} onClick={() => setEditingTherapistIdx(i)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer", i === idx ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                          {th.accroche?.split(' ').slice(0, 2).join(' ') || `Thérapeute ${i + 1}`}
                        </button>
                      ))}
                    </div>
                  )}

                  <h2 className="text-2xl font-bold text-foreground mb-1">Informations de séance</h2>
                  <p className="text-sm text-muted-foreground mb-6">Vos tarifs et la durée de vos consultations seront affichés sur votre site.</p>

                  <div className="w-full space-y-3 text-left">
                    <div className="space-y-1">
                      <Label className="text-xs">Durée de la consultation</Label>
                      <Input value={t.duration} onChange={(e) => updateTherapist(t.id, { duration: e.target.value })} placeholder="45 min" className="h-11 text-base" autoFocus />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Prix de la consultation</Label>
                      <Input value={t.price} onChange={(e) => updateTherapist(t.id, { price: e.target.value })} placeholder="60 €" className="h-11 text-base" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Remboursement</Label>
                      <Input value={t.reimbursement} onChange={(e) => updateTherapist(t.id, { reimbursement: e.target.value })} placeholder="Remboursement mutuelle possible" className="h-11 text-base" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Lien de réservation</Label>
                      <Input value={t.bookingLink || ''} onChange={(e) => updateTherapist(t.id, { bookingLink: e.target.value })} placeholder="https://doctolib.fr/..." className="h-11 text-base" />
                      <p className="text-sm text-muted-foreground">Doctolib, Calendly, ou tout autre service</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setTherapistsStep(4)}
                    className="mt-6 px-8 py-3 rounded-xl bg-[#FC6D41] text-white text-sm font-semibold hover:bg-[#e55e35] transition-colors cursor-pointer w-full"
                  >
                    Enregistrer
                  </button>
                  <button onClick={() => setTherapistsStep(2)} className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Retour</button>
                </div>
              );
            })()}

            {/* Step 4 — Saving */}
            {therapistsStep === 4 && (
              <SavingStep
                icon={Users}
                description="Mise à jour de votre équipe"
                onValidate={() => handleValidateSection("therapists")}
                onComplete={() => { setTherapistsCompleted(true); setTherapistsStep(0); }}
              />
            )}
          </SteppedFlowWrapper>
        );

      case 3:
        return specialtiesCompleted ? (
          <div className="space-y-4" style={{ animation: 'tab-fade-in 0.3s ease' }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">Vos spécialités</h2>
                <p className="text-sm text-muted-foreground">{data.specialties.length} spécialités configurées.</p>
              </div>
              <button onClick={() => { setSpecialtiesCompleted(false); setSpecialtiesStep(1); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-gray-100 transition-all shrink-0 cursor-pointer">
                <Pencil className="w-3.5 h-3.5" />
                Modifier
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {data.specialties.map((specialty) => (
                <div key={specialty.id} className="p-3 bg-gray-50 rounded-xl flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl shrink-0">
                    {getIconEmoji(specialty.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">{specialty.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{specialty.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <SteppedFlowWrapper>
            <ProgressDots total={data.specialties.length + 1} current={specialtiesStep === 0 ? 0 : reviewingSpecialtyIdx + 1} />

            {specialtiesStep === 0 && (
              <IntroStep
                icon={Star}
                title="Vos pages spécialités"
                description="Chaque spécialité génère une page dédiée pour votre référencement. Nous en avons préparé 6 pour vous — vérifiez qu'elles vous correspondent."
                ctaText="Vérifier mes spécialités"
                onCta={() => { setReviewingSpecialtyIdx(0); setSpecialtiesStep(1); }}
                onSkip={() => setSpecialtiesStep(0)}
              />
            )}

            {specialtiesStep === 1 && (() => {
              const idx = Math.min(reviewingSpecialtyIdx, data.specialties.length - 1);
              const specialty = data.specialties[idx];
              if (!specialty) return null;
              const isLast = idx >= data.specialties.length - 1;
              const isEditing = editingSpecialtyId === specialty.id;
              return (
                <div key={specialty.id} className="flex flex-col items-center text-center w-full max-w-sm" style={{ animation: 'tab-fade-in 0.3s ease' }}>
                  <p className="text-xs text-muted-foreground mb-2">{idx + 1} / {data.specialties.length}</p>
                  <h2 className="text-2xl font-bold text-foreground mb-1">Vérifiez cette spécialité</h2>
                  <p className="text-sm text-muted-foreground mb-8">Cette page sera créée pour votre référencement.</p>

                  {/* Specialty card */}
                  <div className="w-full bg-gray-50 rounded-2xl p-6 text-left mb-6">
                    <div className="flex items-start gap-4">
                      {/* Icon picker */}
                      <div className="relative">
                        <button
                          onClick={() => setPickingIconForId(pickingIconForId === specialty.id ? null : specialty.id)}
                          className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0 hover:bg-primary/20 transition-colors cursor-pointer"
                        >
                          {getIconEmoji(specialty.icon)}
                        </button>
                        {pickingIconForId === specialty.id && (
                          <div className="absolute top-16 left-0 z-20 bg-white rounded-xl shadow-lg border p-2 grid grid-cols-5 gap-1 w-[180px]" style={{ animation: 'tab-fade-in 0.2s ease' }}>
                            {SPECIALTY_EMOJIS.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => {
                                  setData(prev => ({ ...prev, specialties: prev.specialties.map(s => s.id === specialty.id ? { ...s, icon: emoji } : s) }));
                                  setPickingIconForId(null);
                                }}
                                className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-gray-100 transition-colors cursor-pointer", specialty.icon === emoji && "bg-primary/10 ring-1 ring-primary/30")}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground text-center mt-1">Icône</p>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-foreground mb-1">{specialty.title}</h3>
                        {isEditing ? (
                          <textarea
                            value={specialty.description}
                            onChange={(e) => updateSpecialtyDescription(specialty.id, e.target.value)}
                            onBlur={() => setEditingSpecialtyId(null)}
                            className="w-full text-sm text-muted-foreground bg-white border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary/30 resize-none"
                            rows={3}
                            autoFocus
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground leading-relaxed cursor-pointer hover:text-foreground transition-colors" onClick={() => setEditingSpecialtyId(specialty.id)}>{specialty.description}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => {
                      if (isLast) {
                        handleValidateSection("specialties");
                        setSpecialtiesCompleted(true);
                        setSpecialtiesStep(0);
                        setReviewingSpecialtyIdx(0);
                      } else {
                        setReviewingSpecialtyIdx(idx + 1);
                        setPickingIconForId(null);
                        setEditingSpecialtyId(null);
                      }
                    }}
                    className="px-8 py-3 rounded-xl bg-[#FC6D41] text-white text-sm font-semibold hover:bg-[#e55e35] transition-colors cursor-pointer w-full"
                  >
                    {isLast ? "Confirmer mes spécialités" : "Suivant"}
                  </button>

                  <div className="flex items-center gap-4 mt-3">
                    <button
                      onClick={() => handleDeleteSpecialtyClick(specialty)}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                    >
                      Supprimer
                    </button>
                    <span className="text-gray-200">·</span>
                    <button
                      onClick={() => { if (idx > 0) { setReviewingSpecialtyIdx(idx - 1); setPickingIconForId(null); setEditingSpecialtyId(null); } else { setSpecialtiesStep(0); } }}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      Retour
                    </button>
                  </div>
                </div>
              );
            })()}
          </SteppedFlowWrapper>
        );

      case 4:
        return googleCompleted ? (
          <div className="space-y-4" style={{ animation: 'tab-fade-in 0.3s ease' }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">Google Business</h2>
                <p className="text-sm text-muted-foreground">{data.google.connected ? "Votre fiche Google est connectée." : "Non connecté."}</p>
              </div>
              <button onClick={() => { setGoogleCompleted(false); setGoogleStep(1); setGoogleQuery(""); setGoogleResults([]); setSelectedGoogleResult(null); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-gray-100 transition-all shrink-0 cursor-pointer">
                <Pencil className="w-3.5 h-3.5" />
                Modifier
              </button>
            </div>
            {data.google.connected && data.google.profile ? (
              <div className="flex items-center gap-3 p-4 bg-green-50/50 border border-green-200 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{data.google.profile.name}</p>
                  {data.google.profile.address && <p className="text-sm text-muted-foreground truncate">{data.google.profile.address}</p>}
                  {data.google.profile.rating && (
                    <p className="text-xs text-muted-foreground">{data.google.profile.rating}/5 · {data.google.profile.reviewCount} avis</p>
                  )}
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold shrink-0">Connecté</span>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <p className="text-sm text-muted-foreground">Vous pourrez connecter Google Business plus tard.</p>
              </div>
            )}
          </div>
        ) : (
          <SteppedFlowWrapper>
            <ProgressDots total={2} current={googleStep} />

            {googleStep === 0 && (
              <IntroStep
                icon={Building2}
                title="Importez vos avis Google"
                description="Connectez votre fiche Google Business pour afficher automatiquement vos avis et votre note sur votre site. Vos patients font confiance aux avis."
                ctaText="Connecter Google Business"
                onCta={() => {
                  const defaultQuery = [data.contact.lastName, data.contact.firstName, data.contact.profession, data.contact.city].filter(Boolean).join(" ");
                  setGoogleQuery(defaultQuery);
                  setGoogleStep(1);
                  if (defaultQuery) setTimeout(() => searchGooglePlaces(defaultQuery), 100);
                }}
                onSkip={() => { setGoogleCompleted(true); }}
              >
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl mb-6">
                  <div className="flex text-amber-400 text-sm">{"★".repeat(5)}</div>
                  <span className="text-xs text-muted-foreground">4.8/5 · 42 avis</span>
                </div>
              </IntroStep>
            )}

            {googleStep === 1 && (
              <div className="flex flex-col items-center text-center w-full max-w-sm" style={{ animation: 'tab-fade-in 0.3s ease' }}>
                <h2 className="text-2xl font-bold text-foreground mb-1">Recherchez votre établissement</h2>
                <p className="text-sm text-muted-foreground mb-6">Tapez le nom de votre cabinet pour le retrouver sur Google.</p>

                {/* Search input */}
                <div className="w-full relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    value={googleQuery}
                    onChange={(e) => handleGoogleQueryChange(e.target.value)}
                    placeholder="Ex : Cabinet Dupont Lyon"
                    className="h-11 text-base pl-10 pr-10"
                    autoFocus
                  />
                  {googleSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />}
                </div>

                {/* Results */}
                {googleResults.length > 0 && (
                  <div className="w-full space-y-2 mb-4 max-h-[240px] overflow-y-auto text-left">
                    {googleResults.map((result) => (
                      <button
                        key={result.placeId}
                        onClick={() => setSelectedGoogleResult(result)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer text-left",
                          selectedGoogleResult?.placeId === result.placeId
                            ? "border-[#FC6D41] bg-[#FC6D41]/5"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        )}
                      >
                        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{result.name}</p>
                          <p className="text-sm text-muted-foreground truncate">{result.address}</p>
                          {result.rating && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <div className="flex text-amber-400 text-sm">{"★".repeat(Math.round(result.rating))}</div>
                              <span className="text-sm text-muted-foreground">{result.rating}/5 · {result.reviewCount} avis</span>
                            </div>
                          )}
                        </div>
                        {selectedGoogleResult?.placeId === result.placeId && (
                          <Check className="w-4 h-4 text-[#FC6D41] shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Empty state */}
                {googleQuery.trim() && !googleSearching && googleResults.length === 0 && (
                  <div className="w-full p-4 bg-gray-50 rounded-xl mb-4">
                    <p className="text-sm text-muted-foreground">Aucun établissement trouvé. Essayez avec un autre nom ou ajoutez la ville.</p>
                  </div>
                )}

                <button
                  onClick={() => { handleConnectGoogle(selectedGoogleResult); setGoogleStep(2); }}
                  disabled={!selectedGoogleResult}
                  className={cn("px-8 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer w-full", selectedGoogleResult ? "bg-[#FC6D41] text-white hover:bg-[#e55e35]" : "bg-gray-200 text-gray-400 cursor-not-allowed")}
                >
                  Connecter cet établissement
                </button>
                <button onClick={() => { setGoogleStep(0); setGoogleQuery(""); setGoogleResults([]); setSelectedGoogleResult(null); }} className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Retour</button>
              </div>
            )}

            {googleStep === 2 && (
              <SavingStep
                icon={Building2}
                title="Connexion en cours..."
                description="Import de vos avis et informations depuis Google Business"
                onValidate={() => handleValidateSection("google")}
                onComplete={() => { setGoogleCompleted(true); setGoogleStep(0); }}
              />
            )}
          </SteppedFlowWrapper>
        );

      case 6:
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
                          <p className="text-sm text-muted-foreground">
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

      case 5:
        return domainBought ? (
          /* ── BOUGHT STATE ── */
          <div className="space-y-4" style={{ animation: 'tab-fade-in 0.3s ease' }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">Nom de domaine</h2>
                <p className="text-sm text-muted-foreground">Votre domaine personnalisé est connecté à votre site.</p>
              </div>
              <button onClick={() => { setDomainBought(false); setDomainStep(1); setDomainSearch(''); setDomainSearchResult(null); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-gray-100 transition-all shrink-0 cursor-pointer">
                <Pencil className="w-3.5 h-3.5" />
                Modifier
              </button>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <Label className="text-xs text-muted-foreground mb-1 block">Sous-domaine Theralys</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-lg">
                  <Globe className="w-4 h-4 text-gray-300 shrink-0" />
                  <span className="text-sm font-medium text-gray-400">theo-osteo.theralys.fr</span>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-sm font-semibold">Non connecté</span>
              </div>
            </div>
            <div className="bg-green-50/50 border border-green-200 rounded-xl p-4">
              <Label className="text-xs text-green-600 mb-1 block">Domaine personnalisé</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-white border border-green-200 rounded-lg">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <span className="text-sm font-semibold text-foreground">{domainSearchResult || 'mondomaine.fr'}</span>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">Connecté</span>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <div>
                  <p className="text-sm font-medium text-foreground">Certificat SSL</p>
                  <p className="text-sm text-muted-foreground">HTTPS activé automatiquement</p>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">Actif</span>
            </div>
          </div>
        ) : (
          /* ── NOT BOUGHT — Airbnb-style stepped flow ── */
          <div className="flex flex-col items-center justify-center h-full min-h-[400px]" style={{ animation: 'tab-fade-in 0.35s cubic-bezier(0.4, 0, 0.2, 1)' }}>

            {/* Progress dots */}
            <div className="flex items-center gap-2 mb-8">
              {[0, 1, 2].map(i => (
                <div key={i} className={`rounded-full transition-all duration-300 ${domainStep >= i + 1 ? 'w-2 h-2 bg-[#FC6D41]' : domainStep === i ? 'w-6 h-2 bg-[#FC6D41]' : 'w-2 h-2 bg-gray-200'}`} />
              ))}
            </div>

            {/* Step 0 — Intro */}
            {domainStep === 0 && (
              <div className="flex flex-col items-center text-center max-w-sm" style={{ animation: 'tab-fade-in 0.3s ease' }}>
                <div className="w-16 h-16 rounded-2xl bg-[#FC6D41]/10 flex items-center justify-center mb-5">
                  <Globe className="w-8 h-8 text-[#FC6D41]" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Votre premier domaine est offert
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                  Choisissez un nom de domaine professionnel pour votre cabinet. Il sera connecté automatiquement à votre site.
                </p>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full mb-6">
                  <Globe className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500">Actuellement : <span className="font-medium text-foreground">theo-osteo.theralys.fr</span></span>
                </div>
                <button
                  onClick={() => setDomainStep(1)}
                  className="px-8 py-3 rounded-xl bg-[#FC6D41] text-white text-sm font-semibold hover:bg-[#e55e35] transition-colors cursor-pointer"
                >
                  Choisir mon domaine
                </button>
                <button
                  onClick={() => setDomainStep(0)}
                  className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Plus tard
                </button>
              </div>
            )}

            {/* Step 1 — Search */}
            {domainStep === 1 && (
              <div className="flex flex-col items-center text-center w-full max-w-md" style={{ animation: 'tab-fade-in 0.3s ease' }}>
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  Comment voulez-vous vous appeler ?
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Tapez le nom idéal pour votre cabinet.
                </p>
                <div className="w-full relative mb-3">
                  <Input
                    value={domainSearch}
                    onChange={(e) => { setDomainSearch(e.target.value); setDomainSearchResult(null); }}
                    placeholder="ex: cabinet-dupont"
                    className="h-12 text-base pl-4 pr-14 rounded-xl border-2 border-gray-200 focus:border-[#FC6D41] transition-colors"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && domainSearch.trim()) {
                        const result = domainSearch.trim().replace(/\s+/g, '-').toLowerCase();
                        setDomainSearchResult(result.includes('.') ? result : result + '.fr');
                      }
                    }}
                    autoFocus
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">.fr</span>
                </div>

                {/* Suggestions */}
                {!domainSearchResult && (
                  <div className="w-full flex flex-wrap gap-2 mb-4 justify-center">
                    {['osteo-lyon', 'dupont-osteo', 'theo-osteo', 'dupont-theo'].map((sug, i) => {
                      const labels = ['métier-ville', 'nom-métier', 'prénom-métier', 'nom-prénom'];
                      return (
                        <button
                          key={sug}
                          onClick={() => { setDomainSearch(sug); }}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-muted-foreground hover:border-[#FC6D41] hover:text-[#FC6D41] transition-all cursor-pointer"
                        >
                          <span className="font-medium text-foreground">{sug}.fr</span>
                          <span className="ml-1.5 text-sm text-gray-400">{labels[i]}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Results */}
                {domainSearchResult ? (
                  <div className="w-full space-y-2 mb-4" style={{ animation: 'tab-fade-in 0.2s ease' }}>
                    {[
                      { ext: '.fr', price: 'Offert', available: true, highlight: true },
                      { ext: '.com', price: '8,99€/an', available: true, highlight: false },
                      { ext: '.cabinet', price: '14,99€/an', available: false, highlight: false },
                    ].map((opt) => {
                      const name = domainSearchResult.replace(/\.[^.]+$/, '') + opt.ext;
                      return (
                        <button
                          key={opt.ext}
                          onClick={() => { if (opt.available) { setDomainSearchResult(name); setDomainStep(2); } }}
                          disabled={!opt.available}
                          className={cn(
                            "w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left",
                            !opt.available
                              ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                              : opt.highlight
                                ? "border-[#FC6D41] bg-[#FC6D41]/5 hover:bg-[#FC6D41]/10 cursor-pointer"
                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", opt.highlight ? "bg-[#FC6D41]/10" : "bg-gray-100")}>
                              <Globe className={cn("w-4 h-4", opt.highlight ? "text-[#FC6D41]" : "text-gray-400")} />
                            </div>
                            <span className={cn("text-sm font-semibold", !opt.available ? "text-gray-400" : "text-foreground")}>{name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {opt.highlight ? (
                              <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-sm font-bold">OFFERT</span>
                            ) : !opt.available ? (
                              <span className="text-sm text-red-400 font-medium">+10€ max</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">{opt.price}</span>
                            )}
                            {opt.available && <ChevronRight className="w-4 h-4 text-gray-300" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (domainSearch.trim()) {
                        const result = domainSearch.trim().replace(/\s+/g, '-').toLowerCase();
                        setDomainSearchResult(result.includes('.') ? result : result + '.fr');
                      }
                    }}
                    disabled={!domainSearch.trim()}
                    className={cn(
                      "px-8 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer",
                      domainSearch.trim()
                        ? "bg-[#FC6D41] text-white hover:bg-[#e55e35]"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    )}
                  >
                    Rechercher
                  </button>
                )}

                <button onClick={() => { setDomainStep(0); setDomainSearch(''); setDomainSearchResult(null); }} className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  Retour
                </button>
              </div>
            )}

            {/* Step 2 — Confirm */}
            {domainStep === 2 && (
              <div className="flex flex-col items-center text-center max-w-sm" style={{ animation: 'tab-fade-in 0.3s ease' }}>
                <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mb-5">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Parfait, il est à vous !
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  Votre domaine sera connecté à votre site avec un certificat SSL inclus.
                </p>

                <div className="w-full bg-gray-50 rounded-2xl p-5 mb-6 text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Domaine</span>
                    <span className="text-sm font-bold text-foreground">{domainSearchResult}</span>
                  </div>
                  <div className="h-px bg-gray-200" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">SSL / HTTPS</span>
                    <span className="text-xs text-green-600 font-semibold">Inclus</span>
                  </div>
                  <div className="h-px bg-gray-200" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Renouvellement</span>
                    <span className="text-xs text-muted-foreground">Automatique</span>
                  </div>
                  <div className="h-px bg-gray-200" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Prix</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground line-through">9,99€/an</span>
                      <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-sm font-bold">OFFERT</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setDomainStep(3);
                    setTimeout(() => { setDomainBought(true); setDomainStep(0); }, 2200);
                  }}
                  className="px-8 py-3 rounded-xl bg-[#FC6D41] text-white text-sm font-semibold hover:bg-[#e55e35] transition-colors cursor-pointer w-full"
                >
                  Confirmer et connecter
                </button>
                <button onClick={() => setDomainStep(1)} className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  Changer de domaine
                </button>
              </div>
            )}

            {/* Step 3 — Connecting animation */}
            {domainStep === 3 && (
              <div className="flex flex-col items-center text-center max-w-sm" style={{ animation: 'tab-fade-in 0.3s ease' }}>
                <div className="w-16 h-16 rounded-2xl bg-[#FC6D41]/10 flex items-center justify-center mb-5 animate-pulse">
                  <Globe className="w-8 h-8 text-[#FC6D41]" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Connexion en cours...
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Configuration DNS et certificat SSL pour <span className="font-semibold">{domainSearchResult}</span>
                </p>
                <div className="w-48 h-1 bg-gray-200 rounded-full mt-6 overflow-hidden">
                  <div className="h-full bg-[#FC6D41] rounded-full" style={{ animation: 'domain-progress 2s ease-in-out forwards' }} />
                </div>
              </div>
            )}
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
      <div className="flex-1 flex gap-6 overflow-hidden w-full max-w-[1200px] px-6 py-4 min-h-0" style={{ animation: 'tab-fade-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
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
                      Choisissez une icône et un nom pour votre nouvelle spécialité.
                    </p>
                    <div className="grid grid-cols-10 gap-1 mb-4 p-2 bg-gray-50 rounded-xl">
                      {SPECIALTY_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => setNewSpecialtyIcon(emoji)}
                          className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-white transition-colors cursor-pointer", newSpecialtyIcon === emoji && "bg-white ring-1 ring-primary/30 shadow-sm")}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
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
