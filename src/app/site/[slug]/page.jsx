"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import PagePreview from "@/components/site-editor/PagePreview";
import { colorPalettes, typographyPairs, radiusOptions } from "@/components/site-editor/StylePanel";
import { useTrackCTA } from "@/hooks/useTrackCTA";

export default function PublicSitePage() {
  const { slug } = useParams();
  const [siteData, setSiteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { trackClick } = useTrackCTA({ therapistId: slug, pageSlug: slug });

  const handleCTAClick = (field, placement) => {
    if (placement) trackClick(placement, "cta_rdv_click");
    const link = siteData?.globalSettings?.appointmentLink || "https://doctolib.fr/";
    window.open(link, "_blank");
  };

  useEffect(() => {
    if (!slug) return;

    (async () => {
      try {
        const res = await fetch(`/api/public/site/${slug}?_t=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) {
          setError("Site introuvable.");
          setLoading(false);
          return;
        }
        const json = await res.json();
        setSiteData(json.data);
      } catch {
        setError("Erreur de chargement.");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  // Load Google Font
  useEffect(() => {
    if (!siteData?.styleSettings) return;
    const typo = typographyPairs.find(t => t.id === siteData.styleSettings.typography) || typographyPairs[0];
    const link = document.createElement("link");
    link.href = `https://fonts.googleapis.com/css2?family=${typo.googleFont}&display=swap`;
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, [siteData?.styleSettings?.typography]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-gray-300 animate-spin" />
      </div>
    );
  }

  if (error || !siteData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-600">{error || "Site introuvable."}</p>
          <p className="text-sm text-gray-400 mt-1">Ce site n'existe pas ou n'est plus disponible.</p>
        </div>
      </div>
    );
  }

  // Resolve styles
  const palette = colorPalettes.find(p => p.id === siteData.styleSettings?.palette) || colorPalettes[0];
  const typography = typographyPairs.find(t => t.id === siteData.styleSettings?.typography) || typographyPairs[0];
  const radius = radiusOptions.find(r => r.id === siteData.styleSettings?.radius) || radiusOptions[0];

  return (
    <div
      className="min-h-screen"
      style={{
        "--page-bg": palette.background,
        "--page-hero-bg": palette.heroBg,
        "--page-text": palette.text,
        "--page-text-muted": palette.textMuted,
        "--page-accent": palette.accent,
        "--page-accent-dark": palette.accentDark,
        "--page-font-display": `"${typography.display}", serif`,
        "--page-font-body": `"${typography.body}", sans-serif`,
        "--page-radius": radius.value,
      }}
    >
      <PagePreview
        content={siteData.content}
        viewMode="desktop"
        isPreviewMode={true}
        onCTAClick={handleCTAClick}
        locations={siteData.locations || []}
        ratingBadge={siteData.ratingBadge}
        patientsBadge={siteData.patientsBadge}
        features={siteData.features}
        painTypes={siteData.painTypes}
        sessionSteps={siteData.sessionSteps}
        faqItems={siteData.faqItems}
        globalSettings={siteData.globalSettings}
        heroImage={siteData.heroImage}
        aboutImage={siteData.aboutImage}
        heroImagePosition={siteData.heroImagePosition || { x: 50, y: 50 }}
        therapistImagePosition={siteData.aboutImagePosition || { x: 50, y: 50 }}
        sessionInfo={siteData.sessionInfo}
        reviews={siteData.reviews || []}
        logo={siteData.logo}
        googleReviews={siteData.googleReviews || null}
        googleMapsUrl={siteData.googleMapsUrl}
        isGoogleConnected={!!siteData.googleReviews}
        googleProfileName={siteData.googleProfileName}
        googleProfilePhoto={siteData.googleProfilePhoto}
      />
    </div>
  );
}
