'use client';

import { useState, useEffect, useRef, useCallback } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * GoogleReviewsWidget — Public-facing review carousel/grid for therapist websites.
 *
 * Fetches 5-star reviews from the public API and displays them in
 * a carousel (default) or grid layout. Inherits the site's theme
 * via CSS custom properties (--page-accent, --page-text, etc.).
 *
 * Props:
 *   - therapistId: string — used to fetch reviews from the public API
 *   - layout: "carousel" | "grid" — display mode (default: "carousel")
 *   - heading: string — section title (default: "Ce que disent nos patients")
 *   - subtitle: string — section subtitle (default: "Témoignages")
 *   - googleMapsUrl: string — link to the Google profile page
 *   - googleProfileName: string — business name shown in the header
 *   - viewMode: "desktop" | "mobile" — responsive mode (from editor)
 *   - reviews: array — optional pre-loaded reviews (skips API fetch if provided)
 */

// ── Helpers ───────────────────────────────────────────────

function relativeDate(dateStr) {
  if (!dateStr) return "";
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `Il y a ${weeks} semaine${weeks > 1 ? "s" : ""}`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `Il y a ${months} mois`;
  }
  const years = Math.floor(diffDays / 365);
  return `Il y a ${years} an${years > 1 ? "s" : ""}`;
}

function truncateText(text, max = 150) {
  if (!text || text.length <= max) return { text: text || "", truncated: false };
  return { text: text.slice(0, max).replace(/\s+\S*$/, "") + "…", truncated: true };
}

// Google "G" logo as inline SVG
function GoogleLogo({ className }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

// ── Skeleton loader ───────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-background p-5 shadow-sm animate-pulse" style={{ borderRadius: "var(--page-radius, 12px)" }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gray-200" />
        <div className="flex-1">
          <div className="h-3.5 w-24 bg-gray-200 rounded mb-1.5" />
          <div className="h-2.5 w-16 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-4 h-4 bg-gray-200 rounded" />
        ))}
      </div>
      <div className="space-y-1.5">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="h-3 bg-gray-100 rounded w-3/4" />
      </div>
    </div>
  );
}

// ── Review card ───────────────────────────────────────────

function ReviewCard({ review, expanded, onToggle }) {
  const { text: displayText, truncated } = truncateText(review.reviewText, 150);
  const showFull = expanded || !truncated;

  return (
    <div
      className="bg-background p-5 shadow-sm h-full flex flex-col"
      style={{ borderRadius: "var(--page-radius, 12px)" }}
    >
      {/* Reviewer */}
      <div className="flex items-center gap-3 mb-3">
        {review.reviewerPhotoUrl ? (
          <img
            src={review.reviewerPhotoUrl}
            alt=""
            className="w-10 h-10 rounded-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[hsl(var(--page-accent))]/20 flex items-center justify-center text-sm font-semibold text-[hsl(var(--page-accent))]">
            {(review.reviewerName || "A").charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[hsl(var(--page-text))] text-sm truncate">
            {review.reviewerName}
          </p>
          <p className="text-xs text-[hsl(var(--page-text-muted))]">
            {relativeDate(review.publishedAt)}
          </p>
        </div>
        <GoogleLogo className="shrink-0 opacity-60" />
      </div>

      {/* Stars */}
      <div className="flex items-center gap-0.5 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className="w-4 h-4 fill-[hsl(var(--page-accent))] text-[hsl(var(--page-accent))]"
          />
        ))}
      </div>

      {/* Text */}
      <p className="text-[hsl(var(--page-text-muted))] leading-relaxed text-sm flex-1">
        {showFull ? review.reviewText : displayText}
      </p>
      {truncated && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
          className="text-[hsl(var(--page-accent))] text-xs font-medium mt-2 hover:underline cursor-pointer self-start"
        >
          {expanded ? "Voir moins" : "Lire la suite"}
        </button>
      )}
    </div>
  );
}

// ── Main widget ───────────────────────────────────────────

