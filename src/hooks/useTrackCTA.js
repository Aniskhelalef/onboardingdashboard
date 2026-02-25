"use client";

import { useCallback, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Generate or retrieve a session ID from a cookie (30min rolling expiry).
 */
function getSessionId() {
  const COOKIE_NAME = "cta_sid";
  const EXPIRY_MIN = 30;

  // Read existing
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  const existing = match ? decodeURIComponent(match[1]) : null;

  // Generate new if missing
  const sid = existing || crypto.randomUUID();

  // Set / refresh with rolling 30min expiry
  const expires = new Date(Date.now() + EXPIRY_MIN * 60 * 1000).toUTCString();
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(sid)}; path=/; expires=${expires}; SameSite=Lax`;

  return sid;
}

/**
 * useTrackCTA — lightweight CTA click tracker.
 *
 * Usage:
 *   const { trackClick } = useTrackCTA({ therapistId, pageSlug });
 *   <button onClick={() => trackClick("hero", "cta_rdv_click")}>Prendre RDV</button>
 *
 * @param {Object} opts
 * @param {string} opts.therapistId  — identifies the therapist site
 * @param {string} opts.pageSlug     — current page slug
 */
export function useTrackCTA({ therapistId, pageSlug }) {
  const pageViewFired = useRef(false);
  // Debounce: prevent duplicate clicks within 1s per placement
  const lastClick = useRef({});

  // Track page view once on mount
  useEffect(() => {
    if (!therapistId || !pageSlug || pageViewFired.current) return;
    pageViewFired.current = true;

    const sessionId = getSessionId();
    supabase
      .from("cta_events")
      .insert({
        therapist_id: therapistId,
        session_id: sessionId,
        event_type: "page_view",
        page_slug: pageSlug,
        placement: null,
      })
      .then(({ error }) => {
        if (error) console.warn("[useTrackCTA:page_view]", error.message);
      });
  }, [therapistId, pageSlug]);

  const trackClick = useCallback(
    (placement, eventType = "cta_rdv_click") => {
      const now = Date.now();
      const key = `${placement}:${eventType}`;
      if (lastClick.current[key] && now - lastClick.current[key] < 1000) return;
      lastClick.current[key] = now;

      const sessionId = getSessionId();

      // Fire-and-forget insert — don't block the UI
      supabase
        .from("cta_events")
        .insert({
          therapist_id: therapistId,
          session_id: sessionId,
          event_type: eventType,
          page_slug: pageSlug,
          placement,
        })
        .then(({ error }) => {
          if (error) console.warn("[useTrackCTA]", error.message);
        });
    },
    [therapistId, pageSlug]
  );

  return { trackClick };
}
