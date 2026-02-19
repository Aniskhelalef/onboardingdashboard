import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { User, MapPin, Building2, ChevronDown, Plus, Trash2, Users, Star, Code, Image, ArrowLeft, ArrowRight, Check, Globe, Search, Loader2, MessageSquare, MessageCircle, Phone, Mail, ExternalLink, Sparkles } from "lucide-react";
import RichTextEditor from "./RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
const theralysLogo = '/images/theralys-logo.svg';
import ImageCropModal from "./modals/ImageCropModal";

const MAIN_STEPS = [
  { id: "contact", label: "Contact", icon: User, description: "Vos informations personnelles" },
  { id: "cabinet", label: "Cabinet", icon: MapPin, description: "Adresse(s) de votre cabinet" },
  { id: "therapists", label: "Thérapeutes", icon: Users, description: "Équipe du cabinet" },
  { id: "specialties", label: "Spécialités", icon: Star, description: "Vos domaines d'expertise" },
  { id: "google", label: "Google", icon: Building2, description: "Fiche Google Business" },
  { id: "avis", label: "Avis", icon: MessageSquare, description: "Collecter des avis clients" },
  { id: "redaction", label: "Rédaction IA", icon: Sparkles, description: "Style et ton de vos contenus" },
];

const ADVANCED_STEPS = [
  { id: "domain", label: "Domaine", icon: Globe, description: "Nom de domaine personnalisé" },
  { id: "code", label: "Code", icon: Code, description: "Code personnalisé" },
];

const ALL_STEPS = [...MAIN_STEPS, ...ADVANCED_STEPS];