export default function GoogleReviewsWidget({
  therapistId,
  layout = "carousel",
  heading,
  subtitle,
  googleMapsUrl,
  googleProfileName,
  viewMode = "desktop",
  reviews: preloadedReviews,
}) {
  const [reviews, setReviews] = useState(preloadedReviews || []);
  const [loading, setLoading] = useState(!preloadedReviews);
  const [error, setError] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [isPaused, setIsPaused] = useState(false);
  const autoplayRef = useRef(null);
  const observerRef = useRef(null);
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(!!preloadedReviews);
  const touchStartRef = useRef(null);

  // ── Lazy load: only fetch when scrolled into view ──────
  useEffect(() => {
    if (preloadedReviews) return;
    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observerRef.current?.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observerRef.current.observe(containerRef.current);

    return () => observerRef.current?.disconnect();
  }, [preloadedReviews]);

  // ── Fetch reviews ──────────────────────────────────────
  useEffect(() => {
    if (preloadedReviews || !isVisible || !therapistId) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/public/reviews/${therapistId}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled) {
          setReviews(data.reviews || []);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [therapistId, isVisible, preloadedReviews]);

  // ── Carousel: visible count based on viewport ──────────
  const visibleCount = viewMode === "mobile" ? 1 : viewMode === "tablet" ? 2 : 3;
  const maxIndex = Math.max(0, reviews.length - visibleCount);

  const goTo = useCallback((idx) => {
    setCurrentIndex(Math.max(0, Math.min(idx, maxIndex)));
  }, [maxIndex]);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // ── Auto-advance every 5s, pause on hover ─────────────
  useEffect(() => {
    if (layout !== "carousel" || isPaused || reviews.length <= visibleCount) return;
    autoplayRef.current = setInterval(goNext, 5000);
    return () => clearInterval(autoplayRef.current);
  }, [layout, isPaused, goNext, reviews.length, visibleCount]);

  // ── Touch swipe ────────────────────────────────────────
  const handleTouchStart = (e) => {
    touchStartRef.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartRef.current === null) return;
    const diff = touchStartRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goNext() : goPrev();
    }
    touchStartRef.current = null;
  };

  // ── Toggle expanded review ─────────────────────────────
  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Don't render if no reviews, error, or still loading with no container
  if (error) return <div ref={containerRef} />;
  if (!loading && reviews.length === 0) return <div ref={containerRef} />;

  // ── JSON-LD structured data for SEO rich snippets ──────
  const jsonLd = !loading && reviews.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    ...(googleProfileName ? { name: googleProfileName } : {}),
    ...(googleMapsUrl ? { url: googleMapsUrl } : {}),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      reviewCount: String(reviews.length),
      bestRating: "5",
      worstRating: "1",
    },
    review: reviews.map((r) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: r.reviewerName,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: "5",
        bestRating: "5",
      },
      reviewBody: r.reviewText,
      ...(r.publishedAt ? { datePublished: r.publishedAt.split("T")[0] } : {}),
    })),
  } : null;

  return (
    <div
      ref={containerRef}
      id="page-google-reviews"
      className={cn("py-12 scroll-mt-16", viewMode === "mobile" ? "px-5" : "px-8")}
    >
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {/* Header */}
      <div className="text-center mb-8">
        <span className="text-[hsl(var(--page-accent))] text-sm font-medium">
          {subtitle ?? "Témoignages"}
        </span>
        <h2
          className={cn(
            "font-display font-bold text-[hsl(var(--page-text))] mt-2",
            viewMode === "mobile" ? "text-2xl" : "text-3xl"
          )}
        >
          {heading ?? "Ce que disent nos patients"}
        </h2>

        {/* Google badge */}
        {!loading && reviews.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-3">
            <GoogleLogo />
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <span className="text-sm text-[hsl(var(--page-text-muted))]">
              {reviews.length} avis sur
            </span>
            {googleMapsUrl ? (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-[hsl(var(--page-accent))] hover:underline"
              >
                Google
              </a>
            ) : (
              <span className="text-sm font-medium text-[hsl(var(--page-text))]">Google</span>
            )}
          </div>
        )}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div
          className={cn(
            "grid gap-4 max-w-6xl mx-auto",
            viewMode === "mobile" ? "grid-cols-1" : "grid-cols-3"
          )}
        >
          {Array.from({ length: viewMode === "mobile" ? 1 : 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Carousel layout */}
      {!loading && layout === "carousel" && reviews.length > 0 && (
        <div className="max-w-6xl mx-auto relative">
          <div
            className="overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
              }}
            >
              {reviews.map((review, i) => (
                <div
                  key={review.reviewUrl || i}
                  className="shrink-0 px-2"
                  style={{ width: `${100 / visibleCount}%` }}
                >
                  <ReviewCard
                    review={review}
                    expanded={expandedIds.has(i)}
                    onToggle={() => toggleExpand(i)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation arrows — desktop only */}
          {viewMode !== "mobile" && reviews.length > visibleCount && (
            <>
              <button
                onClick={goPrev}
                className="absolute -left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer z-10"
                aria-label="Avis précédent"
              >
                <ChevronLeft className="w-4 h-4 text-[hsl(var(--page-text))]" />
              </button>
              <button
                onClick={goNext}
                className="absolute -right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer z-10"
                aria-label="Avis suivant"
              >
                <ChevronRight className="w-4 h-4 text-[hsl(var(--page-text))]" />
              </button>
            </>
          )}

          {/* Dots */}
          {reviews.length > visibleCount && (
            <div className="flex items-center justify-center gap-1.5 mt-6">
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={cn(
                    "rounded-full transition-all cursor-pointer",
                    i === currentIndex
                      ? "w-6 h-2 bg-[hsl(var(--page-accent))]"
                      : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
                  )}
                  aria-label={`Aller au groupe ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Grid layout */}
      {!loading && layout === "grid" && reviews.length > 0 && (
        <div
          className={cn(
            "grid gap-4 max-w-6xl mx-auto",
            viewMode === "mobile" ? "grid-cols-1" : "grid-cols-2"
          )}
        >
          {reviews.map((review, i) => (
            <ReviewCard
              key={review.reviewUrl || i}
              review={review}
              expanded={expandedIds.has(i)}
              onToggle={() => toggleExpand(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Export helpers for testing
export { relativeDate, truncateText };
