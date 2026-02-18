import { useState, useEffect, useRef, useCallback } from "react";
import { Link2, Rocket } from "lucide-react";
import theralysLogo from '../../assets/theralys-logo.svg';
import { cn } from "@/lib/utils";
import EditorCanvas from "./EditorCanvas";
import FloatingEditToolbar from "./FloatingEditToolbar";
import { ProofreadingProvider, useProofreading } from "./ProofreadingContext";
import EditorToolbar from "./EditorToolbar";
import ImageCropModal from "./modals/ImageCropModal";
import ImagePositionModal from "./modals/ImagePositionModal";
import BadgeItemModal from "./modals/BadgeItemModal";
import LocationItemModal from "./modals/LocationItemModal";
import ReviewItemModal from "./modals/ReviewItemModal";
import StylePanel, { colorPalettes, typographyPairs, radiusOptions } from "./StylePanel";

import {
  defaultLocations,
  defaultRatingBadge,
  defaultPatientsBadge,
  defaultFeatures,
  defaultPainTypes,
  defaultSessionSteps,
  defaultFAQItems,
  defaultContent,
  defaultGlobalSettings,
  defaultIdentitySettings,
  defaultStyleSettings,
} from "./defaults";
import { loadSaved, saveTo } from "./storage";

const SiteEditorContent = ({ onGoToSetup, onBackToDashboard, initialOpenStyle }) => {
  const proofreading = useProofreading();
  const [activeEditId, setActiveEditIdRaw] = useState(null);
  const canvasRef = useRef(null);

  // Wrapper: blur active contentEditable before changing edit ID to ensure save
  const setActiveEditId = useCallback((id) => {
    const focused = document.activeElement;

    // If activating a new element, blur the old one (if it's contentEditable)
    if (focused && focused.getAttribute('contenteditable') === 'true') {
      // Check if the focused element is the one we're about to activate
      const focusedProofreadId = focused.closest('[data-proofread-id]')?.getAttribute('data-proofread-id');

      // Only blur if we're switching to a different element
      if (focusedProofreadId !== id) {
        focused.blur();
      }
    }

    setActiveEditIdRaw(id);
  }, []);

  // Onboarding state — stays active until publish
  const [isOnboardingMode, setIsOnboardingMode] = useState(() => {
    return localStorage.getItem("onboardingComplete") !== "true";
  });
  const [setupCompleted, setSetupCompleted] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [isSitePublished, setIsSitePublished] = useState(() => localStorage.getItem("sitePublished") === "true");
  const [hasChanges, setHasChanges] = useState(() => localStorage.getItem("editorHasChanges") === "true");
  const [linkCopied, setLinkCopied] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavAction, setPendingNavAction] = useState(null);
  const [showStyleModal, setShowStyleModal] = useState(!!initialOpenStyle);
  const [showSpecialtyConfirm, setShowSpecialtyConfirm] = useState(false);
  const [showTherapistConfirm, setShowTherapistConfirm] = useState(false);
  const [completedActions, setCompletedActions] = useState(() => {
    try { return JSON.parse(localStorage.getItem("completedActions") || "[]"); } catch { return []; }
  });
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropTarget, setCropTarget] = useState(null);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [positionTarget, setPositionTarget] = useState(null);
  const [heroImagePosition, setHeroImagePosition] = useState(() => loadSaved("heroImagePosition", { x: 50, y: 50 }));
  const [aboutImagePosition, setAboutImagePosition] = useState(() => loadSaved("aboutImagePosition", { x: 50, y: 50 }));

  // Modal states for clickable elements
  const [showRatingBadgeModal, setShowRatingBadgeModal] = useState(false);
  const [showPatientsBadgeModal, setShowPatientsBadgeModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  // View mode
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [viewMode, setViewMode] = useState("desktop");
  const [canvasOpacity, setCanvasOpacity] = useState(1);

  // Fade transition when switching view mode
  const handleViewModeChange = useCallback((newMode) => {
    if (newMode === viewMode) return;
    setCanvasOpacity(0);
    // Wait 200ms to guarantee fade-out is fully complete (150ms transition + buffer)
    setTimeout(() => {
      if (canvasRef.current) canvasRef.current.scrollTop = 0;
      setViewMode(newMode);
      // Wait for layout to settle, then fade in
      setTimeout(() => {
        setCanvasOpacity(1);
      }, 50);
    }, 200);
  }, [viewMode]);

  // Page navigation
  const [currentPage, setCurrentPage] = useState("accueil");

  // Data states
  const [content, setContent] = useState(() => loadSaved("content", defaultContent));
  const [locations, setLocations] = useState(() => loadSaved("locations", defaultLocations));
  const [ratingBadge, setRatingBadge] = useState(() => loadSaved("ratingBadge", defaultRatingBadge));
  const [patientsBadge, setPatientsBadge] = useState(() => loadSaved("patientsBadge", defaultPatientsBadge));
  const [features, setFeatures] = useState(() => loadSaved("features", defaultFeatures));
  const [painTypes, setPainTypes] = useState(() => loadSaved("painTypes", defaultPainTypes));
  const [sessionSteps, setSessionSteps] = useState(() => loadSaved("sessionSteps", defaultSessionSteps));
  const [faqItems, setFAQItems] = useState(() => loadSaved("faqItems", defaultFAQItems));
  const [globalSettings, setGlobalSettings] = useState(() => loadSaved("globalSettings", defaultGlobalSettings));
  const [heroImage, setHeroImage] = useState(() => loadSaved("heroImage", "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop"));
  const [aboutImage, setAboutImage] = useState(() => loadSaved("aboutImage", "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&h=400&fit=crop"));
  const [heroImageOriginal, setHeroImageOriginal] = useState(() => loadSaved("heroImageOriginal", null));
  const [aboutImageOriginal, setAboutImageOriginal] = useState(() => loadSaved("aboutImageOriginal", null));
  const imageInputRef = useRef(null);
  const [pendingImageTarget, setPendingImageTarget] = useState(null);
  const [identitySettings, setIdentitySettings] = useState(() => loadSaved("identitySettings", defaultIdentitySettings));
  const [styleSettings, setStyleSettings] = useState(() => loadSaved("styleSettings", defaultStyleSettings));
  const [reviews, setReviews] = useState([]);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [googleProfileName, setGoogleProfileName] = useState(undefined);
  const [googleProfilePhoto, setGoogleProfilePhoto] = useState(undefined);
  const [sessionInfo, setSessionInfo] = useState(() => loadSaved("sessionInfo", {
    duration: "45 min",
    price: "60 \u20AC",
    reimbursement: "Remboursement mutuelle possible",
    durationIcon: "\u23F1\uFE0F",
    priceIcon: "\uD83D\uDCB0",
    reimbursementIcon: "\uD83D\uDEE1\uFE0F",
    showReimbursement: true,
    showStartingFrom: false,
    showStartingFromDuration: false,
  }));
  const [legalContent, setLegalContent] = useState(() => loadSaved("legalContent", {
    companyName: "",
    address: "",
    phone: "",
    email: "",
    siret: "",
    hostingProvider: "",
    hostingAddress: "",
    publicationDirector: "",
    lastUpdated: new Date().toLocaleDateString("fr-FR"),
  }));

  // Auto-save editor data to localStorage
  const isFirstRender = useRef(true);
  useEffect(() => {
    const data = { content, features, painTypes, sessionSteps, faqItems, globalSettings, sessionInfo, identitySettings, styleSettings, legalContent, locations, heroImage, aboutImage, heroImageOriginal, aboutImageOriginal, ratingBadge, patientsBadge, heroImagePosition, aboutImagePosition };
    for (const [key, value] of Object.entries(data)) {
      saveTo(key, value);
    }
    // Mark changes after initial load
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else if (isSitePublished) {
      setHasChanges(true);
    }
  }, [content, features, painTypes, sessionSteps, faqItems, globalSettings, sessionInfo, identitySettings, styleSettings, legalContent, locations, heroImage, aboutImage, heroImageOriginal, aboutImageOriginal, ratingBadge, patientsBadge]);

  // Undo/Redo system
  const historyRef = useRef({ past: [], future: [] });
  const [, setHistoryTick] = useState(0);
  const stateRef = useRef({ content, features, painTypes, sessionSteps, faqItems, globalSettings, sessionInfo });
  stateRef.current = { content, features, painTypes, sessionSteps, faqItems, globalSettings, sessionInfo };

  const pushHistory = useCallback(() => {
    const snapshot = { ...stateRef.current };
    historyRef.current.past.push(snapshot);
    historyRef.current.future = [];
    if (historyRef.current.past.length > 50) historyRef.current.past.shift();
    setHistoryTick(v => v + 1);
  }, []);

  const canUndo = historyRef.current.past.length > 0;
  const canRedo = historyRef.current.future.length > 0;

  const undo = useCallback(() => {
    if (historyRef.current.past.length === 0) return;
    const current = { ...stateRef.current };
    const prev = historyRef.current.past.pop();
    historyRef.current.future.unshift(current);
    setContent(prev.content);
    setFeatures(prev.features);
    setPainTypes(prev.painTypes);
    setSessionSteps(prev.sessionSteps);
    setFAQItems(prev.faqItems);
    setGlobalSettings(prev.globalSettings);
    setSessionInfo(prev.sessionInfo);
    setHistoryTick(v => v + 1);
  }, []);

  const redo = useCallback(() => {
    if (historyRef.current.future.length === 0) return;
    const current = { ...stateRef.current };
    const next = historyRef.current.future.shift();
    historyRef.current.past.push(current);
    setContent(next.content);
    setFeatures(next.features);
    setPainTypes(next.painTypes);
    setSessionSteps(next.sessionSteps);
    setFAQItems(next.faqItems);
    setGlobalSettings(next.globalSettings);
    setSessionInfo(next.sessionInfo);
    setHistoryTick(v => v + 1);
  }, []);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'Z' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Click outside canvas → deselect (saves via blur)
  useEffect(() => {
    if (!activeEditId) return;
    const handleGlobalMouseDown = (e) => {
      const target = e.target;
      // Ignore clicks on proofread elements or floating toolbar
      if (target.closest('[data-proofread-id]')) return;
      if (target.closest('[data-floating-toolbar]')) return;
      // Ignore clicks inside canvas container
      if (canvasRef.current?.contains(target)) return;
      // Click is outside — deselect to save
      setActiveEditId(null);
    };
    window.addEventListener('mousedown', handleGlobalMouseDown, true);
    return () => window.removeEventListener('mousedown', handleGlobalMouseDown, true);
  }, [activeEditId]);

  // Mobile: scroll selected element into view when editing starts
  useEffect(() => {
    if (!activeEditId || !isMobileDevice) return;
    const timer = setTimeout(() => {
      const el = document.querySelector(`[data-proofread-id="${activeEditId}"]`);
      if (!el || !canvasRef.current) return;
      const containerRect = canvasRef.current.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const targetTop = canvasRef.current.scrollTop + (elRect.top - containerRect.top) - 80;
      canvasRef.current.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timer);
  }, [activeEditId, isMobileDevice]);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      setIsMobileDevice(isMobile);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Force mobile view on mobile devices
  useEffect(() => {
    if (isMobileDevice) {
      setViewMode("mobile");
    }
  }, [isMobileDevice]);

  // Sync completedActions from localStorage
  useEffect(() => {
    const handler = () => {
      try { setCompletedActions(JSON.parse(localStorage.getItem("completedActions") || "[]")); } catch {}
    };
    window.addEventListener("actionsUpdated", handler);
    return () => window.removeEventListener("actionsUpdated", handler);
  }, []);

  // Close style panel on click outside
  useEffect(() => {
    if (!showStyleModal) return;
    const handler = (e) => {
      const target = e.target;
      if (target.closest('[data-style-panel]') || target.closest('[data-editor-toolbar]')) return;
      setShowStyleModal(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showStyleModal]);

  // Load data from localStorage
  useEffect(() => {
    const setupData = localStorage.getItem("setupData");
    if (setupData) {
      try {
        const parsed = JSON.parse(setupData);
        if (parsed.contact) {
          setGlobalSettings(prev => ({
            ...prev,
            firstName: parsed.contact.firstName || prev.firstName,
            lastName: parsed.contact.lastName || prev.lastName,
            profession: parsed.contact.profession || prev.profession,
            city: parsed.contact.city || prev.city,
            appointmentLink: parsed.contact.appointmentLink || prev.appointmentLink,
            phoneNumber: parsed.contact.phoneNumber || prev.phoneNumber,
          }));
        }
        if (parsed.cabinet?.locations) {
          setLocations(parsed.cabinet.locations);
        }
        if (parsed.style) {
          if (parsed.style.logo) setIdentitySettings(prev => ({ ...prev, logo: parsed.style.logo }));
          if (parsed.style.palette) setStyleSettings(prev => ({ ...prev, palette: parsed.style.palette }));
          if (parsed.style.typography) setStyleSettings(prev => ({ ...prev, typography: parsed.style.typography }));
          if (parsed.style.radius) setStyleSettings(prev => ({ ...prev, radius: parsed.style.radius }));
        }
        if (parsed.google?.connected) {
          setIsGoogleConnected(true);
          setGoogleProfileName(parsed.google.profile?.name);
          setGoogleProfilePhoto(parsed.google.profile?.image);
        }
      } catch (e) {
        console.error("Failed to parse setupData", e);
      }
    }
  }, []);

  // Check if setup was actually completed (verify data, not just flag)
  useEffect(() => {
    const flag = localStorage.getItem("setupComplete") === "true";
    if (flag) {
      const setupDataJson = localStorage.getItem("setupData");
      if (setupDataJson) {
        try {
          const parsed = JSON.parse(setupDataJson);
          const hasContact = !!(
            parsed.contact?.firstName?.trim() &&
            parsed.contact?.lastName?.trim() &&
            parsed.contact?.appointmentLink?.trim()
          );
          const hasLocation = parsed.locations?.length > 0 &&
            parsed.locations.every((l) => l.title?.trim() && l.address?.trim());
          setSetupCompleted(hasContact && hasLocation);
        } catch {
          setSetupCompleted(false);
        }
      }
    }
  }, []);

  // Load Google Fonts for current style
  useEffect(() => {
    const currentTypo = typographyPairs.find(t => t.id === styleSettings.typography) || typographyPairs[0];
    const link = document.createElement("link");
    link.href = `https://fonts.googleapis.com/css2?family=${currentTypo.googleFont}&display=swap`;
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, [styleSettings.typography]);

  // Proofreading element click handler
  const handleProofreadingElementClick = (elementId) => {
    if (proofreading.state.isActive) {
      const element = proofreading.state.elements.find(e => e.id === elementId);
      if (element) {
        const index = proofreading.state.elements.indexOf(element);
        if (index !== -1) {
          proofreading.goToElement(index);
        }
      }
    }
  };

  // Onboarding handlers
  const handleOnboardingPublish = () => {
    setShowPublishConfirm(true);
  };

  const confirmPublish = () => {
    setShowPublishConfirm(false);
    // Publish flow — no pricing modal in this project
    handlePublishComplete();
  };

  const handlePublishComplete = (subdomain) => {
    setIsOnboardingMode(false);
    setIsSitePublished(true);
    setHasChanges(false);
    localStorage.setItem("onboardingComplete", "true");
  };

  // Navigation guard — check for unsaved changes before leaving
  const tryNavigate = useCallback((action) => {
    if (hasChanges) {
      setPendingNavAction(() => action);
      setShowUnsavedModal(true);
    } else {
      action();
    }
  }, [hasChanges]);

  // Direct save (skip modal) after first publish
  const handleDirectSave = () => {
    if (!hasChanges) return;
    localStorage.setItem("editorHasChanges", "false");
    localStorage.setItem("lastPublishedAt", new Date().toISOString());
    setHasChanges(false);
  };

  // Map editor page to its review action ID
  const getReviewActionId = (page) => {
    if (page === "accueil") return "review-home";
    if (page?.startsWith("specialite-")) return `review-spec-${page.replace("specialite-", "")}`;
    if (page === "blog") return "review-blog";
    if (page === "mentions") return "review-mentions";
    return null;
  };

  const isDomainConnected = completedActions.includes("domain");
  const currentReviewId = getReviewActionId(currentPage);
  const isCurrentPageValidated = currentReviewId && completedActions.includes(currentReviewId);

  const handlePublishClick = () => {
    if (isDomainConnected) {
      // Domain connected → real publish/save flow
      if (isSitePublished) {
        handleDirectSave();
      } else {
        handlePublishComplete();
      }
    } else {
      // No domain → validate current page's review action then go back to dashboard
      if (currentReviewId && !completedActions.includes(currentReviewId)) {
        const existing = JSON.parse(localStorage.getItem("completedActions") || "[]");
        if (!existing.includes(currentReviewId)) {
          existing.push(currentReviewId);
          localStorage.setItem("completedActions", JSON.stringify(existing));
          setCompletedActions(existing);
          window.dispatchEvent(new Event("actionsUpdated"));
        }
      }
      onBackToDashboard();
    }
  };

  // Click handlers for canvas elements
  const handleRatingBadgeClick = () => {
    setShowRatingBadgeModal(true);
  };

  const handlePatientsBadgeClick = () => {
    setShowPatientsBadgeModal(true);
  };

  const handleLocationClick = (locationId) => {
    if (locationId) {
      const location = locations.find(l => l.id === locationId);
      setSelectedLocation(location || null);
    } else {
      setSelectedLocation(null);
    }
    setShowLocationModal(true);
  };

  const handleReviewClick = (reviewId) => {
    const review = reviews.find(r => r.id === reviewId);
    setSelectedReview(review || null);
    setShowReviewModal(true);
  };

  const handleReviewsClick = () => {
    setSelectedReview(null);
    setShowReviewModal(true);
  };

  const handleSaveRatingBadge = (badge) => {
    pushHistory();
    setRatingBadge(badge);
  };

  const handleSavePatientsBadge = (badge) => {
    pushHistory();
    setPatientsBadge(badge);
  };

  const handleSaveLocation = (location) => {
    pushHistory();
    if (selectedLocation) {
      setLocations(prev => prev.map(l => l.id === location.id ? location : l));
    } else {
      setLocations(prev => [...prev, location]);
    }
  };

  const handleDeleteLocation = (id) => {
    pushHistory();
    setLocations(prev => prev.filter(l => l.id !== id));
  };

  const handleSaveReview = (review) => {
    pushHistory();
    if (selectedReview) {
      setReviews(prev => prev.map(r =>
        r.id === review.id
          ? { ...r, name: review.name, rating: review.rating, date: review.date, text: review.text }
          : r
      ));
    } else {
      setReviews(prev => [...prev, {
        id: review.id,
        name: review.name,
        rating: review.rating,
        date: review.date,
        text: review.text,
        source: "manual",
        isVisible: true
      }]);
    }
  };

  const handleDeleteReview = (id) => {
    pushHistory();
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  const handleReviewToggleVisibility = (reviewId) => {
    pushHistory();
    setReviews(prev => prev.map(r =>
      r.id === reviewId ? { ...r, isVisible: !r.isVisible } : r
    ));
  };

  const handleAboutSectionClick = () => {
    setShowTherapistConfirm(true);
  };

  // Hero image handlers
  const handleHeroImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        pushHistory();
        setHeroImage(dataUrl);
        setHeroImageOriginal(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeroImageCrop = () => {
    setCropTarget("hero");
    setShowCropModal(true);
  };

  const handleHeroImagePosition = () => {
    setPositionTarget("hero");
    setShowPositionModal(true);
  };

  // About/therapist image handlers
  const handleTherapistImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        pushHistory();
        setAboutImage(dataUrl);
        setAboutImageOriginal(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTherapistImageCrop = () => {
    setCropTarget("about");
    setShowCropModal(true);
  };

  const handleTherapistImagePosition = () => {
    setPositionTarget("about");
    setShowPositionModal(true);
  };

  // Logo handler
  const handleLogoClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result;
          pushHistory();
          setIdentitySettings(prev => ({ ...prev, logo: dataUrl }));
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleImageChange = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result;
      if (pendingImageTarget === "hero") {
        pushHistory();
        setHeroImage(dataUrl);
        setHeroImageOriginal(dataUrl);
      } else if (pendingImageTarget === "about") {
        pushHistory();
        setAboutImage(dataUrl);
        setAboutImageOriginal(dataUrl);
      }
      setPendingImageTarget(null);
      setActiveEditId(null);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedDataUrl) => {
    pushHistory();
    if (cropTarget === "hero") {
      setHeroImage(croppedDataUrl);
    } else if (cropTarget === "about") {
      setAboutImage(croppedDataUrl);
    }
    setShowCropModal(false);
    setCropTarget(null);
  };

  // Get current palette and typography for EditorCanvas
  const currentPalette = colorPalettes.find(p => p.id === styleSettings.palette) || colorPalettes[0];
  const currentTypography = typographyPairs.find(t => t.id === styleSettings.typography) || typographyPairs[0];
  const currentRadius = radiusOptions.find(r => r.id === styleSettings.radius) || radiusOptions[0];

  return (
    <div className="h-screen bg-gray-50 overflow-hidden flex flex-col items-center" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      {/* Top nav bar */}
      <nav className="w-full max-w-[1200px] px-6 pt-4 pb-1 shrink-0 z-[70]">
        <div className="flex items-center justify-between relative h-10">
          {/* Logo */}
          <img src={theralysLogo} alt="Theralys" className="h-6 cursor-pointer" onClick={() => tryNavigate(() => onBackToDashboard())} />

          {/* Center nav — floating pill */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-white border border-gray-200 rounded-2xl p-1 gap-0.5">
            <button onClick={() => tryNavigate(() => onBackToDashboard('accueil'))} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[13px] whitespace-nowrap text-gray-400 hover:text-color-1 hover:bg-gray-50 transition-colors cursor-pointer">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
              Accueil
            </button>
            <button onClick={() => tryNavigate(() => onBackToDashboard('referencement'))} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[13px] whitespace-nowrap text-gray-400 hover:text-color-1 hover:bg-gray-50 transition-colors cursor-pointer">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Référencement
            </button>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-color-1 text-white text-[13px] whitespace-nowrap font-medium cursor-pointer transition-colors">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Site
            </button>
            <button onClick={() => tryNavigate(() => onGoToSetup('contact'))} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[13px] whitespace-nowrap text-gray-400 hover:text-color-1 hover:bg-gray-50 transition-colors cursor-pointer">
              Options du site
            </button>
            <div className="w-px h-5 bg-gray-200 mx-0.5" />
            <button onClick={() => tryNavigate(() => onBackToDashboard('parrainage'))} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[13px] whitespace-nowrap text-gray-400 hover:text-color-1 hover:bg-gray-50 transition-colors cursor-pointer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
              Parrainage
            </button>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open('https://theralys-web.fr/', '_blank')}
              className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-full shadow-sm border border-gray-200 text-sm font-medium text-gray-600 hover:shadow-md transition-all cursor-pointer"
            >
              <Link2 size={14} />
              Voir le site
            </button>
            <button
              onClick={handlePublishClick}
              disabled={isDomainConnected ? (isSitePublished && !hasChanges) : isCurrentPageValidated}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full shadow-sm text-sm font-semibold transition-all ${
                (isDomainConnected ? (isSitePublished && !hasChanges) : isCurrentPageValidated)
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-color-2 text-white hover:opacity-90 cursor-pointer'
              }`}
            >
              <Rocket size={15} />
              {isDomainConnected
                ? (isSitePublished && hasChanges ? 'Sauvegarder' : isSitePublished ? 'Publié' : 'Publier')
                : (isCurrentPageValidated ? 'Validé' : 'Valider la page')
              }
            </button>
          </div>
        </div>
      </nav>

      {/* Canvas with site preview */}
      <div
        ref={canvasRef}
        className="flex-1 overflow-auto flex justify-center items-start px-6 py-4 w-full max-w-[1200px]"
        style={{
          animation: 'tab-fade-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          "--page-bg": currentPalette.background,
          "--page-hero-bg": currentPalette.heroBg,
          "--page-text": currentPalette.text,
          "--page-text-muted": currentPalette.textMuted,
          "--page-accent": currentPalette.accent,
          "--page-accent-dark": currentPalette.accentDark,
          "--page-font-display": `"${currentTypography.display}", serif`,
          "--page-font-body": `"${currentTypography.body}", sans-serif`,
          "--page-radius": currentRadius.value,
        }}
        onMouseDown={(e) => {
          if (e.button !== 0) return;
          const target = e.target;

          // For contentEditable elements, explicitly focus and set cursor
          const clickedContentEditable = target.closest('[contenteditable="true"]');
          if (clickedContentEditable) {
            const proofreadElement = target.closest("[data-proofread-id]");
            if (proofreadElement) {
              const elementId = proofreadElement.getAttribute("data-proofread-id");
              if (elementId) {
                // Set active ID immediately to show hover state
                setActiveEditId(elementId);

                // Ensure element is focused
                if (document.activeElement !== clickedContentEditable) {
                  clickedContentEditable.focus();
                }
              }
            }
            return;
          }

          const proofreadElement = target.closest("[data-proofread-id]");
          if (proofreadElement) {
            const elementId = proofreadElement.getAttribute("data-proofread-id");
            if (elementId) {
              e.preventDefault();
              setActiveEditId(elementId);
            }
          } else {
            // Click outside any editable element: deselect
            setActiveEditId(null);
          }
        }}
      >
        {/* ——— Specialty page template ——— */}
        {currentPage.startsWith("specialite-") && (() => {
          const specId = currentPage.replace("specialite-", "");
          const spec = painTypes.find(p => p.id === specId);
          if (!spec) return null;
          const profName = [globalSettings.firstName, globalSettings.lastName].filter(Boolean).join(' ') || 'Votre praticien';
          const city = globalSettings.city || 'votre ville';
          const profession = globalSettings.profession || 'Ostéopathe';
          return (
            <main className={cn("bg-white overflow-hidden mx-auto", viewMode === "mobile" ? "w-[375px] rounded-2xl shadow-lg border border-gray-300" : "w-full max-w-6xl rounded-2xl border-2 border-gray-200")} style={{ background: 'var(--page-bg, #fff)' }}>
              {/* Hero */}
              <div className="relative overflow-hidden" style={{ background: 'var(--page-hero-bg, #f8f6f3)' }}>
                <div className={cn("mx-auto", viewMode === "mobile" ? "px-5 py-10" : "px-16 py-20 max-w-5xl")}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-3xl">{spec.icon}</span>
                    <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--page-accent, #b8860b)', fontFamily: 'var(--page-font-body)' }}>{profession} · {city}</span>
                  </div>
                  <h1 className={cn("font-bold leading-tight", viewMode === "mobile" ? "text-2xl" : "text-4xl")} style={{ color: 'var(--page-text, #1a1a1a)', fontFamily: 'var(--page-font-display)' }}>{spec.title}</h1>
                  <p className={cn("mt-3 leading-relaxed", viewMode === "mobile" ? "text-sm" : "text-lg")} style={{ color: 'var(--page-text-muted, #666)', fontFamily: 'var(--page-font-body)' }}>{spec.desc}</p>
                  <button className={cn("mt-6 font-medium text-white", viewMode === "mobile" ? "px-5 py-2.5 text-sm" : "px-8 py-3 text-base")} style={{ background: 'var(--page-accent, #b8860b)', borderRadius: 'var(--page-radius, 12px)' }}>Prendre Rendez-Vous</button>
                </div>
              </div>

              {/* Content section */}
              <div className={cn("mx-auto", viewMode === "mobile" ? "px-5 py-8" : "px-16 py-14 max-w-5xl")}>
                <h2 className={cn("font-semibold mb-4", viewMode === "mobile" ? "text-lg" : "text-2xl")} style={{ color: 'var(--page-text, #1a1a1a)', fontFamily: 'var(--page-font-display)' }}>Pourquoi consulter pour {spec.title.toLowerCase()} ?</h2>
                <div className="space-y-3" style={{ color: 'var(--page-text-muted, #666)', fontFamily: 'var(--page-font-body)' }}>
                  <p className={viewMode === "mobile" ? "text-xs leading-relaxed" : "text-sm leading-relaxed"}>Les patients souffrant de {spec.title.toLowerCase()} trouvent souvent un soulagement durable grâce à une approche ostéopathique adaptée. En identifiant les causes profondes de vos douleurs, nous pouvons élaborer un plan de traitement personnalisé.</p>
                  <p className={viewMode === "mobile" ? "text-xs leading-relaxed" : "text-sm leading-relaxed"}>Chaque séance est pensée pour répondre à vos besoins spécifiques, en combinant des techniques manuelles douces et des conseils pratiques pour améliorer votre quotidien.</p>
                </div>

                {/* Benefits grid */}
                <div className={cn("mt-8 grid gap-4", viewMode === "mobile" ? "grid-cols-1" : "grid-cols-3")}>
                  {[
                    { icon: '🎯', title: 'Diagnostic précis', desc: 'Bilan complet pour identifier l\'origine de vos douleurs' },
                    { icon: '🤲', title: 'Techniques douces', desc: 'Manipulations adaptées à votre condition et sensibilité' },
                    { icon: '📋', title: 'Suivi personnalisé', desc: 'Conseils et exercices pour prolonger les bienfaits' },
                  ].map((b, i) => (
                    <div key={i} className="p-4 rounded-xl" style={{ background: 'var(--page-hero-bg, #f8f6f3)' }}>
                      <span className="text-xl">{b.icon}</span>
                      <h3 className="font-medium mt-2 text-sm" style={{ color: 'var(--page-text, #1a1a1a)', fontFamily: 'var(--page-font-display)' }}>{b.title}</h3>
                      <p className="text-xs mt-1" style={{ color: 'var(--page-text-muted, #666)', fontFamily: 'var(--page-font-body)' }}>{b.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related articles */}
              <div className={cn("mx-auto border-t", viewMode === "mobile" ? "px-5 py-8" : "px-16 py-14 max-w-5xl")} style={{ borderColor: 'var(--page-hero-bg, #eee)' }}>
                <h2 className={cn("font-semibold mb-5", viewMode === "mobile" ? "text-lg" : "text-2xl")} style={{ color: 'var(--page-text, #1a1a1a)', fontFamily: 'var(--page-font-display)' }}>Articles liés</h2>
                <div className={cn("grid gap-4", viewMode === "mobile" ? "grid-cols-1" : "grid-cols-2")}>
                  {[
                    { title: `${spec.title} : comprendre et soulager`, date: '15 Fév 2026' },
                    { title: `5 exercices pour prévenir les ${spec.title.toLowerCase()}`, date: '8 Fév 2026' },
                  ].map((a, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-xl" style={{ background: 'var(--page-hero-bg, #f8f6f3)' }}>
                      <div className="w-16 h-16 rounded-lg bg-gray-200 shrink-0 flex items-center justify-center text-2xl">{spec.icon}</div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate" style={{ color: 'var(--page-text, #1a1a1a)', fontFamily: 'var(--page-font-body)' }}>{a.title}</p>
                        <p className="text-[10px] mt-1" style={{ color: 'var(--page-text-muted, #999)' }}>{a.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA footer */}
              <div className={cn("text-center", viewMode === "mobile" ? "px-5 py-8" : "px-16 py-12")} style={{ background: 'var(--page-hero-bg, #f8f6f3)' }}>
                <h2 className={cn("font-semibold", viewMode === "mobile" ? "text-lg" : "text-2xl")} style={{ color: 'var(--page-text, #1a1a1a)', fontFamily: 'var(--page-font-display)' }}>Besoin d'un rendez-vous ?</h2>
                <p className="text-sm mt-2" style={{ color: 'var(--page-text-muted, #666)', fontFamily: 'var(--page-font-body)' }}>{profName}, {profession} à {city}</p>
                <button className={cn("mt-5 font-medium text-white", viewMode === "mobile" ? "px-5 py-2.5 text-sm" : "px-8 py-3 text-base")} style={{ background: 'var(--page-accent, #b8860b)', borderRadius: 'var(--page-radius, 12px)' }}>Prendre Rendez-Vous</button>
              </div>
            </main>
          );
        })()}

        {/* ——— Blog page template ——— */}
        {currentPage === "blog" && (() => {
          const profName = [globalSettings.firstName, globalSettings.lastName].filter(Boolean).join(' ') || 'Votre praticien';
          const city = globalSettings.city || 'votre ville';
          const profession = globalSettings.profession || 'Ostéopathe';
          const blogArticles = painTypes.slice(0, 6).flatMap((spec, si) => [
            { id: `${spec.id}-1`, icon: spec.icon, category: spec.title, title: `${spec.title} : comprendre les causes et traitements`, date: '15 Fév 2026', readTime: '5 min', excerpt: `Découvrez comment l'ostéopathie peut vous aider à soulager les ${spec.title.toLowerCase()} de manière naturelle et durable.` },
            ...(si < 3 ? [{ id: `${spec.id}-2`, icon: spec.icon, category: spec.title, title: `Exercices et conseils pour ${spec.title.toLowerCase()}`, date: '8 Fév 2026', readTime: '4 min', excerpt: `Des exercices pratiques recommandés par votre ${profession.toLowerCase()} pour prévenir et soulager.` }] : []),
          ]);
          return (
            <main className={cn("bg-white overflow-hidden mx-auto", viewMode === "mobile" ? "w-[375px] rounded-2xl shadow-lg border border-gray-300" : "w-full max-w-6xl rounded-2xl border-2 border-gray-200")} style={{ background: 'var(--page-bg, #fff)' }}>
              {/* Hero */}
              <div className={cn("mx-auto", viewMode === "mobile" ? "px-5 pt-8 pb-6" : "px-16 pt-14 pb-10 max-w-5xl")}>
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--page-accent, #b8860b)', fontFamily: 'var(--page-font-body)' }}>{profession} · {city}</span>
                <h1 className={cn("font-bold mt-2", viewMode === "mobile" ? "text-2xl" : "text-4xl")} style={{ color: 'var(--page-text, #1a1a1a)', fontFamily: 'var(--page-font-display)' }}>Blog & Conseils Santé</h1>
                <p className={cn("mt-2", viewMode === "mobile" ? "text-xs" : "text-base")} style={{ color: 'var(--page-text-muted, #666)', fontFamily: 'var(--page-font-body)' }}>Articles et conseils de {profName} pour votre bien-être au quotidien</p>
              </div>

              {/* Category pills */}
              <div className={cn("mx-auto flex flex-wrap gap-2", viewMode === "mobile" ? "px-5 pb-5" : "px-16 pb-8 max-w-5xl")}>
                <span className="px-3 py-1 text-xs font-medium rounded-full text-white" style={{ background: 'var(--page-accent, #b8860b)' }}>Tous</span>
                {painTypes.slice(0, 4).map(s => (
                  <span key={s.id} className="px-3 py-1 text-xs font-medium rounded-full" style={{ background: 'var(--page-hero-bg, #f5f5f5)', color: 'var(--page-text-muted, #666)' }}>{s.icon} {s.title}</span>
                ))}
              </div>

              {/* Featured article */}
              {blogArticles[0] && (
                <div className={cn("mx-auto", viewMode === "mobile" ? "px-5 pb-6" : "px-16 pb-10 max-w-5xl")}>
                  <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--page-hero-bg, #f8f6f3)' }}>
                    <div className={cn(viewMode === "mobile" ? "p-5" : "p-8")}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-full" style={{ background: 'var(--page-accent, #b8860b)', color: '#fff' }}>{blogArticles[0].category}</span>
                        <span className="text-[10px]" style={{ color: 'var(--page-text-muted, #999)' }}>{blogArticles[0].date} · {blogArticles[0].readTime}</span>
                      </div>
                      <h2 className={cn("font-semibold", viewMode === "mobile" ? "text-base" : "text-xl")} style={{ color: 'var(--page-text, #1a1a1a)', fontFamily: 'var(--page-font-display)' }}>{blogArticles[0].title}</h2>
                      <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--page-text-muted, #666)', fontFamily: 'var(--page-font-body)' }}>{blogArticles[0].excerpt}</p>
                      <button className="mt-4 text-xs font-medium" style={{ color: 'var(--page-accent, #b8860b)' }}>Lire l'article →</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Article grid */}
              <div className={cn("mx-auto", viewMode === "mobile" ? "px-5 pb-8" : "px-16 pb-14 max-w-5xl")}>
                <div className={cn("grid gap-4", viewMode === "mobile" ? "grid-cols-1" : "grid-cols-3")}>
                  {blogArticles.slice(1, 7).map(a => (
                    <div key={a.id} className="rounded-xl overflow-hidden" style={{ background: 'var(--page-hero-bg, #f8f6f3)' }}>
                      <div className="h-24 flex items-center justify-center bg-gray-100 text-3xl">{a.icon}</div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-medium" style={{ color: 'var(--page-accent, #b8860b)' }}>{a.category}</span>
                          <span className="text-[10px]" style={{ color: 'var(--page-text-muted, #bbb)' }}>·</span>
                          <span className="text-[10px]" style={{ color: 'var(--page-text-muted, #999)' }}>{a.readTime}</span>
                        </div>
                        <h3 className="text-xs font-medium leading-snug" style={{ color: 'var(--page-text, #1a1a1a)', fontFamily: 'var(--page-font-display)' }}>{a.title}</h3>
                        <p className="text-[10px] mt-1.5 leading-relaxed line-clamp-2" style={{ color: 'var(--page-text-muted, #666)', fontFamily: 'var(--page-font-body)' }}>{a.excerpt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA footer */}
              <div className={cn("text-center", viewMode === "mobile" ? "px-5 py-8" : "px-16 py-12")} style={{ background: 'var(--page-hero-bg, #f8f6f3)' }}>
                <h2 className={cn("font-semibold", viewMode === "mobile" ? "text-lg" : "text-2xl")} style={{ color: 'var(--page-text, #1a1a1a)', fontFamily: 'var(--page-font-display)' }}>Une question ? Prenez rendez-vous</h2>
                <p className="text-sm mt-2" style={{ color: 'var(--page-text-muted, #666)', fontFamily: 'var(--page-font-body)' }}>{profName}, {profession} à {city}</p>
                <button className={cn("mt-5 font-medium text-white", viewMode === "mobile" ? "px-5 py-2.5 text-sm" : "px-8 py-3 text-base")} style={{ background: 'var(--page-accent, #b8860b)', borderRadius: 'var(--page-radius, 12px)' }}>Prendre Rendez-Vous</button>
              </div>
            </main>
          );
        })()}

        {currentPage === "accueil" && (
          <EditorCanvas
            content={content}
            onContentChange={(field, value) => setContent(prev => ({ ...prev, [field]: value }))}
            viewMode={viewMode}
            canvasOpacity={canvasOpacity}
            isMobileDevice={isMobileDevice}
            isPreviewMode={false}
            locations={locations}
            ratingBadge={ratingBadge}
            patientsBadge={patientsBadge}
            features={features}
            painTypes={painTypes}
            sessionSteps={sessionSteps}
            faqItems={faqItems}
            globalSettings={globalSettings}
            heroImage={heroImage}
            aboutImage={aboutImage}
            logo={identitySettings.logo}
            sessionInfo={sessionInfo}
            reviews={reviews.length > 0 ? reviews.map(r => ({ id: r.id, name: r.name, rating: r.rating, date: r.date, text: r.text, hidden: !r.isVisible })) : undefined}
            isGoogleConnected={isGoogleConnected}
            googleProfileName={googleProfileName}
            googleProfilePhoto={googleProfilePhoto}
            onFeatureClick={(id) => id && handleProofreadingElementClick(`feature-${features.findIndex(f => f.id === id)}`)}
            onPainTypeClick={() => setShowSpecialtyConfirm(true)}
            onSessionStepClick={(id) => id && handleProofreadingElementClick(`step-${sessionSteps.findIndex(s => s.id === id)}`)}
            onFAQClick={(id) => id && handleProofreadingElementClick(`faq-${faqItems.findIndex(f => f.id === id)}`)}
            onCTAClick={() => handleProofreadingElementClick("hero-cta-primary")}
            onGlobalSettingsClick={() => handleProofreadingElementClick("hero-name")}
            onSessionInfoClick={() => handleProofreadingElementClick("session-duration")}
            onLocationClick={handleLocationClick}
            onRatingClick={handleRatingBadgeClick}
            onPatientsClick={handlePatientsBadgeClick}
            onAboutSectionClick={handleAboutSectionClick}
            onHeroImageUpload={handleHeroImageUpload}
            onHeroImageCrop={handleHeroImageCrop}
            onHeroImagePosition={handleHeroImagePosition}
            heroImagePosition={heroImagePosition}
            onTherapistImageUpload={handleTherapistImageUpload}
            onTherapistImageCrop={handleTherapistImageCrop}
            onTherapistImagePosition={handleTherapistImagePosition}
            therapistImagePosition={aboutImagePosition}
            onLogoClick={handleLogoClick}
            isProofreadingActive={true}
            proofreadingElementId={activeEditId || undefined}
            elementStatuses={{}}
            onInlineTextChange={(_, field, newValue) => {
              pushHistory();
              if (field.startsWith("content.")) {
                const contentField = field.replace("content.", "");
                setContent(prev => ({ ...prev, [contentField]: newValue }));
              } else if (field.startsWith("globalSettings.")) {
                const settingsField = field.replace("globalSettings.", "");
                setGlobalSettings(prev => ({ ...prev, [settingsField]: newValue }));
              } else if (field.startsWith("sessionInfo.")) {
                const infoField = field.replace("sessionInfo.", "");
                setSessionInfo(prev => ({ ...prev, [infoField]: newValue }));
              } else if (field.match(/^features\[(\d+)\]\.(\w+)$/)) {
                const match = field.match(/^features\[(\d+)\]\.(\w+)$/);
                if (match) {
                  const [, indexStr, featField] = match;
                  const index = parseInt(indexStr);
                  setFeatures(prev => prev.map((f, i) => (i === index ? { ...f, [featField]: newValue } : f)));
                }
              } else if (field.match(/^painTypes\[(\d+)\]\.(\w+)$/)) {
                const match = field.match(/^painTypes\[(\d+)\]\.(\w+)$/);
                if (match) {
                  const [, indexStr, painField] = match;
                  const index = parseInt(indexStr);
                  setPainTypes(prev => prev.map((p, i) => (i === index ? { ...p, [painField]: newValue } : p)));
                }
              } else if (field.match(/^sessionSteps\[(\d+)\]\.(\w+)$/)) {
                const match = field.match(/^sessionSteps\[(\d+)\]\.(\w+)$/);
                if (match) {
                  const [, indexStr, stepField] = match;
                  const index = parseInt(indexStr);
                  setSessionSteps(prev => prev.map((s, i) => (i === index ? { ...s, [stepField]: newValue } : s)));
                }
              } else if (field.match(/^faqItems\[(\d+)\]\.(\w+)$/)) {
                const match = field.match(/^faqItems\[(\d+)\]\.(\w+)$/);
                if (match) {
                  const [, indexStr, faqField] = match;
                  const index = parseInt(indexStr);
                  setFAQItems(prev => prev.map((f, i) => (i === index ? { ...f, [faqField]: newValue } : f)));
                }
              }
            }}
          />
        )}
      </div>

      {/* Floating Edit Toolbar */}
      {activeEditId && (() => {
        // Determine icon state for toolbar
        const featureMatch = activeEditId.match(/^feature-(\d+)/);
        const specialtyMatch = activeEditId.match(/^specialty-(\d+)/);
        const stepMatch = activeEditId.match(/^step-(\d+)/);
        const isFaq = activeEditId.startsWith("faq-");

        let hasIcon = false;
        let currentIcon = "";
        let onIconChange = (_icon) => {};

        if (featureMatch) {
          const idx = parseInt(featureMatch[1]);
          hasIcon = true;
          currentIcon = features[idx]?.icon || "";
          onIconChange = (icon) => { pushHistory(); setFeatures(prev => prev.map((f, i) => i === idx ? { ...f, icon } : f)); };
        } else if (specialtyMatch) {
          const idx = parseInt(specialtyMatch[1]);
          hasIcon = true;
          currentIcon = painTypes[idx]?.icon || "";
          onIconChange = (icon) => { pushHistory(); setPainTypes(prev => prev.map((p, i) => i === idx ? { ...p, icon } : p)); };
        } else if (stepMatch) {
          // Steps have numbers, not icons — no icon picker
        } else if (activeEditId === "session-duration") {
          hasIcon = true;
          currentIcon = sessionInfo.durationIcon || "\u23F1\uFE0F";
          onIconChange = (icon) => { pushHistory(); setSessionInfo(prev => ({ ...prev, durationIcon: icon })); };
        } else if (activeEditId === "session-price") {
          hasIcon = true;
          currentIcon = sessionInfo.priceIcon || "\uD83D\uDCB0";
          onIconChange = (icon) => { pushHistory(); setSessionInfo(prev => ({ ...prev, priceIcon: icon })); };
        } else if (activeEditId === "session-reimbursement") {
          hasIcon = true;
          currentIcon = sessionInfo.reimbursementIcon || "\uD83D\uDEE1\uFE0F";
          onIconChange = (icon) => { pushHistory(); setSessionInfo(prev => ({ ...prev, reimbursementIcon: icon })); };
        }

        const isImage = activeEditId === "hero-image" || activeEditId === "about-image";

        return (
          <FloatingEditToolbar
            targetElementId={activeEditId}
            hasIcon={hasIcon}
            isImage={isImage}
            currentIcon={currentIcon}
            onIconChange={onIconChange}
            onImageChange={isImage ? () => {
              setPendingImageTarget(activeEditId === "hero-image" ? "hero" : "about");
              imageInputRef.current?.click();
            } : undefined}
            onImageCrop={isImage ? () => {
              setCropTarget(activeEditId === "hero-image" ? "hero" : "about");
              setShowCropModal(true);
            } : undefined}
            onBold={() => document.execCommand('bold')}
            onItalic={() => document.execCommand('italic')}
            onLink={() => {
              const selection = window.getSelection();
              const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
              const url = prompt('URL du lien :');
              if (url && range) {
                selection?.removeAllRanges();
                selection?.addRange(range);
                document.execCommand('createLink', false, url);
              }
            }}
            onAdd={isFaq ? () => {
              pushHistory();
              const newFaq = { id: `faq-${Date.now()}`, question: "Nouvelle question", answer: "" };
              setFAQItems(prev => [...prev, newFaq]);
              setActiveEditId(`faq-${faqItems.length}`);
            } : undefined}
            onDelete={isFaq && faqItems.length > 1 ? () => {
              const faqMatch = activeEditId.match(/^faq-(\d+)/);
              if (faqMatch) {
                const idx = parseInt(faqMatch[1]);
                pushHistory();
                setFAQItems(prev => prev.filter((_, i) => i !== idx));
                setActiveEditId(null);
              }
            } : undefined}
            onValidate={isMobileDevice ? () => setActiveEditId(null) : undefined}
          />
        );
      })()}

      {/* Publish Confirmation Modal */}
      {showPublishConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-4 text-center animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Prêt à publier ?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              As-tu confirmé tes informations et relu ton site ?
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={confirmPublish}
                className="w-full px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                Oui, publier mon site
              </button>
              <button
                onClick={() => setShowPublishConfirm(false)}
                className="w-full px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
              >
                Non, je dois encore le travailler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved Changes Modal */}
      {showUnsavedModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-4 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-2xl">{"\u270F\uFE0F"}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Modifications non publiées
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Vous avez des modifications qui n'ont pas été publiées.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  handleDirectSave();
                  setShowUnsavedModal(false);
                  if (pendingNavAction) pendingNavAction();
                  setPendingNavAction(null);
                }}
                className="w-full py-2.5 px-4 bg-color-2 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-colors cursor-pointer"
              >
                Publier les modifications
              </button>
              <button
                onClick={() => {
                  setHasChanges(false);
                  localStorage.setItem("editorHasChanges", "false");
                  setShowUnsavedModal(false);
                  if (pendingNavAction) pendingNavAction();
                  setPendingNavAction(null);
                }}
                className="w-full py-2.5 px-4 text-gray-600 text-sm font-medium hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
              >
                Ne pas publier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Specialty Confirmation Modal */}
      {showSpecialtyConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-4 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
              <span className="text-2xl">{"\uD83D\uDD0D"}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Modifier les spécialités
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Les spécialités sont un élément clé de votre référencement (SEO). Chaque spécialité génère une page dédiée qui aide vos patients à vous trouver sur Google. Les modifications se font depuis l'espace de configuration.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { setShowSpecialtyConfirm(false); onGoToSetup(); }}
                className="w-full py-2.5 px-4 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                Modifier mes spécialités
              </button>
              <button
                onClick={() => setShowSpecialtyConfirm(false)}
                className="w-full py-2.5 px-4 text-gray-600 text-sm font-medium hover:bg-gray-50 rounded-xl transition-colors"
              >
                Non, pas maintenant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Therapist Confirmation Modal */}
      {showTherapistConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-4 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-2xl">{"\uD83D\uDC64"}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Modifier le profil thérapeute
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Votre présentation personnelle est essentielle pour rassurer vos patients. Les modifications se font depuis l'espace de configuration.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { setShowTherapistConfirm(false); onGoToSetup(); }}
                className="w-full py-2.5 px-4 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                Modifier mon profil
              </button>
              <button
                onClick={() => setShowTherapistConfirm(false)}
                className="w-full py-2.5 px-4 text-gray-600 text-sm font-medium hover:bg-gray-50 rounded-xl transition-colors"
              >
                Non, pas maintenant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Crop Modal */}
      <ImageCropModal
        open={showCropModal}
        onOpenChange={(open) => { if (!open) { setShowCropModal(false); setCropTarget(null); } }}
        imageSrc={cropTarget === "hero" ? (heroImageOriginal || heroImage) : (aboutImageOriginal || aboutImage)}
        aspect={cropTarget === "hero" ? 16 / 9 : 4 / 3}
        onCropComplete={handleCropComplete}
      />

      {/* Image Position Modal */}
      <ImagePositionModal
        open={showPositionModal}
        onOpenChange={(open) => { if (!open) { setShowPositionModal(false); setPositionTarget(null); } }}
        imageSrc={positionTarget === "hero" ? heroImage : aboutImage}
        initialPosition={positionTarget === "hero" ? heroImagePosition : aboutImagePosition}
        onPositionComplete={(pos) => {
          pushHistory();
          if (positionTarget === "hero") {
            setHeroImagePosition(pos);
          } else {
            setAboutImagePosition(pos);
          }
          setShowPositionModal(false);
          setPositionTarget(null);
        }}
      />

      {/* Badge Modals */}
      <BadgeItemModal
        open={showRatingBadgeModal}
        onOpenChange={setShowRatingBadgeModal}
        badge={ratingBadge}
        onSave={handleSaveRatingBadge}
        title="Modifier le badge d'évaluation"
      />

      <BadgeItemModal
        open={showPatientsBadgeModal}
        onOpenChange={setShowPatientsBadgeModal}
        badge={patientsBadge}
        onSave={handleSavePatientsBadge}
        title="Modifier le badge de patients"
      />

      {/* Location Modal */}
      <LocationItemModal
        open={showLocationModal}
        onOpenChange={setShowLocationModal}
        location={selectedLocation}
        onSave={handleSaveLocation}
        onDelete={handleDeleteLocation}
        isNew={!selectedLocation}
      />

      {/* Review Modal */}
      <ReviewItemModal
        open={showReviewModal}
        onOpenChange={setShowReviewModal}
        review={selectedReview}
        onSave={handleSaveReview}
        onDelete={handleDeleteReview}
        isNew={!selectedReview}
      />

      {/* Style Panel - floating above toolbar */}
      {showStyleModal && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100]" data-style-panel>
          <StylePanel
            onClose={() => setShowStyleModal(false)}
            settings={styleSettings}
            onSettingsChange={setStyleSettings}
            logo={identitySettings.logo}
            onLogoChange={(logo) => setIdentitySettings(prev => ({ ...prev, logo }))}
            onComplete={!completedActions.includes("style") ? () => {
              const existing = JSON.parse(localStorage.getItem("completedActions") || "[]")
              if (!existing.includes("style")) {
                existing.push("style")
                localStorage.setItem("completedActions", JSON.stringify(existing))
                window.dispatchEvent(new Event("actionsUpdated"))
              }
              setShowStyleModal(false)
              onBackToDashboard()
            } : undefined}
          />
        </div>
      )}

      {/* Editor Toolbar - floating on top of content */}
      <EditorToolbar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isHomePublished={setupCompleted}
        specialties={painTypes.map(p => ({ id: p.id, icon: p.icon, title: p.title }))}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onStyleClick={() => setShowStyleModal(true)}
        onSettingsClick={() => tryNavigate(() => onGoToSetup())}
        isMobileDevice={typeof window !== "undefined" && window.innerWidth < 768}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onboardingLock={isOnboardingMode && !setupCompleted}
        onAccueilClick={() => tryNavigate(() => onBackToDashboard())}
        onPreviewClick={() => {}}
        onPublishClick={handlePublishClick}
      />

      {/* Hidden file input for image changes */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageChange(file);
          e.target.value = "";
        }}
      />

      {/* Dev reset button */}
      <button
        onClick={() => { if (confirm("Reset all editor data?")) { Object.keys(localStorage).filter(k => k.startsWith("editor_")).forEach(k => localStorage.removeItem(k)); location.reload(); } }}
        className="fixed bottom-2 left-2 z-[999] w-5 h-5 rounded-full bg-gray-300/50 hover:bg-red-400 transition-colors opacity-20 hover:opacity-100"
        title="Reset"
      />
    </div>
  );
};

// Wrap with ProofreadingProvider
const SiteEditor = ({ onGoToSetup, onBackToDashboard, initialOpenStyle }) => {
  return (
    <ProofreadingProvider>
      <SiteEditorContent onGoToSetup={onGoToSetup} onBackToDashboard={onBackToDashboard} initialOpenStyle={initialOpenStyle} />
    </ProofreadingProvider>
  );
};

export default SiteEditor;
