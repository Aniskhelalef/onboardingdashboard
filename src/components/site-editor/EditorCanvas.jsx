import PagePreview from "./PagePreview";
import { cn } from "@/lib/utils";

const EditorCanvas = ({
  content,
  onContentChange,
  viewMode,
  isPreviewMode = false,
  locations,
  ratingBadge,
  patientsBadge,
  features,
  painTypes,
  sessionSteps,
  faqItems,
  globalSettings,
  heroImage,
  aboutImage,
  sessionInfo,
  reviews,
  isGoogleConnected,
  googleProfileName,
  googleProfilePhoto,
  onLocationClick,
  onRatingClick,
  onPatientsClick,
  onFeatureClick,
  onPainTypeClick,
  onSessionStepClick,
  onFAQClick,
  onCTAClick,
  onGlobalSettingsClick,
  onHeroImageClick,
  onReviewsClick,
  onReviewClick,
  logo,
  onConnectGoogleClick,
  onSessionInfoClick,
  onReviewToggleVisibility,
  onLogoClick,
  onAboutSectionClick,
  onNextTherapist,
  therapistCount,
  onTherapistImageUpload,
  onTherapistImageCrop,
  onTherapistImagePosition,
  therapistImagePosition,
  onHeroImageUpload,
  onHeroImageCrop,
  onHeroImagePosition,
  heroImagePosition,
  isProofreadingActive,
  proofreadingElementId,
  elementStatuses,
  onInlineTextChange,
  clickPosition,
  canvasOpacity = 1,
  isMobileDevice = false,
}) => {
  // On actual mobile device: full width, subtle card styling
  // On desktop in mobile preview: 375px card with rounded corners
  const mobileClass = isMobileDevice
    ? "w-full rounded-xl shadow-md border border-gray-200"
    : "w-[375px] rounded-2xl shadow-lg border border-gray-300";

  return (
    <main
      className={cn(
        "bg-white overflow-hidden",
        !isMobileDevice && "mx-auto",
        viewMode === "mobile"
          ? mobileClass
          : "w-full max-w-6xl rounded-2xl shadow-lg border border-gray-300"
      )}
      style={{ opacity: canvasOpacity, transition: 'opacity 150ms ease-in-out' }}
    >
      <PagePreview
        content={content}
        onContentChange={onContentChange}
        viewMode={viewMode}
        isPreviewMode={isPreviewMode}
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
        logo={logo}
        sessionInfo={sessionInfo}
        reviews={reviews}
        isGoogleConnected={isGoogleConnected}
        googleProfileName={googleProfileName}
        googleProfilePhoto={googleProfilePhoto}
        onLocationClick={onLocationClick}
        onRatingClick={onRatingClick}
        onPatientsClick={onPatientsClick}
        onFeatureClick={onFeatureClick}
        onPainTypeClick={onPainTypeClick}
        onSessionStepClick={onSessionStepClick}
        onFAQClick={onFAQClick}
        onCTAClick={onCTAClick}
        onGlobalSettingsClick={onGlobalSettingsClick}
        onHeroImageClick={onHeroImageClick}
        onReviewsClick={onReviewsClick}
        onReviewClick={onReviewClick}
        onConnectGoogleClick={onConnectGoogleClick}
        onSessionInfoClick={onSessionInfoClick}
        onReviewToggleVisibility={onReviewToggleVisibility}
        onLogoClick={onLogoClick}
        onAboutSectionClick={onAboutSectionClick}
        onNextTherapist={onNextTherapist}
        therapistCount={therapistCount}
        onTherapistImageUpload={onTherapistImageUpload}
        onTherapistImageCrop={onTherapistImageCrop}
        onTherapistImagePosition={onTherapistImagePosition}
        therapistImagePosition={therapistImagePosition}
        onHeroImageUpload={onHeroImageUpload}
        onHeroImageCrop={onHeroImageCrop}
        onHeroImagePosition={onHeroImagePosition}
        heroImagePosition={heroImagePosition}
        isProofreadingActive={isProofreadingActive}
        proofreadingElementId={proofreadingElementId}
        elementStatuses={elementStatuses}
        onInlineTextChange={onInlineTextChange}
        clickPosition={clickPosition}
      />
    </main>
  );
};

export default EditorCanvas;
