import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  getAllProofreadingElements,
} from './proofreading-elements';

const STORAGE_KEY = 'proofreadingState';

const initialState = {
  isActive: false,
  currentIndex: 0,
  elements: [],
  statuses: {},
};

const ProofreadingContext = createContext(null);

export function ProofreadingProvider({ children }) {
  const [state, setState] = useState(initialState);

  // Load saved state on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Only restore if it was active and not completed
        if (parsed.isActive && !parsed.completedAt) {
          setState(parsed);
        }
      } catch (e) {
        console.error('Failed to parse saved proofreading state:', e);
      }
    }
  }, []);

  // Save state on change
  useEffect(() => {
    if (state.isActive) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  // Computed values
  const currentElement = state.isActive && state.elements[state.currentIndex]
    ? state.elements[state.currentIndex]
    : null;

  const progress = {
    current: state.currentIndex + 1,
    total: state.elements.length,
    percentage: state.elements.length > 0
      ? Math.round(((state.currentIndex + 1) / state.elements.length) * 100)
      : 0,
  };

  const remainingCount = Object.entries(state.statuses).filter(
    ([_, status]) => status === 'pending' || status === 'skipped'
  ).length;

  // Complete when user has passed through all elements (reached the end)
  const isComplete = state.isActive &&
    state.elements.length > 0 &&
    state.currentIndex === state.elements.length - 1 &&
    state.statuses[state.elements[state.currentIndex]?.id] !== 'pending';

  // Actions
  const startProofreading = useCallback((data) => {
    const elements = getAllProofreadingElements(data);
    const statuses = {};
    elements.forEach(el => {
      statuses[el.id] = 'pending';
    });

    setState({
      isActive: true,
      currentIndex: 0,
      elements,
      statuses,
      startedAt: new Date().toISOString(),
    });
  }, []);

  const resumeProofreading = useCallback((data) => {
    // Regenerate elements with current data
    const elements = getAllProofreadingElements(data);

    // Find last validated/corrected element to resume from there
    let resumeIndex = 0;
    for (let i = elements.length - 1; i >= 0; i--) {
      const status = state.statuses[elements[i].id];
      if (status === 'validated' || status === 'corrected') {
        resumeIndex = i;
        break;
      }
    }

    setState(prev => ({
      ...prev,
      isActive: true,
      elements,
      currentIndex: resumeIndex,
    }));
  }, [state.statuses]);

  const updateStatus = useCallback((status) => {
    if (!currentElement) return;

    setState(prev => ({
      ...prev,
      statuses: {
        ...prev.statuses,
        [currentElement.id]: status,
      },
    }));
  }, [currentElement]);

  const moveToNext = useCallback(() => {
    setState(prev => {
      if (prev.currentIndex < prev.elements.length - 1) {
        return { ...prev, currentIndex: prev.currentIndex + 1 };
      }
      // At the end - mark as complete if all done
      const allDone = prev.elements.every(
        el => prev.statuses[el.id] === 'validated' || prev.statuses[el.id] === 'corrected'
      );
      if (allDone) {
        return { ...prev, completedAt: new Date().toISOString() };
      }
      return prev;
    });
  }, []);

  const validate = useCallback(() => {
    updateStatus('validated');
    moveToNext();
  }, [updateStatus, moveToNext]);

  const skip = useCallback(() => {
    updateStatus('skipped');
    moveToNext();
  }, [updateStatus, moveToNext]);

  const correct = useCallback(() => {
    // This is called after the correction modal saves
    updateStatus('corrected');
    moveToNext();
  }, [updateStatus, moveToNext]);

  const next = useCallback(() => {
    moveToNext();
  }, [moveToNext]);

  const prev = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentIndex: Math.max(0, prev.currentIndex - 1),
    }));
  }, []);

  const goToElement = useCallback((index) => {
    setState(prev => ({
      ...prev,
      currentIndex: Math.max(0, Math.min(index, prev.elements.length - 1)),
    }));
  }, []);

  const goToElementById = useCallback((elementId) => {
    setState(prev => {
      const index = prev.elements.findIndex(el => el.id === elementId);
      if (index !== -1) {
        return { ...prev, currentIndex: index };
      }
      return prev;
    });
  }, []);

  const startAndGoToElement = useCallback((data, elementId) => {
    const elements = getAllProofreadingElements(data);
    const statuses = {};
    elements.forEach(el => {
      statuses[el.id] = 'pending';
    });

    const index = elements.findIndex(el => el.id === elementId);

    setState({
      isActive: true,
      currentIndex: index !== -1 ? index : 0,
      elements,
      statuses,
      startedAt: new Date().toISOString(),
    });
  }, []);

  const exitProofreading = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: false,
    }));
  }, []);

  const resetProofreading = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(initialState);
  }, []);

  const value = {
    state,
    currentElement,
    progress,
    remainingCount,
    isComplete,
    startProofreading,
    startAndGoToElement,
    validate,
    skip,
    correct,
    next,
    prev,
    goToElement,
    goToElementById,
    exitProofreading,
    resumeProofreading,
    resetProofreading,
  };

  return (
    <ProofreadingContext.Provider value={value}>
      {children}
    </ProofreadingContext.Provider>
  );
}

export function useProofreading() {
  const context = useContext(ProofreadingContext);
  if (!context) {
    throw new Error('useProofreading must be used within a ProofreadingProvider');
  }
  return context;
}

/**
 * Hook to get the status for a specific element
 */
export function useElementStatus(elementId) {
  const { state } = useProofreading();
  return state.statuses[elementId];
}

/**
 * Hook to check if proofreading has been started before (even if paused)
 */
export function useHasSavedProgress() {
  const { state } = useProofreading();
  return Object.keys(state.statuses).length > 0;
}
