/**
 * Proofreading Elements Registry
 *
 * This file defines all elements that can be proofread in the linear review flow.
 * Each element has a unique ID that matches the data-proofread-id attribute in PagePreview.
 * Elements are ordered top-down as they appear visually on the page.
 */

/**
 * Static elements that are always present
 * Ordered top-down as they appear on the page
 */
export const STATIC_PROOFREADING_ELEMENTS = [
  // ============================================
  // HERO SECTION (order 0-3)
  // ============================================
  {
    id: 'hero-title',
    section: 'Hero',
    label: 'Titre principal',
    type: 'textarea',
    path: 'content.title',
    order: 0,
    page: 'accueil',
  },
  {
    id: 'hero-subtitle',
    section: 'Hero',
    label: 'Sous-titre',
    type: 'textarea',
    path: 'content.subtitle',
    order: 1,
    page: 'accueil',
  },

  // ============================================
  // BADGES (order 20-21)
  // ============================================
  {
    id: 'badge-patients',
    section: 'Badges',
    label: 'Badge patients aidés',
    type: 'text',
    path: 'patientsBadge.icon,patientsBadge.value,patientsBadge.label',
    order: 20,
    page: 'accueil',
  },


  // ============================================
  // SPECIALTIES SECTION (order 41-42 for titles, 50-69 for items)
  // ============================================
  {
    id: 'section-specialties-title',
    section: 'Spécialités',
    label: 'Titre section Spécialités',
    type: 'textarea',
    path: 'content.specialtiesSectionTitle',
    order: 41,
    page: 'accueil',
  },
  {
    id: 'section-specialties-subtitle',
    section: 'Spécialités',
    label: 'Sous-titre section Spécialités',
    type: 'textarea',
    path: 'content.specialtiesSectionSubtitle',
    order: 42,
    page: 'accueil',
  },

  // ============================================
  // ABOUT SECTION (order 70-77)
  // ============================================
  {
    id: 'section-about-subtitle',
    section: 'À propos',
    label: 'Petit texte (nom du praticien)',
    type: 'text',
    path: 'content.aboutSectionSubtitle',
    order: 70,
    page: 'accueil',
  },
  {
    id: 'section-about-title',
    section: 'À propos',
    label: 'Titre section À propos',
    type: 'textarea',
    path: 'content.aboutSectionTitle',
    order: 71,
    page: 'accueil',
  },
  // Note: Rich text presentation is edited only in Setup modal (WYSIWYG), not inline
  {
    id: 'section-about-cta',
    section: 'À propos',
    label: 'Bouton À propos',
    type: 'text',
    path: 'content.aboutSectionCta',
    order: 77,
    page: 'accueil',
  },

  // ============================================
  // SESSION INFO SECTION (order 80-84)
  // ============================================
  {
    id: 'section-session-subtitle',
    section: 'Tarifs',
    label: 'Petit texte section Tarifs',
    type: 'text',
    path: 'content.sessionInfoSectionSubtitle',
    order: 80,
    page: 'accueil',
  },
  {
    id: 'section-session-title',
    section: 'Tarifs',
    label: 'Titre section Tarifs',
    type: 'text',
    path: 'content.sessionInfoSectionTitle',
    order: 81,
    page: 'accueil',
  },
  {
    id: 'session-duration',
    section: 'Tarifs',
    label: 'Durée de la séance',
    type: 'text',
    path: 'sessionInfo.durationIcon,sessionInfo.durationLabel,sessionInfo.duration',
    order: 82,
    page: 'accueil',
  },
  {
    id: 'session-price',
    section: 'Tarifs',
    label: 'Tarification',
    type: 'text',
    path: 'sessionInfo.priceIcon,sessionInfo.priceLabel,sessionInfo.price',
    order: 83,
    page: 'accueil',
  },
  {
    id: 'session-reimbursement',
    section: 'Tarifs',
    label: 'Remboursement',
    type: 'text',
    path: 'sessionInfo.reimbursementIcon,sessionInfo.reimbursementLabel,sessionInfo.reimbursement',
    order: 84,
    page: 'accueil',
  },

  // ============================================
  // REVIEWS SECTION (order 90-91)
  // ============================================
  {
    id: 'section-reviews-subtitle',
    section: 'Avis',
    label: 'Petit texte section Avis',
    type: 'text',
    path: 'content.reviewsSectionSubtitle',
    order: 90,
    page: 'accueil',
  },
  {
    id: 'section-reviews-title',
    section: 'Avis',
    label: 'Titre section Avis',
    type: 'text',
    path: 'content.reviewsSectionTitle',
    order: 91,
    page: 'accueil',
  },

  // ============================================
  // STEPS SECTION (order 100-101 for titles, 110-129 for items)
  // ============================================
  {
    id: 'section-steps-subtitle',
    section: 'Déroulement',
    label: 'Petit texte section Déroulement',
    type: 'text',
    path: 'content.stepsSectionSubtitle',
    order: 100,
    page: 'accueil',
  },
  {
    id: 'section-steps-title',
    section: 'Déroulement',
    label: 'Titre section Déroulement',
    type: 'text',
    path: 'content.stepsSectionTitle',
    order: 101,
    page: 'accueil',
  },

  // ============================================
  // FAQ SECTION (order 130 for title, 140-159 for items)
  // ============================================
  {
    id: 'section-faq-title',
    section: 'FAQ',
    label: 'Titre section FAQ',
    type: 'text',
    path: 'content.faqSectionTitle',
    order: 130,
    page: 'accueil',
  },

  // ============================================
  // MENTIONS LÉGALES PAGE (order 200+)
  // ============================================
  {
    id: 'legal-company-name',
    section: 'Éditeur du site',
    label: 'Nom / Raison sociale',
    type: 'text',
    path: 'legalContent.companyName',
    order: 200,
    page: 'mentions',
  },
  {
    id: 'legal-address',
    section: 'Éditeur du site',
    label: 'Adresse',
    type: 'text',
    path: 'legalContent.address',
    order: 201,
    page: 'mentions',
  },
  {
    id: 'legal-phone',
    section: 'Éditeur du site',
    label: 'Téléphone',
    type: 'text',
    path: 'legalContent.phone',
    order: 202,
    page: 'mentions',
  },
  {
    id: 'legal-email',
    section: 'Éditeur du site',
    label: 'Email',
    type: 'text',
    path: 'legalContent.email',
    order: 203,
    page: 'mentions',
  },
  {
    id: 'legal-siret',
    section: 'Éditeur du site',
    label: 'SIRET',
    type: 'text',
    path: 'legalContent.siret',
    order: 204,
    page: 'mentions',
  },
  {
    id: 'legal-publication-director',
    section: 'Directeur de publication',
    label: 'Directeur de la publication',
    type: 'text',
    path: 'legalContent.publicationDirector',
    order: 205,
    page: 'mentions',
  },
  {
    id: 'legal-hosting-provider',
    section: 'Hébergeur',
    label: "Nom de l'hébergeur",
    type: 'text',
    path: 'legalContent.hostingProvider',
    order: 206,
    page: 'mentions',
  },
  {
    id: 'legal-hosting-address',
    section: 'Hébergeur',
    label: "Adresse de l'hébergeur",
    type: 'text',
    path: 'legalContent.hostingAddress',
    order: 207,
    page: 'mentions',
  },
];

