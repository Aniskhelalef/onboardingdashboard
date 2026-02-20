'use client';

import { createContext, useContext, useReducer, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_SETUP_DATA, DEFAULT_SPECIALTIES, DEFAULT_REVIEW_TEMPLATES, DATA_KEY_TO_ACTION_ID, ALL_STEP_IDS, MAIN_STEP_IDS, migrateParagraphsToRichText } from "./constants";

// ── Reducer ───────────────────────────────────────────────────────────

function setupReducer(state, action) {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, data: action.payload, initialSnapshot: JSON.parse(JSON.stringify(action.payload)) };

    case "SET_COMPLETED_ACTIONS":
      return { ...state, completedActionIds: action.payload };

    case "MARK_ACTION_COMPLETE": {
      const ids = state.completedActionIds.includes(action.payload) ? state.completedActionIds : [...state.completedActionIds, action.payload];
      return { ...state, completedActionIds: ids };
    }

    case "SNAPSHOT":
      return { ...state, initialSnapshot: JSON.parse(JSON.stringify(state.data)) };

    case "SET_ACTIVE_STEP":
      return { ...state, activeStepId: action.payload };

    case "SET_VALIDATED":
      return { ...state, validatedSection: action.payload };

    // ── Data mutations ──
    case "UPDATE_CONTACT":
      return { ...state, data: { ...state.data, contact: { ...state.data.contact, ...action.payload } } };

    case "ADD_LOCATION":
      return { ...state, data: { ...state.data, locations: [...state.data.locations, action.payload] } };
    case "UPDATE_LOCATION":
      return { ...state, data: { ...state.data, locations: state.data.locations.map(l => l.id === action.payload.id ? { ...l, ...action.payload.updates } : l) } };
    case "REMOVE_LOCATION":
      return { ...state, data: { ...state.data, locations: state.data.locations.filter(l => l.id !== action.payload) } };

    case "ADD_THERAPIST":
      return { ...state, data: { ...state.data, therapists: [...state.data.therapists, action.payload] } };
    case "UPDATE_THERAPIST":
      return { ...state, data: { ...state.data, therapists: state.data.therapists.map(t => t.id === action.payload.id ? { ...t, ...action.payload.updates } : t) } };
    case "REMOVE_THERAPIST":
      return { ...state, data: { ...state.data, therapists: state.data.therapists.filter(t => t.id !== action.payload) } };

    case "SET_SPECIALTIES":
      return { ...state, data: { ...state.data, specialties: action.payload } };
    case "ADD_SPECIALTY":
      return { ...state, data: { ...state.data, specialties: [...state.data.specialties, action.payload] } };
    case "REMOVE_SPECIALTY":
      return { ...state, data: { ...state.data, specialties: state.data.specialties.filter(s => s.id !== action.payload) } };
    case "UPDATE_SPECIALTY":
      return { ...state, data: { ...state.data, specialties: state.data.specialties.map(s => s.id === action.payload.id ? { ...s, ...action.payload.updates } : s) } };
    case "REPLACE_SPECIALTY":
      return { ...state, data: { ...state.data, specialties: state.data.specialties.map(s => s.id === action.payload.oldId ? action.payload.newSpec : s) } };

    case "SET_GOOGLE":
      return { ...state, data: { ...state.data, google: action.payload } };

    case "ADD_CUSTOM_CODE":
      return { ...state, data: { ...state.data, customCode: [...state.data.customCode, action.payload] } };
    case "UPDATE_CUSTOM_CODE":
      return { ...state, data: { ...state.data, customCode: state.data.customCode.map(c => c.id === action.payload.id ? { ...c, ...action.payload.updates } : c) } };
    case "REMOVE_CUSTOM_CODE":
      return { ...state, data: { ...state.data, customCode: state.data.customCode.filter(c => c.id !== action.payload) } };

    case "UPDATE_REVIEW_TEMPLATE": {
      const { channel, updates } = action.payload;
      const prev = state.data.reviewTemplates[channel];
      return { ...state, data: { ...state.data, reviewTemplates: { ...state.data.reviewTemplates, [channel]: typeof prev === "object" ? { ...prev, ...updates } : updates } } };
    }
    case "SET_REVIEW_GOOGLE_LINK":
      return { ...state, data: { ...state.data, reviewTemplates: { ...state.data.reviewTemplates, googleLink: action.payload } } };

    case "SET_REDACTION":
      return { ...state, data: { ...state.data, redaction: { ...state.data.redaction, ...action.payload } } };

    default:
      return state;
  }
}

// ── Read localStorage (client only, called in useEffect) ──────────────