const Setup = ({ initialStep, isModal = false, onClose }) => {
  const router = useRouter();
  const stepParam = initialStep || "contact";
  const resolvedStep = isNaN(Number(stepParam))
    ? Math.max(ALL_STEPS.findIndex(s => s.id === stepParam), 0)
    : parseInt(stepParam, 10);
  const [modalStep, setModalStep] = useState(resolvedStep);
  const currentStep = isModal ? modalStep : Math.min(Math.max(resolvedStep, 0), ALL_STEPS.length - 1);
  const goToStep = (index) => isModal ? setModalStep(index) : router.push(`/setup/${ALL_STEPS[index]?.id || 'contact'}`);
  const [expandedCodes, setExpandedCodes] = useState(new Set());
  const [completedActionIds, setCompletedActionIds] = useState(() => { if (typeof window === 'undefined') return []; try { return JSON.parse(localStorage.getItem("completedActions") || "[]") } catch { return [] } })
  const allMainDone = MAIN_STEPS.every(s => completedActionIds.includes(s.id))
  const [googleQuery, setGoogleQuery] = useState("");
  const [googleResults, setGoogleResults] = useState([]);
  const [googleSearching, setGoogleSearching] = useState(false);
  const [selectedGoogleResult, setSelectedGoogleResult] = useState(null);
  const [editingCabinetIdx, setEditingCabinetIdx] = useState(0);
  const [editingTherapistIdx, setEditingTherapistIdx] = useState(0);
  const [domainBought, setDomainBought] = useState(false);
  const [domainSearch, setDomainSearch] = useState('');
  const [domainSearchResult, setDomainSearchResult] = useState(null);
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

  // Specialty from-scratch flow
  const [specSubStep, setSpecSubStep] = useState(() => {
    if (typeof window === 'undefined') return 'intro';
    try {
      const saved = JSON.parse(localStorage.getItem("setupData") || "{}");
      return (saved.specialties && saved.specialties.length > 0) ? 'build' : 'intro';
    } catch { return 'intro'; }
  });
  const [newSpecTitle, setNewSpecTitle] = useState('');
  const [newSpecDesc, setNewSpecDesc] = useState('');
  const [newSpecFormIcon, setNewSpecFormIcon] = useState('✨');
  const [showSpecFormIconPicker, setShowSpecFormIconPicker] = useState(false);

  const SPECIALTY_EMOJIS = ["🦴", "🤰", "👶", "⚽", "💼", "🧓", "🧠", "💆", "🏃", "❤️", "🌿", "🔥", "🎯", "✨", "🩺", "🧘", "😴", "🦵", "👩‍⚕️", "🤕"];

  // Validation state for each section
  const [validatedSection, setValidatedSection] = useState(null);
  const [changedSections, setChangedSections] = useState(new Set());
  const [initialData, setInitialData] = useState(null);

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
  const userProfession = (typeof window !== 'undefined' && localStorage.getItem("userProfession")) || "";

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
  const defaultData = {
    contact: { firstName: "", lastName: "", profession: userProfession, city: "", phoneNumber: "", appointmentLink: "" },
    locations: [],
    therapists: [],
    specialties: [],
    google: { connected: false, profile: null },
    customCode: [],
    reviewTemplates: {
      googleLink: "",
      whatsapp: { message: "Bonjour ! \u{1F60A} Merci pour votre visite. Si vous avez apprécié votre consultation, un petit avis Google nous aiderait beaucoup :\n{link}\nMerci et à bientôt !" },
      sms: { message: "Bonjour, merci pour votre visite ! Votre avis compte beaucoup pour nous : {link}. Merci !" },
      email: { subject: "Votre avis compte pour nous", message: "Bonjour,\n\nMerci pour votre visite au cabinet. Si vous avez apprécié votre consultation, un avis Google nous aiderait beaucoup à aider d'autres patients à nous trouver.\n\nVoici le lien : {link}\n\nMerci beaucoup et à bientôt !" },
    },
    redaction: { tone: 'professionnel', style: 'informatif', pronoun: 'nous', systemPrompt: '' },
  };

  const [data, setData] = useState(() => {
    if (typeof window === 'undefined') return defaultData;
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
          reviewTemplates: saved.reviewTemplates || {
            googleLink: "",
            whatsapp: { message: "Bonjour ! \u{1F60A} Merci pour votre visite. Si vous avez apprécié votre consultation, un petit avis Google nous aiderait beaucoup :\n{link}\nMerci et à bientôt !" },
            sms: { message: "Bonjour, merci pour votre visite ! Votre avis compte beaucoup pour nous : {link}. Merci !" },
            email: { subject: "Votre avis compte pour nous", message: "Bonjour,\n\nMerci pour votre visite au cabinet. Si vous avez apprécié votre consultation, un avis Google nous aiderait beaucoup à aider d'autres patients à nous trouver.\n\nVoici le lien : {link}\n\nMerci beaucoup et à bientôt !" },
          },
          redaction: saved.redaction || {
            tone: 'professionnel',
            style: 'informatif',
            pronoun: 'nous',
            systemPrompt: '',
          },
        };
      } catch (e) {
        console.error("Failed to parse setupData:", e);
      }
    }
    return defaultData;
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
    if (JSON.stringify(data.reviewTemplates) !== JSON.stringify(initialData.reviewTemplates)) {
      changed.add("reviewTemplates");
    }
    if (JSON.stringify(data.redaction) !== JSON.stringify(initialData.redaction)) {
      changed.add("redaction");
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

    // Mark the corresponding action as completed
    const stepMapping = { contact: 'contact', locations: 'cabinet', therapists: 'therapists', specialties: 'specialties', google: 'google', reviewTemplates: 'avis', redaction: 'redaction', domain: 'domain', customCode: 'code' }
    const actionId = stepMapping[sectionName]
    if (actionId) {
      const existing = JSON.parse(localStorage.getItem("completedActions") || "[]")
      if (!existing.includes(actionId)) {
        existing.push(actionId)
        localStorage.setItem("completedActions", JSON.stringify(existing))
        setCompletedActionIds([...existing])
        window.dispatchEvent(new Event("actionsUpdated"))
      }
    }

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


  // Reset all data (demo helper)
  const handleResetAll = () => {
    localStorage.removeItem("setupData");
    localStorage.removeItem("setupComplete");
    localStorage.removeItem("completedActions");
    window.dispatchEvent(new Event("actionsUpdated"));
    window.location.reload();
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
    const isFirst = data.therapists.length === 0;
    const newTherapist = {
      id: Date.now().toString(),
      accroche: isFirst ? `${data.contact.lastName} ${data.contact.firstName} ${data.contact.profession} à ${data.contact.city}`.trim() : "",
      richTextPresentation: "<p>Diplômé(e) en ostéopathie, je vous accueille dans mon cabinet pour vous accompagner vers un mieux-être durable.</p><p>Mon approche se veut globale et personnalisée : chaque patient est unique, chaque douleur a son histoire.</p>",
      price: "60 €",
      duration: "45 min",
      reimbursement: "Remboursement mutuelle possible",
      bookingLink: isFirst ? data.contact.appointmentLink : "",
      photo: "",
    };
    setData(prev => ({
      ...prev,
      therapists: [...prev.therapists, newTherapist],
    }));
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

  // Review template helpers
  const updateReviewTemplate = (channel, updates) => {
    setData(prev => ({
      ...prev,
      reviewTemplates: {
        ...prev.reviewTemplates,
        [channel]: typeof prev.reviewTemplates[channel] === 'object'
          ? { ...prev.reviewTemplates[channel], ...updates }
          : updates
      }
    }));
  };

  const [activeChannel, setActiveChannel] = useState("whatsapp");

  const REVIEW_CHANNELS = [
    { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "bg-green-500", getUrl: (msg) => `https://wa.me/?text=${encodeURIComponent(msg)}`, hasSubject: false },
    { id: "sms", label: "SMS", icon: Phone, color: "bg-blue-500", getUrl: (msg) => `sms:?body=${encodeURIComponent(msg)}`, hasSubject: false },
    { id: "email", label: "Email", icon: Mail, color: "bg-purple-500", getUrl: (msg, subj) => `mailto:?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(msg)}`, hasSubject: true },
  ];

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4" style={{ animation: 'tab-fade-in 0.3s ease' }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">Informations de contact</h2>
                <p className="text-sm text-muted-foreground">Vos informations personnelles affichées sur votre site.</p>
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
              onClick={() => handleValidateSection("contact")}
              className={cn("px-5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer", changedSections.has("contact") ? "bg-[#FC6D41] text-white hover:bg-[#e55e35]" : "bg-gray-100 text-gray-400")}
            >
              {validatedSection === "contact" ? "Enregistré !" : "Enregistrer"}
            </button>
          </div>
        );

      case 1:
        const idx = Math.min(editingCabinetIdx, data.locations.length - 1);
        const loc = data.locations[idx];
        return (
          <div className="space-y-3" style={{ animation: 'tab-fade-in 0.3s ease' }}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-0.5">Adresse(s) de cabinet</h2>
                <p className="text-sm text-muted-foreground">Modifiez les informations de vos cabinets.</p>
              </div>
              {data.locations.length > 1 && (
                <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
                  {data.locations.map((l, i) => (
                    <button key={l.id} onClick={() => setEditingCabinetIdx(i)} className={cn("px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer", i === idx ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                      {l.title || `Cabinet ${i + 1}`}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {loc && (
              <div className="space-y-2">
                <div className="flex items-end gap-3">
                  <button
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file"; input.accept = "image/*";
                      input.onchange = (e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = (ev) => updateLocation(loc.id, { image: ev.target?.result }); reader.readAsDataURL(file); } };
                      input.click();
                    }}
                    className="w-9 h-9 rounded-lg bg-muted/60 border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 flex items-center justify-center shrink-0 overflow-hidden transition-colors"
                  >
                    {loc.image ? <img src={loc.image} alt="" className="w-full h-full object-cover" /> : <Image className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Nom du cabinet</Label>
                    <Input value={loc.title} onChange={(e) => updateLocation(loc.id, { title: e.target.value })} placeholder="Cabinet Dupont" className="h-9" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Adresse complète</Label>
                  <Input value={loc.address} onChange={(e) => updateLocation(loc.id, { address: e.target.value })} placeholder="12 rue de la Santé, 75014 Paris" className="h-9" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Lien de réservation</Label>
                  <Input value={loc.bookingLink} onChange={(e) => updateLocation(loc.id, { bookingLink: e.target.value })} placeholder="https://doctolib.fr/..." className="h-9" />
                </div>
              </div>
            )}
            {data.locations.length < 2 && (
              <button
                onClick={() => { addLocation(); setEditingCabinetIdx(data.locations.length); }}
                className="flex items-center justify-center gap-1.5 w-full p-2 rounded-xl border-2 border-dashed border-gray-200 text-sm text-muted-foreground hover:border-[#FC6D41]/40 hover:text-[#FC6D41] transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Ajouter un second cabinet
              </button>
            )}
            <button
              onClick={() => handleValidateSection("locations")}
              className={cn("px-5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer", changedSections.has("locations") ? "bg-[#FC6D41] text-white hover:bg-[#e55e35]" : "bg-gray-100 text-gray-400")}
            >
              {validatedSection === "locations" ? "Enregistré !" : "Enregistrer"}
            </button>
          </div>
        );

      case 2:
        const idx2 = Math.min(editingTherapistIdx, data.therapists.length - 1);
        const t = data.therapists[idx2];
        return (
          <div className="space-y-2" style={{ animation: 'tab-fade-in 0.3s ease' }}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-0.5">Équipe du cabinet</h2>
                <p className="text-sm text-muted-foreground">Modifiez les informations de vos thérapeutes.</p>
              </div>
              {data.therapists.length > 1 && (
                <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
                  {data.therapists.map((th, i) => (
                    <button key={th.id} onClick={() => setEditingTherapistIdx(i)} className={cn("px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer", i === idx2 ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                      {th.accroche?.split(' ').slice(0, 2).join(' ') || `Thérapeute ${i + 1}`}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {t && (
              <div className="space-y-2">
                <div className="flex items-end gap-3">
                  <button
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file"; input.accept = "image/*";
                      input.onchange = (e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = (ev) => updateTherapist(t.id, { photo: ev.target?.result }); reader.readAsDataURL(file); } };
                      input.click();
                    }}
                    className="w-9 h-9 rounded-full bg-muted/60 border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 flex items-center justify-center shrink-0 overflow-hidden transition-colors"
                  >
                    {t.photo ? <img src={t.photo} alt="" className="w-full h-full object-cover" /> : <Image className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Nom Prénom Métier Ville</Label>
                    <Input value={t.accroche} onChange={(e) => updateTherapist(t.id, { accroche: e.target.value })} placeholder={`${data.contact.lastName || "Dupont"} ${data.contact.firstName || "Marie"} ${data.contact.profession || "Ostéopathe"} à ${data.contact.city || "Lyon"}`} className="h-9" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Présentation</Label>
                  <div className="[&_.tiptap]:!min-h-[80px] [&_.tiptap]:!max-h-[120px] [&_.tiptap]:overflow-y-auto [&_.ProseMirror]:!min-h-[80px] [&_.ProseMirror]:!max-h-[120px]">
                    <RichTextEditor content={t.richTextPresentation} onChange={(html) => updateTherapist(t.id, { richTextPresentation: html })} placeholder="Présentez-vous et votre approche thérapeutique..." />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Durée</Label>
                    <Input value={t.duration} onChange={(e) => updateTherapist(t.id, { duration: e.target.value })} placeholder="45 min" className="h-9" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Prix</Label>
                    <Input value={t.price} onChange={(e) => updateTherapist(t.id, { price: e.target.value })} placeholder="60 €" className="h-9" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Remboursement</Label>
                    <Input value={t.reimbursement} onChange={(e) => updateTherapist(t.id, { reimbursement: e.target.value })} placeholder="Mutuelle" className="h-9" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Lien de réservation</Label>
                  <Input value={t.bookingLink || ''} onChange={(e) => updateTherapist(t.id, { bookingLink: e.target.value })} placeholder="https://doctolib.fr/..." className="h-9" />
                </div>
              </div>
            )}
            {data.therapists.length < 3 && (
              <button
                onClick={() => { addTherapist(); setEditingTherapistIdx(data.therapists.length); }}
                className="flex items-center justify-center gap-1.5 w-full p-2 rounded-xl border-2 border-dashed border-gray-200 text-sm text-muted-foreground hover:border-[#FC6D41]/40 hover:text-[#FC6D41] transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Ajouter un thérapeute
              </button>
            )}
            <button
              onClick={() => handleValidateSection("therapists")}
              className={cn("px-5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer", changedSections.has("therapists") ? "bg-[#FC6D41] text-white hover:bg-[#e55e35]" : "bg-gray-100 text-gray-400")}
            >
              {validatedSection === "therapists" ? "Enregistré !" : "Enregistrer"}
            </button>
          </div>
        );

      case 3: {
        // Sub-state A: Intro card
        if (specSubStep === 'intro') {
          return (
            <div className="flex flex-col items-center justify-center h-full" style={{ animation: 'tab-fade-in 0.3s ease' }}>
              <div className="w-full max-w-[480px]">
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-color-2/10 flex items-center justify-center mx-auto mb-3">
                    <Star className="w-7 h-7 text-color-2" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Vos spécialités</h2>
                  <p className="text-sm text-muted-foreground mt-1">Définissez les domaines dans lesquels vous exercez.</p>
                </div>

                <div className="space-y-2.5 mb-6">
                  {[
                    { icon: '📄', title: 'Une page dédiée sur votre site', desc: 'Chaque spécialité génère une page optimisée qui présente votre expertise aux patients.' },
                    { icon: '✍️', title: 'Des articles SEO mensuels ciblés', desc: '~30 articles/mois sont répartis entre vos spécialités pour attirer des patients via Google.' },
                    { icon: '📈', title: 'Un référencement local renforcé', desc: 'Plus vous couvrez de spécialités, plus votre site apparaît dans les recherches patients.' },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-lg shrink-0 mt-0.5">{item.icon}</span>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mb-6">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-2">Exemples de spécialités</p>
                  <div className="flex flex-wrap gap-1.5">
                    {defaultSpecialties.map((s) => (
                      <span key={s.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-full text-xs text-gray-500">
                        <span>{getIconEmoji(s.icon)}</span>
                        {s.title}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setSpecSubStep('build')}
                  className="w-full py-2.5 rounded-xl bg-color-1 text-white text-sm font-semibold hover:bg-gray-800 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  Commencer
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        }

        // Sub-state C: Validation summary
        if (specSubStep === 'validate') {
          const n = data.specialties.length;
          return (
            <div className="space-y-4" style={{ animation: 'tab-fade-in 0.3s ease' }}>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-2">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Récapitulatif</h2>
                <p className="text-sm text-muted-foreground mt-1">{n} spécialité{n > 1 ? 's' : ''} configurée{n > 1 ? 's' : ''}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {data.specialties.map((spec) => (
                  <div key={spec.id} className="p-3 bg-gray-50 rounded-xl flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-color-2/10 flex items-center justify-center text-xl shrink-0">
                      {getIconEmoji(spec.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground">{spec.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{spec.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-orange-50 rounded-xl p-4 space-y-2">
                <h3 className="text-sm font-bold text-color-1">Ce qui sera créé</h3>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">📄</span>
                    <p className="text-xs text-gray-600"><span className="font-semibold">{n} page{n > 1 ? 's' : ''}</span> de spécialité dédiée{n > 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">✍️</span>
                    <p className="text-xs text-gray-600"><span className="font-semibold">~30 articles SEO/mois</span> répartis entre vos {n} thématiques</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">📈</span>
                    <p className="text-xs text-gray-600">Chaque article cible un <span className="font-semibold">mot-clé local</span> pour attirer des patients</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSpecSubStep('build')}
                  className="flex-1 py-2 rounded-xl bg-gray-100 text-sm font-medium text-color-1 hover:bg-gray-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Modifier
                </button>
                <button
                  onClick={() => handleValidateSection("specialties")}
                  className="flex-1 py-2 rounded-xl bg-color-2 text-sm font-semibold text-white hover:bg-[#e55e35] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  {validatedSection === "specialties" ? "Enregistré !" : "Enregistrer"}
                </button>
              </div>
            </div>
          );
        }

        // Sub-state B: Build list
        const specCount = data.specialties.length;
        return (
          <div className="space-y-3" style={{ animation: 'tab-fade-in 0.3s ease' }}>
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Vos spécialités</h2>
                <span className="text-sm font-bold text-color-2">{specCount}/6</span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">Ajoutez entre 3 et 6 spécialités.</p>
            </div>

            {/* Progress dots */}
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-all",
                    i < specCount ? "bg-color-2" : i < 3 ? "bg-color-2/20" : "bg-gray-100"
                  )}
                />
              ))}
            </div>

            {/* Add form — visible if < 6 */}
            {specCount < 6 && (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  {/* Emoji picker */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSpecFormIconPicker(!showSpecFormIconPicker)}
                      className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-xl shrink-0 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                    >
                      {newSpecFormIcon}
                    </button>
                    {showSpecFormIconPicker && (
                      <div className="absolute top-12 left-0 z-20 bg-white rounded-xl shadow-lg border p-2 grid grid-cols-5 gap-1 w-[180px]" style={{ animation: 'tab-fade-in 0.15s ease' }}>
                        {SPECIALTY_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => { setNewSpecFormIcon(emoji); setShowSpecFormIconPicker(false); }}
                            className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-gray-100 transition-colors cursor-pointer", newSpecFormIcon === emoji && "bg-color-2/10 ring-1 ring-color-2/30")}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    {/* Title */}
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="text-[10px] text-gray-400 font-medium">Titre</label>
                        <span className={cn("text-[10px] tabular-nums", newSpecTitle.length > 25 ? "text-color-2" : "text-gray-300")}>{newSpecTitle.length}/30</span>
                      </div>
                      <input
                        type="text"
                        value={newSpecTitle}
                        onChange={(e) => { if (e.target.value.length <= 30) setNewSpecTitle(e.target.value) }}
                        placeholder="Ex: Douleurs musculaires"
                        className="w-full text-sm font-medium text-foreground bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-color-2/30 focus:border-color-2/30 transition-all placeholder:text-gray-300"
                      />
                    </div>
                    {/* Description */}
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="text-[10px] text-gray-400 font-medium">Description</label>
                        <span className={cn("text-[10px] tabular-nums", newSpecDesc.length > 80 ? "text-color-2" : "text-gray-300")}>{newSpecDesc.length}/100</span>
                      </div>
                      <input
                        type="text"
                        value={newSpecDesc}
                        onChange={(e) => { if (e.target.value.length <= 100) setNewSpecDesc(e.target.value) }}
                        placeholder="Ex: Traitement des tensions et contractures musculaires"
                        className="w-full text-xs text-muted-foreground bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-color-2/30 focus:border-color-2/30 transition-all placeholder:text-gray-300"
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!newSpecTitle.trim()) return;
                    const newSpec = {
                      id: Date.now().toString(),
                      icon: newSpecFormIcon,
                      title: newSpecTitle.trim(),
                      description: newSpecDesc.trim() || `Spécialité : ${newSpecTitle.trim()}`,
                    };
                    setData(prev => ({ ...prev, specialties: [...prev.specialties, newSpec] }));
                    setNewSpecTitle('');
                    setNewSpecDesc('');
                    setNewSpecFormIcon('✨');
                    // Auto-transition to validate at 6
                    if (specCount + 1 >= 6) {
                      setTimeout(() => setSpecSubStep('validate'), 300);
                    }
                  }}
                  disabled={!newSpecTitle.trim()}
                  className={cn(
                    "w-full py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5",
                    newSpecTitle.trim()
                      ? "bg-color-1 text-white hover:bg-gray-800"
                      : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  )}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ajouter
                </button>
              </div>
            )}

            {/* Already added specialties */}
            {specCount > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {data.specialties.map((spec) => (
                  <div key={spec.id} className="p-2.5 bg-gray-50 rounded-xl flex items-start gap-2.5 relative group">
                    <div className="w-9 h-9 rounded-lg bg-color-2/10 flex items-center justify-center text-lg shrink-0">
                      {getIconEmoji(spec.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-semibold text-foreground">{spec.title}</h3>
                      <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{spec.description}</p>
                    </div>
                    <button
                      onClick={() => setData(prev => ({ ...prev, specialties: prev.specialties.filter(s => s.id !== spec.id) }))}
                      className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-gray-200/0 group-hover:bg-gray-200 flex items-center justify-center text-gray-300 group-hover:text-gray-500 transition-all cursor-pointer"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Action buttons */}
            {specCount >= 3 && (
              <div className="flex gap-2">
                {specCount < 6 && (
                  <button
                    onClick={() => setSpecSubStep('validate')}
                    className="flex-1 py-2 rounded-xl bg-gray-100 text-sm font-medium text-color-1 hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    Valider avec {specCount} spécialité{specCount > 1 ? 's' : ''}
                  </button>
                )}
                {specCount >= 6 && (
                  <button
                    onClick={() => setSpecSubStep('validate')}
                    className="flex-1 py-2 rounded-xl bg-color-2 text-sm font-semibold text-white hover:bg-[#e55e35] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Valider
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        );
      }

      case 4:
        return (
          <div className="space-y-4" style={{ animation: 'tab-fade-in 0.3s ease' }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">Google Business</h2>
                <p className="text-sm text-muted-foreground">{data.google.connected ? "Votre fiche Google est connectée." : "Recherchez votre établissement pour le connecter."}</p>
              </div>
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
              <>
                {/* Search input */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      value={googleQuery}
                      onChange={(e) => handleGoogleQueryChange(e.target.value)}
                      placeholder="Ex : Cabinet Dupont Lyon"
                      className="h-10 pl-10 pr-10"
                    />
                    {googleSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />}
                  </div>

                  {/* Results */}
                  {googleResults.length > 0 && (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
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
                            <p className="text-xs text-muted-foreground truncate">{result.address}</p>
                            {result.rating && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <div className="flex text-amber-400 text-xs">{"★".repeat(Math.round(result.rating))}</div>
                                <span className="text-xs text-muted-foreground">{result.rating}/5 · {result.reviewCount} avis</span>
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
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-sm text-muted-foreground">Aucun établissement trouvé. Essayez avec un autre nom ou ajoutez la ville.</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => { handleConnectGoogle(selectedGoogleResult); handleValidateSection("google"); }}
                  disabled={!selectedGoogleResult}
                  className={cn("w-full px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer", selectedGoogleResult ? "bg-[#FC6D41] text-white hover:bg-[#e55e35]" : "bg-gray-200 text-gray-400 cursor-not-allowed")}
                >
                  Connecter cet établissement
                </button>
              </>
            )}
            <button
              onClick={() => handleValidateSection("google")}
              className={cn("px-5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer", changedSections.has("google") ? "bg-[#FC6D41] text-white hover:bg-[#e55e35]" : "bg-gray-100 text-gray-400")}
            >
              {validatedSection === "google" ? "Enregistré !" : "Enregistrer"}
            </button>
          </div>
        );

      case 5: {
        const ch = REVIEW_CHANNELS.find(c => c.id === activeChannel) || REVIEW_CHANNELS[0];
        const chTemplate = data.reviewTemplates[ch.id];
        const chMessage = chTemplate?.message || "";
        const chSubject = chTemplate?.subject || "";
        const chResolvedMsg = chMessage.replace(/\{link\}/g, data.reviewTemplates.googleLink || "[lien Google]");
        const chResolvedSubject = chSubject.replace(/\{link\}/g, data.reviewTemplates.googleLink || "[lien Google]");
        return (
          <div className="space-y-4" style={{ animation: 'tab-fade-in 0.3s ease' }}>
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">Collecter des avis</h2>
              <p className="text-sm text-muted-foreground">Envoyez un message pré-rédigé après chaque consultation.</p>
            </div>

            {/* Google review link — compact */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl flex-1 min-w-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <Input
                  value={data.reviewTemplates.googleLink}
                  onChange={(e) => setData(prev => ({ ...prev, reviewTemplates: { ...prev.reviewTemplates, googleLink: e.target.value } }))}
                  placeholder="https://g.page/r/votre-lien-avis"
                  className="h-7 text-xs border-0 bg-transparent shadow-none px-0 focus-visible:ring-0"
                />
              </div>
            </div>

            {/* Channel tabs */}
            <div className="flex gap-1.5">
              {REVIEW_CHANNELS.map((channel) => {
                const Icon = channel.icon;
                const isActive = activeChannel === channel.id;
                return (
                  <button
                    key={channel.id}
                    onClick={() => setActiveChannel(channel.id)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer",
                      isActive
                        ? cn("text-white shadow-sm", channel.color)
                        : "bg-gray-100 text-gray-500 hover:bg-gray-150"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {channel.label}
                  </button>
                );
              })}
            </div>

            {/* Active channel content */}
            <div className="space-y-2.5">
              {ch.hasSubject && (
                <div className="space-y-1">
                  <Label className="text-xs">Objet</Label>
                  <Input
                    value={chSubject}
                    onChange={(e) => updateReviewTemplate(ch.id, { subject: e.target.value })}
                    placeholder="Objet de l'email"
                    className="h-8 text-sm"
                  />
                </div>
              )}
              <div className="space-y-1">
                <Label className="text-xs">Message</Label>
                <Textarea
                  value={chMessage}
                  onChange={(e) => updateReviewTemplate(ch.id, { message: e.target.value })}
                  placeholder="Votre message..."
                  className="text-sm min-h-[100px] resize-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const url = ch.getUrl(chResolvedMsg, chResolvedSubject);
                    window.open(url, '_blank');
                  }}
                  className={cn("flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-white transition-colors cursor-pointer", ch.color)}
                >
                  <ExternalLink className="w-3 h-3" />
                  Envoyer via {ch.label}
                </button>
                <button
                  onClick={() => handleValidateSection("reviewTemplates")}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer",
                    changedSections.has("reviewTemplates")
                      ? "bg-[#FC6D41] text-white hover:bg-[#e55e35]"
                      : "bg-gray-100 text-gray-400"
                  )}
                >
                  {validatedSection === "reviewTemplates" ? "Enregistré !" : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        );
      }

      case 6:
        return (
          <div className="space-y-4" style={{ animation: 'tab-fade-in 0.3s ease' }}>
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">Rédaction IA</h2>
              <p className="text-sm text-muted-foreground">Configurez le style et le ton de vos contenus générés par l'IA.</p>
            </div>

            {/* Tone */}
            <div className="space-y-2">
              <Label className="text-xs">Ton de communication</Label>
              <div className="flex gap-2">
                {[
                  { id: 'professionnel', label: 'Professionnel' },
                  { id: 'chaleureux', label: 'Chaleureux' },
                  { id: 'expert', label: 'Expert' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setData(prev => ({ ...prev, redaction: { ...prev.redaction, tone: t.id } }))}
                    className={cn(
                      "flex-1 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer",
                      data.redaction.tone === t.id
                        ? "bg-color-1 text-white shadow-sm"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-150"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Style */}
            <div className="space-y-2">
              <Label className="text-xs">Style de rédaction</Label>
              <div className="flex gap-2">
                {[
                  { id: 'informatif', label: 'Informatif' },
                  { id: 'conversationnel', label: 'Conversationnel' },
                  { id: 'pedagogique', label: 'Pédagogique' },
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => setData(prev => ({ ...prev, redaction: { ...prev.redaction, style: s.id } }))}
                    className={cn(
                      "flex-1 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer",
                      data.redaction.style === s.id
                        ? "bg-color-1 text-white shadow-sm"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-150"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pronoun */}
            <div className="space-y-2">
              <Label className="text-xs">Pronom utilisé</Label>
              <div className="flex gap-2">
                {[
                  { id: 'nous', label: 'Nous', desc: '"Nous vous accueillons..."' },
                  { id: 'je', label: 'Je', desc: '"Je vous accueille..."' },
                  { id: 'on', label: 'On', desc: '"On vous accueille..."' },
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setData(prev => ({ ...prev, redaction: { ...prev.redaction, pronoun: p.id } }))}
                    className={cn(
                      "flex-1 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex flex-col items-center gap-0.5",
                      data.redaction.pronoun === p.id
                        ? "bg-color-1 text-white shadow-sm"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-150"
                    )}
                  >
                    <span>{p.label}</span>
                    <span className={cn("text-[9px]", data.redaction.pronoun === p.id ? "text-white/60" : "text-gray-400")}>{p.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* System prompt */}
            <div className="space-y-1.5">
              <Label className="text-xs">Instructions supplémentaires</Label>
              <Textarea
                value={data.redaction.systemPrompt}
                onChange={(e) => setData(prev => ({ ...prev, redaction: { ...prev.redaction, systemPrompt: e.target.value } }))}
                placeholder="Ex: Toujours mentionner que le cabinet est accessible PMR. Éviter le jargon médical trop technique. Mettre en avant l'approche douce..."
                className="text-sm min-h-[80px] resize-none"
              />
              <p className="text-[10px] text-muted-foreground">Ces instructions seront appliquées à tous les contenus générés par l'IA (articles, descriptions, etc.)</p>
            </div>

            {/* Live preview */}
            {(() => {
              const { tone, style, pronoun } = data.redaction;
              const pronoms = {
                nous: { subject: 'Nous', verb: 'proposons', accueil: 'accueillons', invite: 'invitons', souhait: 'souhaitons', possessif: 'notre', possessifPl: 'nos' },
                je: { subject: 'Je', verb: 'propose', accueil: 'accueille', invite: 'invite', souhait: 'souhaite', possessif: 'mon', possessifPl: 'mes' },
                on: { subject: 'On', verb: 'propose', accueil: 'accueille', invite: 'invite', souhait: 'souhaite', possessif: 'notre', possessifPl: 'nos' },
              };
              const p = pronoms[pronoun] || pronoms.nous;

              const previews = {
                professionnel: {
                  informatif: `${p.subject} ${p.verb} des séances de kinésithérapie adaptées à chaque patient. ${p.possessifPl.charAt(0).toUpperCase() + p.possessifPl.slice(1)} protocoles sont élaborés selon les dernières recommandations de la HAS afin d'assurer une prise en charge optimale.`,
                  conversationnel: `${p.subject} ${p.accueil} chaque patient avec attention. Vous avez des douleurs lombaires ? ${p.possessifPl.charAt(0).toUpperCase() + p.possessifPl.slice(1)} séances de rééducation sont conçues pour répondre précisément à ${p.possessif} problématique.`,
                  pedagogique: `La kinésithérapie vise à restaurer la mobilité et réduire la douleur. ${p.subject} ${p.verb} un bilan initial complet, puis ${pronoun === 'nous' ? 'nous mettons' : pronoun === 'je' ? 'je mets' : 'on met'} en place un plan de traitement personnalisé, étape par étape.`,
                },
                chaleureux: {
                  informatif: `${p.subject} ${p.accueil} dans un cadre bienveillant pour prendre soin de votre bien-être. ${p.possessifPl.charAt(0).toUpperCase() + p.possessifPl.slice(1)} séances de kinésithérapie sont pensées pour que vous vous sentiez écouté et accompagné à chaque instant.`,
                  conversationnel: `Bienvenue ! ${p.subject} ${p.souhait} avant tout que vous vous sentiez à l'aise. ${p.subject} ${p.invite} à découvrir ${p.possessif} approche douce et personnalisée — parce que votre confort est ${p.possessif} priorité.`,
                  pedagogique: `Prendre soin de soi, c'est d'abord comprendre son corps. ${p.subject} ${p.verb} de vous guider avec bienveillance : ensemble, ${pronoun === 'je' ? 'nous' : p.subject.toLowerCase()} ${pronoun === 'je' ? 'verrons' : 'verrons'} comment soulager vos tensions, pas à pas.`,
                },
                expert: {
                  informatif: `${p.subject} ${p.verb} une prise en charge en kinésithérapie basée sur les données probantes. Évaluation posturale, thérapie manuelle et exercices fonctionnels : ${p.possessifPl} protocoles ciblent les mécanismes physiopathologiques sous-jacents.`,
                  conversationnel: `Vous ressentez une raideur cervicale après de longues heures de travail ? ${p.subject} ${p.verb} une analyse biomécanique approfondie pour identifier les causes et adapter le traitement en conséquence.`,
                  pedagogique: `Le rachis lombaire supporte l'essentiel des contraintes mécaniques du quotidien. ${p.subject} ${p.verb} de vous expliquer les mécanismes en jeu puis de mettre en œuvre un programme de renforcement ciblé et progressif.`,
                },
              };

              const text = previews[tone]?.[style] || previews.professionnel.informatif;

              return (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles size={12} className="text-color-2" />
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Aperçu du style</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{text}</p>
                </div>
              );
            })()}

            <button
              onClick={() => handleValidateSection("redaction")}
              className={cn(
                "px-5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                changedSections.has("redaction")
                  ? "bg-[#FC6D41] text-white hover:bg-[#e55e35]"
                  : "bg-gray-100 text-gray-400"
              )}
            >
              {validatedSection === "redaction" ? "Enregistré !" : "Enregistrer"}
            </button>
          </div>
        );

      case 8:
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

      case 7:
        return (
          <div className="space-y-4" style={{ animation: 'tab-fade-in 0.3s ease' }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">Nom de domaine</h2>
                <p className="text-sm text-muted-foreground">{domainBought ? "Votre domaine personnalisé est connecté." : "Choisissez un nom de domaine professionnel pour votre cabinet."}</p>
              </div>
            </div>

            {domainBought ? (
              <>
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
              </>
            ) : (
              <>
                <div className="space-y-3">
                  <div className="relative">
                    <Input
                      value={domainSearch}
                      onChange={(e) => { setDomainSearch(e.target.value); setDomainSearchResult(null); }}
                      placeholder="ex: cabinet-dupont"
                      className="h-10 pr-12"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && domainSearch.trim()) {
                          const result = domainSearch.trim().replace(/\s+/g, '-').toLowerCase();
                          setDomainSearchResult(result.includes('.') ? result : result + '.fr');
                        }
                      }}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">.fr</span>
                  </div>

                  {/* Suggestions */}
                  {!domainSearchResult && (
                    <div className="flex flex-wrap gap-2">
                      {['osteo-lyon', 'dupont-osteo', 'theo-osteo', 'dupont-theo'].map((sug, i) => {
                        const labels = ['métier-ville', 'nom-métier', 'prénom-métier', 'nom-prénom'];
                        return (
                          <button
                            key={sug}
                            onClick={() => { setDomainSearch(sug); }}
                            className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-muted-foreground hover:border-[#FC6D41] hover:text-[#FC6D41] transition-all cursor-pointer"
                          >
                            <span className="font-medium text-foreground">{sug}.fr</span>
                            <span className="ml-1.5 text-xs text-gray-400">{labels[i]}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Results */}
                  {domainSearchResult && (
                    <div className="space-y-2">
                      {[
                        { ext: '.fr', price: 'Offert', available: true, highlight: true },
                        { ext: '.com', price: '8,99€/an', available: true, highlight: false },
                        { ext: '.cabinet', price: '14,99€/an', available: false, highlight: false },
                      ].map((opt) => {
                        const name = domainSearchResult.replace(/\.[^.]+$/, '') + opt.ext;
                        return (
                          <button
                            key={opt.ext}
                            onClick={() => { if (opt.available) { setDomainSearchResult(name); } }}
                            disabled={!opt.available}
                            className={cn(
                              "w-full flex items-center justify-between px-3 py-2.5 rounded-xl border-2 transition-all text-left",
                              !opt.available
                                ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                                : opt.highlight
                                  ? "border-[#FC6D41] bg-[#FC6D41]/5 hover:bg-[#FC6D41]/10 cursor-pointer"
                                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer"
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", opt.highlight ? "bg-[#FC6D41]/10" : "bg-gray-100")}>
                                <Globe className={cn("w-3.5 h-3.5", opt.highlight ? "text-[#FC6D41]" : "text-gray-400")} />
                              </div>
                              <span className={cn("text-sm font-semibold", !opt.available ? "text-gray-400" : "text-foreground")}>{name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {opt.highlight ? (
                                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">OFFERT</span>
                              ) : !opt.available ? (
                                <span className="text-xs text-red-400 font-medium">Indisponible</span>
                              ) : (
                                <span className="text-xs text-muted-foreground">{opt.price}</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (domainSearchResult) {
                      setDomainBought(true);
                      handleValidateSection("domain");
                    } else if (domainSearch.trim()) {
                      const result = domainSearch.trim().replace(/\s+/g, '-').toLowerCase();
                      setDomainSearchResult(result.includes('.') ? result : result + '.fr');
                    }
                  }}
                  disabled={!domainSearch.trim()}
                  className={cn("w-full px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer", domainSearch.trim() ? "bg-[#FC6D41] text-white hover:bg-[#e55e35]" : "bg-gray-200 text-gray-400 cursor-not-allowed")}
                >
                  {domainSearchResult ? "Connecter ce domaine" : "Rechercher"}
                </button>
              </>
            )}

            <button
              onClick={() => handleValidateSection("domain")}
              className={cn("px-5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer", changedSections.has("domain") ? "bg-[#FC6D41] text-white hover:bg-[#e55e35]" : "bg-gray-100 text-gray-400")}
            >
              {validatedSection === "domain" ? "Enregistré !" : "Enregistrer"}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  const sidebarContent = (
    <>
      <div className={cn(isModal ? "p-4" : "bg-white border-2 border-gray-200 rounded-2xl p-5")}>
        {!isModal && <h2 className="text-base font-bold text-[#2D2D2D] mb-3">Configuration</h2>}
        <div className="flex flex-col gap-0.5">
          {MAIN_STEPS.map((step, index) => {
            const isActive = index === currentStep;
            const isDone = completedActionIds.includes(step.id);
            const Icon = step.icon;
            return (
              <button
                key={step.id}
                onClick={() => goToStep(index)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer text-left",
                  isActive
                    ? isModal ? "bg-color-1 text-white font-medium" : "text-[#FC6D41] font-semibold"
                    : isModal ? "text-gray-500 hover:bg-gray-50 hover:text-color-1" : "text-gray-600 hover:bg-gray-50"
                )}
              >
                {isModal ? (
                  <Icon className="w-4 h-4 shrink-0" />
                ) : isActive ? (
                  <div className="w-2 h-2 rounded-full bg-[#FC6D41] shrink-0" />
                ) : !allMainDone && isDone ? (
                  <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                ) : (
                  <div className="w-2 h-2 shrink-0" />
                )}
                {step.label}
              </button>
            );
          })}
        </div>
        {!isModal && !allMainDone && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
              <span>{completedActionIds.filter(id => MAIN_STEPS.some(s => s.id === id)).length}/{MAIN_STEPS.length}</span>
            </div>
            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#FC6D41] rounded-full transition-all duration-300" style={{ width: `${(completedActionIds.filter(id => MAIN_STEPS.some(s => s.id === id)).length / MAIN_STEPS.length) * 100}%` }} />
            </div>
          </div>
        )}
      </div>
      {isModal && <div className="h-px bg-gray-100 mx-4" />}
      <div className={cn(isModal ? "p-4" : "bg-white border-2 border-gray-200 rounded-2xl p-5")}>
        {!isModal && <h2 className="text-sm font-bold text-[#2D2D2D] mb-3">Paramètres avancés</h2>}
        {isModal && <p className="px-3 pb-1.5 text-[10px] font-medium text-gray-300 uppercase tracking-wider">Avancés</p>}
        <div className="flex flex-col gap-0.5">
          {ADVANCED_STEPS.map((step, advIdx) => {
            const globalIdx = MAIN_STEPS.length + advIdx;
            const isActive = globalIdx === currentStep;
            const Icon = step.icon;
            return (
              <button
                key={step.id}
                onClick={() => goToStep(globalIdx)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer text-left",
                  isActive
                    ? isModal ? "bg-color-1 text-white font-medium" : "text-[#FC6D41] font-semibold"
                    : isModal ? "text-gray-500 hover:bg-gray-50 hover:text-color-1" : "text-gray-600 hover:bg-gray-50"
                )}
              >
                {isModal ? (
                  <Icon className="w-4 h-4 shrink-0" />
                ) : isActive ? (
                  <div className="w-2 h-2 rounded-full bg-[#FC6D41] shrink-0" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-gray-200 shrink-0" />
                )}
                {step.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );

  const mainContent = isModal ? (
    <div className="flex h-full">
      <div className="w-[220px] shrink-0 border-r border-gray-100 flex flex-col overflow-y-auto">
        <div className="px-5 pt-5 pb-3">
          <h2 className="text-base font-bold text-[#2D2D2D]">Options du site</h2>
        </div>
        {sidebarContent}
      </div>
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-4 pb-2">
          <h3 className="text-sm font-semibold text-color-1">{ALL_STEPS[currentStep]?.label}</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-color-1 hover:bg-gray-100 transition-colors cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {renderStepContent()}
        </div>
      </div>
    </div>
  ) : (
    <div className="h-screen bg-gray-50 overflow-hidden flex flex-col items-center" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      {/* Top nav */}
      <nav className="w-full max-w-[1200px] px-6 pt-4 pb-1 shrink-0 z-[70]">
        <div className="flex items-center justify-between relative h-10">
          <button
            onClick={() => router.push('/editor/accueil')}
            className="flex items-center gap-2 text-gray-500 hover:text-color-1 transition-colors cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            <span className="font-medium text-sm">Retourner sur l'éditeur</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 overflow-hidden w-full max-w-[1200px] px-6 py-4 min-h-0" style={{ animation: 'tab-fade-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
        {/* Left Sidebar */}
        <div className="w-[240px] shrink-0 flex flex-col gap-3">
          {sidebarContent}
          {/* Hidden reset button */}
          <button
            onClick={handleResetAll}
            className="mt-auto text-[10px] text-gray-300 hover:text-gray-500 transition-colors cursor-pointer self-start px-2 py-1"
          >
            Reset demo
          </button>
        </div>

        {/* Right Content */}
        <div className="flex-1 min-h-0">
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 h-full flex flex-col">
            <div className="flex-1">{renderStepContent()}</div>
            {/* Step navigation for main steps — only show during guided flow */}
            {currentStep < MAIN_STEPS.length && !allMainDone && (
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                <button
                  onClick={() => currentStep > 0 && goToStep(currentStep - 1)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer",
                    currentStep > 0 ? "text-gray-600 hover:bg-gray-100" : "text-gray-300 cursor-not-allowed"
                  )}
                  disabled={currentStep === 0}
                >
                  <ArrowLeft size={14} />
                  Précédent
                </button>
                <span className="text-xs text-gray-400">{currentStep + 1} sur {MAIN_STEPS.length}</span>
                {currentStep < MAIN_STEPS.length - 1 ? (
                  <button
                    onClick={() => goToStep(currentStep + 1)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FC6D41] text-white text-sm font-medium hover:bg-[#e55e35] transition-colors cursor-pointer"
                  >
                    Suivant
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      // Mark all main steps as completed
                      const existing = JSON.parse(localStorage.getItem("completedActions") || "[]")
                      const allIds = [...new Set([...existing, ...MAIN_STEPS.map(s => s.id), 'setup'])]
                      localStorage.setItem("completedActions", JSON.stringify(allIds))
                      setCompletedActionIds(allIds)
                      window.dispatchEvent(new Event("actionsUpdated"))
                      router.push('/dashboard')
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors cursor-pointer"
                  >
                    <Check size={14} />
                    Terminer
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );

  const sharedModals = (
    <>
      {/* Delete Specialty Modal */}
      {deleteModalOpen && specialtyToDelete && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[200]"
            onClick={handleCancelDelete}
          />
          <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
              {!showReplaceInput && !createdSpecialty && (
                <>
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
                    <Button variant="outline" className="flex-1" onClick={handleCancelDelete}>Non</Button>
                    <Button variant="destructive" className="flex-1" onClick={handleConfirmDelete}>Oui</Button>
                  </div>
                </>
              )}
              {showReplaceInput && !isCreatingSpecialty && !createdSpecialty && (
                <>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Nouvelle spécialité</h3>
                    <p className="text-muted-foreground text-sm mb-4">Choisissez une icône et un nom pour votre nouvelle spécialité.</p>
                    <div className="grid grid-cols-10 gap-1 mb-4 p-2 bg-gray-50 rounded-xl">
                      {SPECIALTY_EMOJIS.map((emoji) => (
                        <button key={emoji} onClick={() => setNewSpecialtyIcon(emoji)} className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-white transition-colors cursor-pointer", newSpecialtyIcon === emoji && "bg-white ring-1 ring-primary/30 shadow-sm")}>{emoji}</button>
                      ))}
                    </div>
                    <Input value={newSpecialtyName} onChange={(e) => setNewSpecialtyName(e.target.value)} placeholder="Ex: Mal de dos, Migraines, Stress..." autoFocus />
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={handleCancelDelete}>Annuler</Button>
                    <Button className="flex-1" onClick={handleCreateReplacement} disabled={!newSpecialtyName.trim()}>Valider</Button>
                  </div>
                </>
              )}
              {isCreatingSpecialty && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                    <span className="text-3xl">{"⏳"}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Création en cours...</h3>
                  <p className="text-muted-foreground text-sm">Veuillez patienter le temps que l'on crée la page "{newSpecialtyName}".</p>
                </div>
              )}
              {createdSpecialty && (
                <>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                      <span className="text-3xl">{"\ud83c\udf89"}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Félicitations !</h3>
                    <p className="text-muted-foreground text-sm">La page <strong>"{createdSpecialty}"</strong> a été créée avec succès.</p>
                  </div>
                  <Button className="w-full" onClick={handleFinishReplacement}>Valider la page pour la publier</Button>
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
    </>
  );

  return (
    <>
      {mainContent}
      {sharedModals}
    </>
  );
};

export default Setup;