/**
 * Generate dynamic elements based on current data
 */
export function generateDynamicElements(data) {
  const elements = [];

  // LOCATIONS (order 10-19)
  data.locations.forEach((loc, index) => {
    elements.push({
      id: `location-${index}`,
      section: 'Cabinets',
      label: `Cabinet: ${loc.title}`,
      type: 'text',
      path: `locations[${index}].icon,locations[${index}].title,locations[${index}].address`,
      order: 10 + index,
      page: 'accueil',
    });
  });

  // FEATURES (order 30-39)
  data.features.forEach((feature, index) => {
    elements.push({
      id: `feature-${index}`,
      section: 'Points forts',
      label: `Point fort: ${feature.title}`,
      type: 'text',
      path: `features[${index}].icon,features[${index}].title,features[${index}].desc`,
      order: 30 + index,
      page: 'accueil',
    });
  });


  // SESSION STEPS (order 110-129)
  data.sessionSteps.forEach((step, index) => {
    elements.push({
      id: `step-${index}`,
      section: 'Déroulement',
      label: `Étape ${index + 1}: ${step.title}`,
      type: 'textarea',
      path: `sessionSteps[${index}].title,sessionSteps[${index}].desc`,
      order: 110 + index,
      page: 'accueil',
    });
  });

  // FAQ (order 140-159)
  data.faqItems.forEach((item, index) => {
    elements.push({
      id: `faq-${index}`,
      section: 'FAQ',
      label: `Question: ${item.question.slice(0, 30)}...`,
      type: 'textarea',
      path: `faqItems[${index}].question,faqItems[${index}].answer`,
      order: 140 + index,
      page: 'accueil',
    });
  });

  return elements;
}

/**
 * Get all proofreading elements in order
 */
export function getAllProofreadingElements(data) {
  const dynamicElements = generateDynamicElements(data);
  const allElements = [...STATIC_PROOFREADING_ELEMENTS, ...dynamicElements];

  // Sort by order
  return allElements.sort((a, b) => a.order - b.order);
}

/**
 * Get unique sections in order
 */
export function getSections(elements) {
  const sections = [];
  elements.forEach(el => {
    if (!sections.includes(el.section)) {
      sections.push(el.section);
    }
  });
  return sections;
}

/**
 * Page labels for display
 */
export const PAGE_LABELS = {
  accueil: 'Accueil',
  mentions: 'Mentions légales',
};