function readFromStorage() {
  let data = DEFAULT_SETUP_DATA;
  let completedActionIds = [];

  try {
    const raw = localStorage.getItem("setupData");
    if (raw) {
      const saved = JSON.parse(raw);
      data = {
        contact: saved.contact || DEFAULT_SETUP_DATA.contact,
        locations: saved.locations || [],
        therapists: (saved.therapists || []).map(migrateParagraphsToRichText),
        specialties: saved.specialties || DEFAULT_SPECIALTIES,
        google: saved.google || { connected: false, profile: null },
        customCode: saved.customCode || [],
        reviewTemplates: saved.reviewTemplates || DEFAULT_REVIEW_TEMPLATES,
        redaction: saved.redaction || DEFAULT_SETUP_DATA.redaction,
      };
    }
  } catch {}

  // Fallback: hydrate from generatedContent
  if (!localStorage.getItem("setupData")) {
    try {
      const gen = JSON.parse(localStorage.getItem("generatedContent") || "null");
      if (gen) {
        if (gen.contact) {
          data = {
            ...data,
            contact: {
              ...data.contact,
              firstName: gen.contact.firstName || "",
              lastName: gen.contact.lastName || "",
              profession: gen.contact.profession || "",
              city: gen.contact.city || "",
              phoneNumber: gen.contact.phone || "",
              appointmentLink: gen.contact.website || "",
            },
          };
        }
        if (gen.specialties && Array.isArray(gen.specialties)) {
          data = { ...data, specialties: gen.specialties.map((s, i) => ({ id: s.id || String(i + 1), icon: s.icon, title: s.title, description: s.description || "" })) };
        }
      }
    } catch {}
  }

  // Profession fallback
  if (!data.contact.profession) {
    data = { ...data, contact: { ...data.contact, profession: localStorage.getItem("userProfession") || "" } };
  }

  try { completedActionIds = JSON.parse(localStorage.getItem("completedActions") || "[]"); } catch {}

  return { data, completedActionIds };
}

// ── Context ───────────────────────────────────────────────────────────

const SetupContext = createContext(null);

export function SetupProvider({ children, initialStep, isModal, onClose }) {
  const router = useRouter();
  const step = initialStep && ALL_STEP_IDS.includes(initialStep) ? initialStep : "contact";

  // Always start with defaults (SSR-safe) — hydrate from localStorage in useEffect
  const [state, dispatch] = useReducer(setupReducer, {
    data: DEFAULT_SETUP_DATA,
    activeStepId: step,
    completedActionIds: [],
    validatedSection: null,
    initialSnapshot: JSON.parse(JSON.stringify(DEFAULT_SETUP_DATA)),
  });

  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    const stored = readFromStorage();
    dispatch({ type: "HYDRATE", payload: stored.data });
    dispatch({ type: "SET_COMPLETED_ACTIONS", payload: stored.completedActionIds });
    setHydrated(true);
  }, []);

  // Compute changed sections
  const changedSections = new Set();
  if (hydrated && state.initialSnapshot) {
    for (const key of Object.keys(state.data)) {
      if (JSON.stringify(state.data[key]) !== JSON.stringify(state.initialSnapshot[key])) {
        changedSections.add(key);
      }
    }
  }

  const allMainDone = MAIN_STEP_IDS.every(id => state.completedActionIds.includes(id));

  // Navigation
  const goToStep = useCallback((stepId) => {
    if (isModal) {
      dispatch({ type: "SET_ACTIVE_STEP", payload: stepId });
    } else {
      router.push(`/setup/${stepId}`);
    }
  }, [isModal, router]);

  // Validate / save a section
  const handleValidateSection = useCallback((sectionKey) => {
    localStorage.setItem("setupData", JSON.stringify(state.data));
    window.dispatchEvent(new Event("setupDataUpdated"));
    dispatch({ type: "SNAPSHOT" });

    const actionId = DATA_KEY_TO_ACTION_ID[sectionKey];
    if (actionId) {
      const existing = JSON.parse(localStorage.getItem("completedActions") || "[]");
      if (!existing.includes(actionId)) {
        existing.push(actionId);
        localStorage.setItem("completedActions", JSON.stringify(existing));
        window.dispatchEvent(new Event("actionsUpdated"));
      }
      dispatch({ type: "MARK_ACTION_COMPLETE", payload: actionId });
    }

    dispatch({ type: "SET_VALIDATED", payload: sectionKey });
    setTimeout(() => dispatch({ type: "SET_VALIDATED", payload: null }), 2000);
  }, [state.data]);

  // Finish guided flow
  const handleFinish = useCallback(() => {
    const existing = JSON.parse(localStorage.getItem("completedActions") || "[]");
    const allIds = [...new Set([...existing, ...MAIN_STEP_IDS, "setup"])];
    localStorage.setItem("completedActions", JSON.stringify(allIds));
    dispatch({ type: "SET_COMPLETED_ACTIONS", payload: allIds });
    window.dispatchEvent(new Event("actionsUpdated"));
    router.push("/dashboard");
  }, [router]);

  // Reset
  const handleResetAll = useCallback(() => {
    localStorage.removeItem("setupData");
    localStorage.removeItem("setupComplete");
    localStorage.removeItem("completedActions");
    window.dispatchEvent(new Event("actionsUpdated"));
    window.location.reload();
  }, []);

  // Keep activeStepId in sync for page mode (URL changes)
  useEffect(() => {
    if (!isModal && initialStep && ALL_STEP_IDS.includes(initialStep) && initialStep !== state.activeStepId) {
      dispatch({ type: "SET_ACTIVE_STEP", payload: initialStep });
    }
  }, [initialStep, isModal, state.activeStepId]);

  const value = {
    state, dispatch, changedSections, allMainDone, isModal, onClose, hydrated,
    goToStep, handleValidateSection, handleFinish, handleResetAll,
  };

  return <SetupContext.Provider value={value}>{children}</SetupContext.Provider>;
}

export function useSetup() {
  const ctx = useContext(SetupContext);
  if (!ctx) throw new Error("useSetup must be used within SetupProvider");
  return ctx;
}
