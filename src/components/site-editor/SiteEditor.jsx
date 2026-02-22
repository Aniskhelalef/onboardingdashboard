import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Link2, Rocket } from "lucide-react";
const theralysLogo = '/images/theralys-logo.svg';
import { cn } from "@/lib/utils";

const getDashboardPath = () =>
  typeof window !== 'undefined' && localStorage.getItem('preDashboardComplete') === 'true'
    ? '/dashboard' : '/pre-dashboard';
import EditorCanvas from "./EditorCanvas";
import FloatingEditToolbar from "./FloatingEditToolbar";
import { ProofreadingProvider, useProofreading } from "./ProofreadingContext";
import EditorToolbar from "./EditorToolbar";
import Setup from "./setup";
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

const SiteEditorContent = ({ initialOpenStyle, initialPage, initialValidationMode }) => {
  const router = useRouter();
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
    if (typeof window === 'undefined') return true;
    return localStorage.getItem("onboardingComplete") !== "true";
  });
  const [setupCompleted, setSetupCompleted] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [isSitePublished, setIsSitePublished] = useState(() => typeof window !== 'undefined' && localStorage.getItem("sitePublished") === "true");
  const [hasChanges, setHasChanges] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavAction, setPendingNavAction] = useState(null);
  const [showStyleModal, setShowStyleModal] = useState(!!initialOpenStyle);
  const [showSpecialtyConfirm, setShowSpecialtyConfirm] = useState(false);
  const [showTherapistConfirm, setShowTherapistConfirm] = useState(false);
  const [completedActions, setCompletedActions] = useState(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem("completedActions") || "[]"); } catch { return []; }
  });

  // Validation mode state
  const [isValidationMode, setIsValidationMode] = useState(!!initialValidationMode);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

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

  // Page navigation — derived from URL
  const currentPage = initialPage || "accueil";
  const goToEditorPage = (page) => router.push(`/editor/${page}${isValidationMode ? '?mode=validate' : ''}`);

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

  // Validation sequence (no blog) — must be after painTypes state
  const VALIDATION_SEQUENCE = ['accueil', ...painTypes.map(p => `specialite-${p.id}`), 'mentions'];
  const validationStepIndex = VALIDATION_SEQUENCE.indexOf(currentPage);
  const isLastValidationStep = validationStepIndex === VALIDATION_SEQUENCE.length - 1;

  // Auto-save editor data to localStorage
  const isFirstRender = useRef(true);
  const mountedAt = useRef(Date.now());
  useEffect(() => {
    const data = { content, features, painTypes, sessionSteps, faqItems, globalSettings, sessionInfo, identitySettings, styleSettings, legalContent, locations, heroImage, aboutImage, heroImageOriginal, aboutImageOriginal, ratingBadge, patientsBadge, heroImagePosition, aboutImagePosition };
    for (const [key, value] of Object.entries(data)) {
      saveTo(key, value);
    }
    // Mark changes after initial load — skip hydration renders (first 1s)
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else if (Date.now() - mountedAt.current < 1000) {
      // Skip — still hydrating from localStorage
    } else {
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

  // Track scroll position for validation mode — button unlocks at bottom
  useEffect(() => {
    const el = canvasRef.current;
    if (!el || !isValidationMode) { setHasScrolledToBottom(false); return; }
    setHasScrolledToBottom(false);
    const onScroll = () => {
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 40;
      if (atBottom) setHasScrolledToBottom(true);
    };
    // Check immediately in case content fits without scrolling
    requestAnimationFrame(() => {
      if (el.scrollHeight <= el.clientHeight + 40) setHasScrolledToBottom(true);
    });
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [isValidationMode, currentPage]);

  // Validation mode: auto-advance to first unvalidated page on mount
  useEffect(() => {
    if (!isValidationMode) return;
    const saved = JSON.parse(localStorage.getItem("completedActions") || "[]");
    const firstUnvalidated = VALIDATION_SEQUENCE.find(page => {
      const rid = page === 'accueil' ? 'review-home' : page === 'mentions' ? 'review-mentions' : `review-spec-${page.replace('specialite-', '')}`;
      return !saved.includes(rid);
    });
    if (!firstUnvalidated) {
      // All pages already validated — finish
      handleFinishValidation();
    } else if (firstUnvalidated !== currentPage) {
      router.replace(`/editor/${firstUnvalidated}?mode=validate`);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Check if all pages are validated and mark 'validate' action
  const checkAllPagesValidated = (actions) => {
    const requiredReviews = ['review-home', 'review-blog', 'review-mentions', ...painTypes.map(p => `review-spec-${p.id}`)]
    if (requiredReviews.every(id => actions.includes(id)) && !actions.includes('validate')) {
      actions.push('validate')
      localStorage.setItem('completedActions', JSON.stringify(actions))
      window.dispatchEvent(new Event('actionsUpdated'))
    }
  }

  const handleValidatePage = () => {
    if (currentReviewId && !completedActions.includes(currentReviewId)) {
      const existing = JSON.parse(localStorage.getItem("completedActions") || "[]");
      if (!existing.includes(currentReviewId)) {
        existing.push(currentReviewId);
        localStorage.setItem("completedActions", JSON.stringify(existing));
        setCompletedActions([...existing]);
        window.dispatchEvent(new Event("actionsUpdated"));
        checkAllPagesValidated([...existing]);
      }
    }
  }

  // Validation flow: validate current page then advance or show domain modal
  const handleValidationFlowValidate = () => {
    // Mark current page as validated
    const existing = JSON.parse(localStorage.getItem("completedActions") || "[]");
    if (currentReviewId && !existing.includes(currentReviewId)) {
      existing.push(currentReviewId);
      localStorage.setItem("completedActions", JSON.stringify(existing));
      setCompletedActions([...existing]);
      window.dispatchEvent(new Event("actionsUpdated"));
    }
    // If last step → show domain modal
    if (isLastValidationStep) {
      // Mark 'validate' as done
      if (!existing.includes('validate')) {
        existing.push('validate');
        localStorage.setItem("completedActions", JSON.stringify(existing));
        window.dispatchEvent(new Event("actionsUpdated"));
      }
      handleFinishValidation();
    } else {
      // Advance to next page
      const nextPage = VALIDATION_SEQUENCE[validationStepIndex + 1];
      router.push(`/editor/${nextPage}?mode=validate`);
    }
  };

  // Finish validation flow → mark validate+publish done, go to pre-dashboard
  const handleFinishValidation = () => {
    const existing = JSON.parse(localStorage.getItem("completedActions") || "[]");
    if (!existing.includes('validate')) existing.push('validate');
    if (!existing.includes('publish')) existing.push('publish');
    localStorage.setItem("completedActions", JSON.stringify(existing));
    localStorage.setItem("sitePublished", "true");
    setCompletedActions([...existing]);
    setIsSitePublished(true);
    window.dispatchEvent(new Event("actionsUpdated"));
    setIsValidationMode(false);
    router.push('/pre-dashboard');
  };

  const handlePublishClick = () => {
    if (isDomainConnected) {
      // Domain connected → real publish/save flow
      if (isSitePublished) {
        handleDirectSave();
      } else {
        handlePublishComplete();
      }
    } else {
      // No domain → validate current page's review action and stay on page
      if (currentReviewId && !completedActions.includes(currentReviewId)) {
        const existing = JSON.parse(localStorage.getItem("completedActions") || "[]");
        if (!existing.includes(currentReviewId)) {
          existing.push(currentReviewId);
          localStorage.setItem("completedActions", JSON.stringify(existing));
          setCompletedActions([...existing]);
          window.dispatchEvent(new Event("actionsUpdated"));
          checkAllPagesValidated([...existing]);
        }
      }
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
      {isValidationMode && (
        <div className="w-full max-w-[1200px] px-6 pt-4 pb-1 shrink-0 z-[70] flex items-center justify-center">
          <div className="flex items-center bg-white border border-gray-200 rounded-2xl px-4 py-2 gap-2.5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-1">
              {VALIDATION_SEQUENCE.map((page, i) => {
                const rid = page === 'accueil' ? 'review-home' : page === 'mentions' ? 'review-mentions' : `review-spec-${page.replace('specialite-', '')}`;
                const done = completedActions.includes(rid);
                const isCurrent = i === validationStepIndex;
                return (
                  <div
                    key={page}
                    className={cn(
                      "w-2.5 h-2.5 rounded-full transition-colors",
                      done ? "bg-green-500" : isCurrent ? "bg-color-2" : "bg-gray-200"
                    )}
                  />
                );
              })}
            </div>
            <span className="text-sm text-gray-400 font-medium">{VALIDATION_SEQUENCE.filter(p => { const rid = p === 'accueil' ? 'review-home' : p === 'mentions' ? 'review-mentions' : `review-spec-${p.replace('specialite-', '')}`; return completedActions.includes(rid); }).length}/{VALIDATION_SEQUENCE.length}</span>
            <div className="w-px h-4 bg-gray-200" />
            <span className="text-sm font-semibold text-color-1">
              {currentPage === 'accueil' ? 'Accueil' : currentPage === 'mentions' ? 'Mentions légales' : painTypes.find(p => currentPage === `specialite-${p.id}`)?.title || 'Page'}
            </span>
          </div>
        </div>
      )}
      {!isValidationMode && <div className="w-full max-w-[1200px] px-6 pt-4 pb-1 shrink-0 z-[70]">
        <div className="flex items-center justify-between">
          <button
            onClick={() => tryNavigate(() => router.push(getDashboardPath()))}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-color-1 transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Retourner à l'accueil
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open('https://theralys-web.fr/', '_blank')}
              title="Voir ma page"
              className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-color-1 hover:border-gray-300 transition-all cursor-pointer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button
              onClick={() => setShowSettingsModal(true)}
              title="Options du site"
              className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-color-1 hover:border-gray-300 transition-all cursor-pointer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </button>
            <button
              onClick={handleDirectSave}
              disabled={!hasChanges}
              className={cn(
                "flex items-center gap-1.5 px-4 h-9 rounded-xl text-[13px] font-semibold transition-all",
                hasChanges
                  ? "bg-color-2 text-white hover:opacity-90 cursor-pointer"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
            >
              Publish
            </button>
          </div>
        </div>
      </div>}

      {/* Canvas with site preview */}
      <div
        ref={canvasRef}
        className="flex-1 overflow-auto flex justify-center items-start px-6 py-4 w-full max-w-[1200px]"
        style={{
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
          const otherSpecs = painTypes.filter(p => p.id !== specId).slice(0, 3);
          return (
            <div className={cn(
              "bg-[hsl(var(--page-bg))] overflow-auto transition-all duration-500 ease-out scrollbar-hide scroll-smooth relative",
              "rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2),0_10px_25px_-10px_rgba(0,0,0,0.1)]",
              viewMode === "desktop" ? "w-full max-w-6xl max-h-[80vh]" : "w-[375px] max-h-[80vh]"
            )}>
              {/* Navigation */}
              <nav className={cn("bg-[hsl(var(--page-hero-bg))] py-4 flex items-center justify-between sticky top-0 z-30", viewMode === "mobile" ? "px-5" : "px-8")}>
                <div className="flex items-center gap-3">
                  {identitySettings.logo && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-[hsl(var(--page-bg))] border border-[hsl(var(--page-text))]/10 flex items-center justify-center">
                      <img src={identitySettings.logo} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div className="font-display text-xl font-semibold text-[hsl(var(--page-text))] max-w-[200px]">
                    <span className="block truncate">{globalSettings.firstName || <span className="opacity-40">Prénom</span>}</span>
                    <span className="block truncate">{globalSettings.lastName || <span className="opacity-40">Nom</span>}</span>
                  </div>
                </div>
                {viewMode === "desktop" && (
                  <div className="flex items-center gap-6">
                    <span className="text-sm text-[hsl(var(--page-accent))] font-medium">{spec.icon} {spec.title}</span>
                    <button className="bg-[hsl(var(--page-accent-dark))] text-white px-5 py-2.5 text-sm font-medium" style={{ borderRadius: 'var(--page-radius, 9999px)' }}>Prendre Rendez-Vous</button>
                  </div>
                )}
              </nav>

              {/* Hero Section */}
              <div className="bg-[hsl(var(--page-hero-bg))] relative">
                <div className={cn("flex", viewMode === "mobile" ? "flex-col" : "flex-row")}>
                  {/* Left Content */}
                  <div className={cn("flex flex-col justify-center", viewMode === "desktop" ? "w-1/2 p-8 py-12" : "w-full p-5")}>
                    <span className="self-start inline-flex mb-6 border border-[hsl(var(--page-accent))] text-[hsl(var(--page-accent))] px-4 py-1.5 text-sm" style={{ borderRadius: 'var(--page-radius, 9999px)' }}>
                      {spec.icon} {profession} à {city}
                    </span>
                    <h1 className={cn("font-display font-bold text-[hsl(var(--page-text))] leading-tight mb-4", viewMode === "mobile" ? "text-3xl" : "text-4xl md:text-5xl")}>{spec.title}</h1>
                    <p className="text-[hsl(var(--page-text-muted))] mb-8 max-w-md">{spec.desc}</p>
                    <div className={cn("flex gap-3 mb-8", viewMode === "mobile" ? "flex-col items-start" : "items-center gap-4")}>
                      <button className="bg-[hsl(var(--page-accent))] text-white px-6 py-3 text-sm font-medium" style={{ borderRadius: 'var(--page-radius, 9999px)' }}>Prendre Rendez-Vous</button>
                      <button className="border border-[hsl(var(--page-text))] text-[hsl(var(--page-text))] px-6 py-3 text-sm font-medium" style={{ borderRadius: 'var(--page-radius, 9999px)' }}>{globalSettings.phoneNumber || '06 00 00 00 00'}</button>
                    </div>
                    {/* Decorative dots */}
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: viewMode === "mobile" ? 15 : 30 }).map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--page-accent))]/40" />
                      ))}
                    </div>
                  </div>
                  {/* Right Image */}
                  <div className={cn("relative", viewMode === "desktop" ? "w-1/2 min-h-[400px]" : "w-full aspect-video")}>
                    <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop" alt={spec.title} className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                </div>
              </div>

              {/* Why consult section */}
              <div className={cn("py-12 text-center", viewMode === "mobile" ? "px-5" : "px-8")}>
                <h2 className={cn("font-display font-bold text-[hsl(var(--page-text))] mb-4", viewMode === "mobile" ? "text-2xl" : "text-3xl")}>Pourquoi consulter pour {spec.title.toLowerCase()} ?</h2>
                <p className="text-[hsl(var(--page-text-muted))] mb-8 max-w-2xl mx-auto">Des techniques manuelles adaptées pour soulager durablement vos douleurs</p>
                <div className={cn("grid gap-4 text-left", viewMode === "desktop" ? "grid-cols-3" : "grid-cols-1")}>
                  {[
                    { icon: '🎯', title: 'Diagnostic précis', desc: 'Bilan complet pour identifier l\'origine de vos douleurs et élaborer un plan de traitement adapté.' },
                    { icon: '🤲', title: 'Techniques douces', desc: 'Manipulations adaptées à votre condition et sensibilité pour un soulagement en douceur.' },
                    { icon: '📋', title: 'Suivi personnalisé', desc: 'Conseils et exercices pour prolonger les bienfaits entre chaque séance.' },
                  ].map((b, i) => (
                    <div key={i} className={cn("border border-[hsl(var(--page-accent))]/20 transition-all", viewMode === "mobile" ? "p-4" : "p-6")} style={{ borderRadius: 'var(--page-radius, 12px)' }}>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{b.icon}</span>
                        <div>
                          <h3 className="font-semibold text-[hsl(var(--page-text))] mb-2">{b.title}</h3>
                          <p className="text-sm text-[hsl(var(--page-text-muted))]">{b.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="bg-[hsl(var(--page-accent))] text-white px-6 py-3 text-sm font-medium mt-8" style={{ borderRadius: 'var(--page-radius, 9999px)' }}>Prendre Rendez-Vous</button>
              </div>

              {/* Content section with image */}
              <div className={cn("bg-[hsl(var(--page-accent))]/10 py-12", viewMode === "mobile" ? "px-5" : "px-8")}>
                <div className={cn("flex gap-8 w-full", viewMode === "mobile" ? "flex-col" : "flex-row")}>
                  <div className={cn("overflow-hidden", viewMode === "mobile" ? "w-full h-48" : "w-2/5 min-h-[350px] shrink-0")} style={{ borderRadius: 'var(--page-radius, 12px)' }}>
                    <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&h=400&fit=crop" alt="Traitement" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-[hsl(var(--page-accent))] text-sm font-medium">{spec.icon} {spec.title}</span>
                    <h2 className={cn("font-display font-bold text-[hsl(var(--page-text))] mt-2 mb-4", viewMode === "mobile" ? "text-2xl" : "text-3xl")}>Un traitement adapté à vos besoins</h2>
                    <div className="text-[hsl(var(--page-text-muted))] space-y-3 text-sm leading-relaxed">
                      <p>Les patients souffrant de {spec.title.toLowerCase()} trouvent souvent un soulagement durable grâce à une approche ostéopathique adaptée. En identifiant les causes profondes de vos douleurs, nous élaborons un plan de traitement personnalisé.</p>
                      <p>Chaque séance combine des techniques manuelles douces et des conseils pratiques pour améliorer votre quotidien et retrouver une mobilité optimale.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Related articles */}
              <div className={cn("py-12", viewMode === "mobile" ? "px-5" : "px-8")}>
                <h2 className={cn("font-display font-bold text-[hsl(var(--page-text))] mb-4 text-center", viewMode === "mobile" ? "text-2xl" : "text-3xl")}>Articles liés</h2>
                <p className="text-[hsl(var(--page-text-muted))] mb-8 text-center">Nos derniers articles sur {spec.title.toLowerCase()}</p>
                <div className={cn("grid gap-4", viewMode === "mobile" ? "grid-cols-1" : "grid-cols-3")}>
                  {[
                    { title: `${spec.title} : comprendre et soulager`, date: '15 Fév 2026', time: '5 min' },
                    { title: `5 exercices pour prévenir les ${spec.title.toLowerCase()}`, date: '8 Fév 2026', time: '4 min' },
                    { title: `Quand consulter pour ${spec.title.toLowerCase()} ?`, date: '1 Fév 2026', time: '3 min' },
                  ].map((a, i) => (
                    <div key={i} className="border border-[hsl(var(--page-accent))]/20 overflow-hidden" style={{ borderRadius: 'var(--page-radius, 12px)' }}>
                      <div className="h-28 bg-[hsl(var(--page-hero-bg))] flex items-center justify-center text-4xl">{spec.icon}</div>
                      <div className={viewMode === "mobile" ? "p-4" : "p-5"}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-[hsl(var(--page-accent))]">{spec.title}</span>
                          <span className="text-xs text-[hsl(var(--page-text-muted))]">· {a.time}</span>
                        </div>
                        <h3 className="font-semibold text-sm text-[hsl(var(--page-text))]">{a.title}</h3>
                        <p className="text-xs text-[hsl(var(--page-text-muted))] mt-1">{a.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Other specialties */}
              {otherSpecs.length > 0 && (
                <div className={cn("bg-[hsl(var(--page-accent))] py-8", viewMode === "mobile" ? "px-5" : "px-8")}>
                  <h3 className={cn("font-display font-bold text-white mb-6 text-center", viewMode === "mobile" ? "text-xl" : "text-2xl")}>Nos autres spécialités</h3>
                  <div className={cn("grid gap-4", viewMode === "desktop" ? "grid-cols-3" : "grid-cols-1")}>
                    {otherSpecs.map((other) => (
                      <div key={other.id} className="flex items-center gap-3 text-white p-3 rounded-lg hover:bg-white/10 transition-all cursor-pointer">
                        <span className="text-2xl shrink-0">{other.icon}</span>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{other.title}</p>
                          <p className="text-xs opacity-80 line-clamp-1">{other.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className={cn("bg-[hsl(var(--page-bg))] py-8", viewMode === "mobile" ? "px-5" : "px-8")}>
                <div className={cn("flex gap-8 justify-between", viewMode === "mobile" ? "flex-col" : "flex-row")}>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-[hsl(var(--page-text))]">{globalSettings.firstName || 'Prénom'} {globalSettings.lastName || 'Nom'}</h3>
                    <p className="text-sm text-[hsl(var(--page-text-muted))] mt-1">{profession} • {city}</p>
                  </div>
                  <div className={cn("flex gap-3", viewMode === "mobile" ? "flex-col items-start" : "gap-4")}>
                    <button className="bg-[hsl(var(--page-accent))] text-white px-5 py-2 rounded-full text-sm flex items-center gap-2 whitespace-nowrap">Prendre Rendez-Vous</button>
                    <button className="bg-[hsl(var(--page-accent))] text-white px-5 py-2 rounded-full text-sm flex items-center gap-2 whitespace-nowrap">{globalSettings.phoneNumber || 'Appeler'}</button>
                  </div>
                </div>
                <div className={cn("mt-8 pt-6 border-t text-sm text-[hsl(var(--page-text-muted))]", viewMode === "mobile" ? "flex flex-col items-start gap-4" : "flex items-center justify-between")}>
                  <span>© {new Date().getFullYear()} {profName}</span>
                  <span>Mentions légales</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ——— Article page template ——— */}
        {currentPage.startsWith("article-") && (() => {
          const specId = currentPage.replace("article-", "");
          const spec = painTypes.find(p => p.id === specId);
          if (!spec) return null;
          const profName = [globalSettings.firstName, globalSettings.lastName].filter(Boolean).join(' ') || 'Votre praticien';
          const city = globalSettings.city || 'votre ville';
          const profession = globalSettings.profession || 'Ostéopathe';
          const otherArticles = painTypes.filter(p => p.id !== specId).slice(0, 3);
          return (
            <div className={cn(
              "bg-[hsl(var(--page-bg))] overflow-auto transition-all duration-500 ease-out scrollbar-hide scroll-smooth relative",
              "rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2),0_10px_25px_-10px_rgba(0,0,0,0.1)]",
              viewMode === "desktop" ? "w-full max-w-6xl max-h-[80vh]" : "w-[375px] max-h-[80vh]"
            )}>
              {/* Navigation */}
              <nav className={cn("bg-[hsl(var(--page-hero-bg))] py-4 flex items-center justify-between sticky top-0 z-30", viewMode === "mobile" ? "px-5" : "px-8")}>
                <div className="flex items-center gap-3">
                  {identitySettings.logo && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-[hsl(var(--page-bg))] border border-[hsl(var(--page-text))]/10 flex items-center justify-center">
                      <img src={identitySettings.logo} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div className="font-display text-xl font-semibold text-[hsl(var(--page-text))] max-w-[200px]">
                    <span className="block truncate">{globalSettings.firstName || <span className="opacity-40">Prénom</span>}</span>
                    <span className="block truncate">{globalSettings.lastName || <span className="opacity-40">Nom</span>}</span>
                  </div>
                </div>
                {viewMode === "desktop" && (
                  <div className="flex items-center gap-6">
                    <span className="text-sm text-[hsl(var(--page-text-muted))] hover:text-[hsl(var(--page-text))] cursor-pointer transition-colors">← Blog</span>
                    <button className="bg-[hsl(var(--page-accent-dark))] text-white px-5 py-2.5 text-sm font-medium" style={{ borderRadius: 'var(--page-radius, 9999px)' }}>Prendre Rendez-Vous</button>
                  </div>
                )}
              </nav>

              {/* Article header */}
              <div className="bg-[hsl(var(--page-hero-bg))]">
                <div className={cn(viewMode === "mobile" ? "px-5 pt-8 pb-6" : "px-8 pt-12 pb-10 max-w-3xl mx-auto")}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-[hsl(var(--page-accent))] text-white px-3 py-0.5 text-xs font-medium" style={{ borderRadius: 'var(--page-radius, 9999px)' }}>{spec.icon} {spec.title}</span>
                    <span className="text-xs text-[hsl(var(--page-text-muted))]">15 Fév 2026 · 5 min de lecture</span>
                  </div>
                  <h1 className={cn("font-display font-bold text-[hsl(var(--page-text))] leading-tight mb-4", viewMode === "mobile" ? "text-2xl" : "text-4xl")}>{spec.title} : comprendre les causes et traitements</h1>
                  <p className="text-[hsl(var(--page-text-muted))] leading-relaxed">Découvrez comment l'ostéopathie peut vous aider à soulager les {spec.title.toLowerCase()} de manière naturelle et durable grâce à une approche personnalisée.</p>
                  <div className="flex items-center gap-3 mt-6">
                    <div className="w-10 h-10 rounded-full bg-[hsl(var(--page-accent))]/20 flex items-center justify-center text-sm font-bold text-[hsl(var(--page-accent))]">{(globalSettings.firstName?.[0] || 'T')}{(globalSettings.lastName?.[0] || 'G')}</div>
                    <div>
                      <p className="text-sm font-medium text-[hsl(var(--page-text))]">{profName}</p>
                      <p className="text-xs text-[hsl(var(--page-text-muted))]">{profession} à {city}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cover image */}
              <div className={cn(viewMode === "mobile" ? "px-5 py-6" : "px-8 py-8 max-w-3xl mx-auto")}>
                <div className="w-full h-48 bg-[hsl(var(--page-hero-bg))] flex items-center justify-center overflow-hidden" style={{ borderRadius: 'var(--page-radius, 12px)' }}>
                  <span className="text-7xl">{spec.icon}</span>
                </div>
              </div>

              {/* Article body */}
              <div className={cn(viewMode === "mobile" ? "px-5 pb-8" : "px-8 pb-12 max-w-3xl mx-auto")}>
                <div className="text-[hsl(var(--page-text-muted))] leading-relaxed space-y-6">
                  <div>
                    <h2 className={cn("font-display font-bold text-[hsl(var(--page-text))] mb-3", viewMode === "mobile" ? "text-xl" : "text-2xl")}>Qu'est-ce que {spec.title.toLowerCase()} ?</h2>
                    <p className="text-sm">Les {spec.title.toLowerCase()} sont un motif de consultation fréquent en ostéopathie. {spec.desc} Notre approche vise à identifier les causes profondes de ces douleurs pour proposer un traitement adapté et durable.</p>
                  </div>

                  <div>
                    <h2 className={cn("font-display font-bold text-[hsl(var(--page-text))] mb-3", viewMode === "mobile" ? "text-xl" : "text-2xl")}>Les causes fréquentes</h2>
                    <p className="text-sm mb-4">Plusieurs facteurs peuvent être à l'origine de ces troubles :</p>
                    <div className="space-y-2">
                      {['Postures prolongées au travail ou à la maison', 'Stress et tensions émotionnelles accumulées', 'Manque d\'activité physique régulière', 'Traumatismes anciens non traités'].map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-[hsl(var(--page-hero-bg))]" style={{ borderRadius: 'var(--page-radius, 8px)' }}>
                          <span className="text-[hsl(var(--page-accent))] font-bold text-sm mt-0.5">•</span>
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[hsl(var(--page-accent))]/10 p-6" style={{ borderRadius: 'var(--page-radius, 12px)' }}>
                    <h3 className="font-display font-bold text-[hsl(var(--page-text))] mb-2">L'approche ostéopathique</h3>
                    <p className="text-sm">L'ostéopathe utilise des techniques manuelles douces pour rétablir l'équilibre du corps. Chaque séance est adaptée à votre situation spécifique, en tenant compte de votre historique médical et de vos objectifs de santé.</p>
                  </div>

                  <div>
                    <h2 className={cn("font-display font-bold text-[hsl(var(--page-text))] mb-3", viewMode === "mobile" ? "text-xl" : "text-2xl")}>Conseils pratiques</h2>
                    <p className="text-sm mb-4">Entre les séances, quelques habitudes simples peuvent prolonger les bienfaits du traitement :</p>
                    <div className={cn("grid gap-3", viewMode === "desktop" ? "grid-cols-3" : "grid-cols-1")}>
                      {[
                        { icon: '🧘', title: 'Étirements', desc: 'Pratiquez des étirements doux chaque matin pendant 10 minutes' },
                        { icon: '🚶', title: 'Mouvement', desc: 'Marchez au moins 30 minutes par jour pour maintenir votre mobilité' },
                        { icon: '💤', title: 'Repos', desc: 'Veillez à la qualité de votre sommeil avec une bonne posture' },
                      ].map((tip, i) => (
                        <div key={i} className="border border-[hsl(var(--page-accent))]/20 p-4" style={{ borderRadius: 'var(--page-radius, 12px)' }}>
                          <span className="text-2xl">{tip.icon}</span>
                          <h4 className="font-semibold text-[hsl(var(--page-text))] text-sm mt-2">{tip.title}</h4>
                          <p className="text-xs mt-1">{tip.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CTA banner */}
                <div className="bg-[hsl(var(--page-accent-dark))] text-white p-6 mt-8 text-center" style={{ borderRadius: 'var(--page-radius, 12px)' }}>
                  <h3 className={cn("font-display font-bold mb-2", viewMode === "mobile" ? "text-lg" : "text-xl")}>Besoin d'un rendez-vous ?</h3>
                  <p className="text-white/80 text-sm mb-4">{profName}, {profession} à {city}</p>
                  <button className="bg-[hsl(var(--page-accent))] text-white px-6 py-3 text-sm font-medium" style={{ borderRadius: 'var(--page-radius, 9999px)' }}>Prendre Rendez-Vous</button>
                </div>
              </div>

              {/* Related articles */}
              {otherArticles.length > 0 && (
                <div className={cn("py-12 border-t border-[hsl(var(--page-accent))]/10", viewMode === "mobile" ? "px-5" : "px-8")}>
                  <h2 className={cn("font-display font-bold text-[hsl(var(--page-text))] mb-6 text-center", viewMode === "mobile" ? "text-xl" : "text-2xl")}>Articles similaires</h2>
                  <div className={cn("grid gap-4", viewMode === "mobile" ? "grid-cols-1" : "grid-cols-3")}>
                    {otherArticles.map((other) => (
                      <div key={other.id} className="border border-[hsl(var(--page-accent))]/20 overflow-hidden cursor-pointer hover:border-[hsl(var(--page-accent))]/40 transition-all" style={{ borderRadius: 'var(--page-radius, 12px)' }}>
                        <div className="h-24 bg-[hsl(var(--page-hero-bg))] flex items-center justify-center text-3xl">{other.icon}</div>
                        <div className="p-4">
                          <span className="text-xs font-medium text-[hsl(var(--page-accent))]">{other.title}</span>
                          <h3 className="font-semibold text-sm text-[hsl(var(--page-text))] mt-1">{other.title} : comprendre et soulager</h3>
                          <p className="text-xs text-[hsl(var(--page-text-muted))] mt-1 line-clamp-2">{other.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className={cn("bg-[hsl(var(--page-bg))] py-8 border-t border-[hsl(var(--page-accent))]/10", viewMode === "mobile" ? "px-5" : "px-8")}>
                <div className={cn("flex gap-8 justify-between", viewMode === "mobile" ? "flex-col" : "flex-row")}>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-[hsl(var(--page-text))]">{globalSettings.firstName || 'Prénom'} {globalSettings.lastName || 'Nom'}</h3>
                    <p className="text-sm text-[hsl(var(--page-text-muted))] mt-1">{profession} • {city}</p>
                  </div>
                  <div className={cn("flex gap-3", viewMode === "mobile" ? "flex-col items-start" : "gap-4")}>
                    <button className="bg-[hsl(var(--page-accent))] text-white px-5 py-2 rounded-full text-sm whitespace-nowrap">Prendre Rendez-Vous</button>
                    <button className="bg-[hsl(var(--page-accent))] text-white px-5 py-2 rounded-full text-sm whitespace-nowrap">{globalSettings.phoneNumber || 'Appeler'}</button>
                  </div>
                </div>
                <div className={cn("mt-8 pt-6 border-t text-sm text-[hsl(var(--page-text-muted))]", viewMode === "mobile" ? "flex flex-col items-start gap-4" : "flex items-center justify-between")}>
                  <span>© {new Date().getFullYear()} {profName}</span>
                  <span>Mentions légales</span>
                </div>
              </div>
            </div>
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
            <div className={cn(
              "bg-[hsl(var(--page-bg))] overflow-auto transition-all duration-500 ease-out scrollbar-hide scroll-smooth relative",
              "rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2),0_10px_25px_-10px_rgba(0,0,0,0.1)]",
              viewMode === "desktop" ? "w-full max-w-6xl max-h-[80vh]" : "w-[375px] max-h-[80vh]"
            )}>
              {/* Navigation */}
              <nav className={cn("bg-[hsl(var(--page-hero-bg))] py-4 flex items-center justify-between sticky top-0 z-30", viewMode === "mobile" ? "px-5" : "px-8")}>
                <div className="flex items-center gap-3">
                  {identitySettings.logo && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-[hsl(var(--page-bg))] border border-[hsl(var(--page-text))]/10 flex items-center justify-center">
                      <img src={identitySettings.logo} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div className="font-display text-xl font-semibold text-[hsl(var(--page-text))] max-w-[200px]">
                    <span className="block truncate">{globalSettings.firstName || <span className="opacity-40">Prénom</span>}</span>
                    <span className="block truncate">{globalSettings.lastName || <span className="opacity-40">Nom</span>}</span>
                  </div>
                </div>
                {viewMode === "desktop" && (
                  <div className="flex items-center gap-6">
                    <span className="text-sm text-[hsl(var(--page-accent))] font-medium">Blog</span>
                    <button className="bg-[hsl(var(--page-accent-dark))] text-white px-5 py-2.5 text-sm font-medium" style={{ borderRadius: 'var(--page-radius, 9999px)' }}>Prendre Rendez-Vous</button>
                  </div>
                )}
              </nav>

              {/* Hero */}
              <div className="bg-[hsl(var(--page-hero-bg))]">
                <div className={cn(viewMode === "mobile" ? "px-5 pt-8 pb-6" : "px-8 pt-12 pb-10")}>
                  <span className="self-start inline-flex mb-4 border border-[hsl(var(--page-accent))] text-[hsl(var(--page-accent))] px-4 py-1.5 text-sm" style={{ borderRadius: 'var(--page-radius, 9999px)' }}>
                    ✍️ {profession} à {city}
                  </span>
                  <h1 className={cn("font-display font-bold text-[hsl(var(--page-text))] leading-tight mb-4", viewMode === "mobile" ? "text-3xl" : "text-4xl md:text-5xl")}>Blog & Conseils Santé</h1>
                  <p className="text-[hsl(var(--page-text-muted))] max-w-lg">Articles et conseils de {profName} pour votre bien-être au quotidien</p>
                  {/* Decorative dots */}
                  <div className="flex gap-1 mt-6">
                    {Array.from({ length: viewMode === "mobile" ? 15 : 30 }).map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--page-accent))]/40" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Category pills */}
              <div className={cn("flex flex-wrap gap-2 py-6", viewMode === "mobile" ? "px-5" : "px-8")}>
                <span className="bg-[hsl(var(--page-accent))] text-white px-4 py-1.5 text-sm font-medium" style={{ borderRadius: 'var(--page-radius, 9999px)' }}>Tous</span>
                {painTypes.slice(0, 5).map(s => (
                  <span key={s.id} className="bg-[hsl(var(--page-hero-bg))] text-[hsl(var(--page-text-muted))] px-4 py-1.5 text-sm font-medium cursor-pointer hover:text-[hsl(var(--page-text))] transition-colors" style={{ borderRadius: 'var(--page-radius, 9999px)' }}>{s.icon} {s.title}</span>
                ))}
              </div>

              {/* Featured article */}
              {blogArticles[0] && (
                <div className={cn("pb-8", viewMode === "mobile" ? "px-5" : "px-8")}>
                  <div className="bg-[hsl(var(--page-hero-bg))] overflow-hidden" style={{ borderRadius: 'var(--page-radius, 12px)' }}>
                    <div className={cn("flex", viewMode === "mobile" ? "flex-col" : "flex-row")}>
                      <div className={cn("bg-[hsl(var(--page-accent))]/10 flex items-center justify-center", viewMode === "mobile" ? "h-40 w-full" : "w-2/5 min-h-[220px]")}>
                        <span className="text-6xl">{blogArticles[0].icon}</span>
                      </div>
                      <div className={cn("flex flex-col justify-center", viewMode === "mobile" ? "p-5" : "p-8 flex-1")}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="bg-[hsl(var(--page-accent))] text-white px-3 py-0.5 text-xs font-medium" style={{ borderRadius: 'var(--page-radius, 9999px)' }}>{blogArticles[0].category}</span>
                          <span className="text-xs text-[hsl(var(--page-text-muted))]">{blogArticles[0].date} · {blogArticles[0].readTime}</span>
                        </div>
                        <h2 className={cn("font-display font-bold text-[hsl(var(--page-text))]", viewMode === "mobile" ? "text-lg" : "text-xl")}>{blogArticles[0].title}</h2>
                        <p className="text-sm text-[hsl(var(--page-text-muted))] mt-2 leading-relaxed">{blogArticles[0].excerpt}</p>
                        <button className="self-start mt-4 text-sm font-medium text-[hsl(var(--page-accent))] hover:underline">Lire l'article →</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Article grid */}
              <div className={cn("pb-12", viewMode === "mobile" ? "px-5" : "px-8")}>
                <div className={cn("grid gap-4", viewMode === "mobile" ? "grid-cols-1" : "grid-cols-3")}>
                  {blogArticles.slice(1, 7).map(a => (
                    <div key={a.id} className="border border-[hsl(var(--page-accent))]/20 overflow-hidden cursor-pointer hover:border-[hsl(var(--page-accent))]/40 transition-all" style={{ borderRadius: 'var(--page-radius, 12px)' }}>
                      <div className="h-28 bg-[hsl(var(--page-hero-bg))] flex items-center justify-center text-4xl">{a.icon}</div>
                      <div className={viewMode === "mobile" ? "p-4" : "p-5"}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-[hsl(var(--page-accent))]">{a.category}</span>
                          <span className="text-xs text-[hsl(var(--page-text-muted))]">· {a.readTime}</span>
                        </div>
                        <h3 className="font-semibold text-sm text-[hsl(var(--page-text))] leading-snug">{a.title}</h3>
                        <p className="text-xs text-[hsl(var(--page-text-muted))] mt-1.5 leading-relaxed line-clamp-2">{a.excerpt}</p>
                        <span className="block mt-3 text-xs font-medium text-[hsl(var(--page-accent))]">Lire →</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Newsletter CTA */}
              <div className={cn("bg-[hsl(var(--page-accent-dark))] text-white py-12 text-center", viewMode === "mobile" ? "px-5" : "px-8")}>
                <h2 className={cn("font-display font-bold mb-4", viewMode === "mobile" ? "text-2xl" : "text-3xl")}>Restez informé</h2>
                <p className="text-white/80 mb-6 max-w-md mx-auto text-sm">Recevez nos derniers articles et conseils santé directement dans votre boîte mail</p>
                <div className={cn("flex max-w-md mx-auto gap-2", viewMode === "mobile" ? "flex-col" : "flex-row")}>
                  <div className="flex-1 bg-white/10 px-4 py-3 text-sm text-white/50 text-left" style={{ borderRadius: 'var(--page-radius, 9999px)' }}>votre@email.fr</div>
                  <button className="bg-[hsl(var(--page-accent))] text-white px-6 py-3 text-sm font-medium whitespace-nowrap" style={{ borderRadius: 'var(--page-radius, 9999px)' }}>S'abonner</button>
                </div>
              </div>

              {/* Footer */}
              <div className={cn("bg-[hsl(var(--page-bg))] py-8", viewMode === "mobile" ? "px-5" : "px-8")}>
                <div className={cn("flex gap-8 justify-between", viewMode === "mobile" ? "flex-col" : "flex-row")}>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-[hsl(var(--page-text))]">{globalSettings.firstName || 'Prénom'} {globalSettings.lastName || 'Nom'}</h3>
                    <p className="text-sm text-[hsl(var(--page-text-muted))] mt-1">{profession} • {city}</p>
                  </div>
                  <div className={cn("flex gap-3", viewMode === "mobile" ? "flex-col items-start" : "gap-4")}>
                    <button className="bg-[hsl(var(--page-accent))] text-white px-5 py-2 rounded-full text-sm flex items-center gap-2 whitespace-nowrap">Prendre Rendez-Vous</button>
                    <button className="bg-[hsl(var(--page-accent))] text-white px-5 py-2 rounded-full text-sm flex items-center gap-2 whitespace-nowrap">{globalSettings.phoneNumber || 'Appeler'}</button>
                  </div>
                </div>
                <div className={cn("mt-8 pt-6 border-t text-sm text-[hsl(var(--page-text-muted))]", viewMode === "mobile" ? "flex flex-col items-start gap-4" : "flex items-center justify-between")}>
                  <span>© {new Date().getFullYear()} {profName}</span>
                  <span>Mentions légales</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ——— Mentions légales page template ——— */}
        {currentPage === "mentions" && (() => {
          const profName = [globalSettings.firstName, globalSettings.lastName].filter(Boolean).join(' ') || 'Votre praticien';
          const city = globalSettings.city || 'votre ville';
          const profession = globalSettings.profession || 'Ostéopathe';
          const sections = [
            { icon: '🏢', title: 'Éditeur du site', content: `Ce site est édité par ${profName}, ${profession} à ${city}.\nSIRET : 000 000 000 00000\nAdresse : Cabinet d'ostéopathie, ${city}\nTéléphone : ${globalSettings.phoneNumber || '01 23 45 67 89'}\nEmail : contact@${profName.toLowerCase().replace(/\s+/g, '')}.fr` },
            { icon: '🌐', title: 'Hébergement', content: 'Ce site est hébergé par Theralys SAS\nAdresse : Paris, France\nContact : support@theralys.fr' },
            { icon: '©️', title: 'Propriété intellectuelle', content: 'L\'ensemble du contenu de ce site (textes, images, graphismes, logo, icônes) est la propriété exclusive de l\'éditeur, sauf mention contraire. Toute reproduction, distribution, modification ou utilisation sans autorisation préalable est strictement interdite.' },
            { icon: '🔒', title: 'Protection des données personnelles', content: 'Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d\'un droit d\'accès, de rectification, de suppression et de portabilité de vos données personnelles.\n\nLes données collectées via le formulaire de contact sont utilisées uniquement pour répondre à vos demandes. Elles ne sont ni cédées ni vendues à des tiers.\n\nPour exercer vos droits, contactez-nous par email.' },
            { icon: '🍪', title: 'Cookies', content: 'Ce site utilise des cookies strictement nécessaires à son fonctionnement. Aucun cookie publicitaire ou de traçage n\'est utilisé. Vous pouvez configurer votre navigateur pour refuser les cookies.' },
            { icon: '⚖️', title: 'Responsabilité', content: 'Les informations fournies sur ce site sont à titre informatif et ne remplacent pas une consultation professionnelle. L\'éditeur ne saurait être tenu responsable des dommages directs ou indirects résultant de l\'utilisation de ce site.' },
          ];
          return (
            <div className={cn(
              "bg-[hsl(var(--page-bg))] overflow-auto transition-all duration-500 ease-out scrollbar-hide scroll-smooth relative",
              "rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2),0_10px_25px_-10px_rgba(0,0,0,0.1)]",
              viewMode === "desktop" ? "w-full max-w-6xl max-h-[80vh]" : "w-[375px] max-h-[80vh]"
            )}>
              {/* Navigation */}
              <nav className={cn("bg-[hsl(var(--page-hero-bg))] py-4 flex items-center justify-between sticky top-0 z-30", viewMode === "mobile" ? "px-5" : "px-8")}>
                <div className="flex items-center gap-3">
                  {identitySettings.logo && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-[hsl(var(--page-bg))] border border-[hsl(var(--page-text))]/10 flex items-center justify-center">
                      <img src={identitySettings.logo} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div className="font-display text-xl font-semibold text-[hsl(var(--page-text))] max-w-[200px]">
                    <span className="block truncate">{globalSettings.firstName || <span className="opacity-40">Prénom</span>}</span>
                    <span className="block truncate">{globalSettings.lastName || <span className="opacity-40">Nom</span>}</span>
                  </div>
                </div>
                {viewMode === "desktop" && (
                  <div className="flex items-center gap-6">
                    <span className="text-sm text-[hsl(var(--page-accent))] font-medium">Mentions légales</span>
                    <button className="bg-[hsl(var(--page-accent-dark))] text-white px-5 py-2.5 text-sm font-medium" style={{ borderRadius: 'var(--page-radius, 9999px)' }}>Prendre Rendez-Vous</button>
                  </div>
                )}
              </nav>

              {/* Hero */}
              <div className="bg-[hsl(var(--page-hero-bg))]">
                <div className={cn(viewMode === "mobile" ? "px-5 pt-8 pb-6" : "px-8 pt-12 pb-10")}>
                  <span className="self-start inline-flex mb-4 border border-[hsl(var(--page-accent))] text-[hsl(var(--page-accent))] px-4 py-1.5 text-sm" style={{ borderRadius: 'var(--page-radius, 9999px)' }}>
                    ⚖️ Informations légales
                  </span>
                  <h1 className={cn("font-display font-bold text-[hsl(var(--page-text))] leading-tight mb-4", viewMode === "mobile" ? "text-3xl" : "text-4xl md:text-5xl")}>Mentions légales</h1>
                  <p className="text-[hsl(var(--page-text-muted))]">Dernière mise à jour : Février 2026</p>
                  {/* Decorative dots */}
                  <div className="flex gap-1 mt-6">
                    {Array.from({ length: viewMode === "mobile" ? 15 : 30 }).map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--page-accent))]/40" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Sections */}
              <div className={cn("py-12", viewMode === "mobile" ? "px-5" : "px-8")}>
                <div className={cn("grid gap-4", viewMode === "desktop" ? "grid-cols-2" : "grid-cols-1")}>
                  {sections.map((s, i) => (
                    <div key={i} className={cn("border border-[hsl(var(--page-accent))]/20", viewMode === "mobile" ? "p-4" : "p-6")} style={{ borderRadius: 'var(--page-radius, 12px)' }}>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl shrink-0">{s.icon}</span>
                        <div className="min-w-0">
                          <h2 className="font-semibold text-[hsl(var(--page-text))] mb-2">{s.title}</h2>
                          <div className="text-sm text-[hsl(var(--page-text-muted))] whitespace-pre-line leading-relaxed">{s.content}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className={cn("bg-[hsl(var(--page-bg))] py-8 border-t border-[hsl(var(--page-accent))]/10", viewMode === "mobile" ? "px-5" : "px-8")}>
                <div className={cn("flex gap-8 justify-between", viewMode === "mobile" ? "flex-col" : "flex-row")}>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-[hsl(var(--page-text))]">{globalSettings.firstName || 'Prénom'} {globalSettings.lastName || 'Nom'}</h3>
                    <p className="text-sm text-[hsl(var(--page-text-muted))] mt-1">{profession} • {city}</p>
                  </div>
                  <div className={cn("flex gap-3", viewMode === "mobile" ? "flex-col items-start" : "gap-4")}>
                    <button className="bg-[hsl(var(--page-accent))] text-white px-5 py-2 rounded-full text-sm flex items-center gap-2 whitespace-nowrap">Prendre Rendez-Vous</button>
                    <button className="bg-[hsl(var(--page-accent))] text-white px-5 py-2 rounded-full text-sm flex items-center gap-2 whitespace-nowrap">{globalSettings.phoneNumber || 'Appeler'}</button>
                  </div>
                </div>
                <div className={cn("mt-8 pt-6 border-t text-sm text-[hsl(var(--page-text-muted))]", viewMode === "mobile" ? "flex flex-col items-start gap-4" : "flex items-center justify-between")}>
                  <span>© {new Date().getFullYear()} {profName}</span>
                  <span>Tous droits réservés</span>
                </div>
              </div>
            </div>
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

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowSettingsModal(false)} />
          <div className="relative bg-white rounded-2xl overflow-hidden w-[900px] max-w-[90vw] h-[80vh] max-h-[80vh]" style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <Setup isModal={true} onClose={() => setShowSettingsModal(false)} />
          </div>
        </div>
      )}

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
                onClick={() => { setShowSpecialtyConfirm(false); router.push('/setup/contact'); }}
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
                onClick={() => { setShowTherapistConfirm(false); router.push('/setup/contact'); }}
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
        <div className="fixed z-[100]" style={{ bottom: '72px', right: 'calc(50% - 250px)' }} data-style-panel>
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
              router.push(getDashboardPath())
            } : undefined}
          />
        </div>
      )}

      {/* Editor Toolbar - floating on top of content */}
      <EditorToolbar
        currentPage={currentPage}
        onPageChange={goToEditorPage}
        isHomePublished={setupCompleted}
        specialties={painTypes.map(p => ({ id: p.id, icon: p.icon, title: p.title }))}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onStyleClick={() => setShowStyleModal(true)}
        onSettingsClick={() => tryNavigate(() => router.push('/setup/contact'))}
        isMobileDevice={typeof window !== "undefined" && window.innerWidth < 768}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onboardingLock={isOnboardingMode && !setupCompleted}
        onAccueilClick={() => tryNavigate(() => router.push(getDashboardPath()))}
        onPreviewClick={() => {}}
        onValidatePage={isValidationMode ? handleValidationFlowValidate : handleValidatePage}
        onPublishClick={handlePublishClick}
        completedActions={completedActions}
        isValidationMode={isValidationMode}
        validationSequence={VALIDATION_SEQUENCE}
        validationStepIndex={validationStepIndex}
        hasScrolledToBottom={hasScrolledToBottom}
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
const SiteEditor = ({ initialOpenStyle, initialPage, initialValidationMode }) => {
  return (
    <ProofreadingProvider>
      <SiteEditorContent initialOpenStyle={initialOpenStyle} initialPage={initialPage} initialValidationMode={initialValidationMode} />
    </ProofreadingProvider>
  );
};

export default SiteEditor;
