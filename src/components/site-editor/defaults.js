// Default data constants for the editor
// Extracted from Index.tsx to reduce file size and improve maintainability

export const defaultLocations = [];

export const defaultRatingBadge = {
  value: "5/5",
  label: "Avis patients",
  icon: "⭐",
};

export const defaultPatientsBadge = {
  value: "+100",
  label: "Patients accompagnés",
  icon: "😊",
};

export const defaultFeatures = [
  { id: "1", icon: "🏆", title: "Expérience", desc: "Des années de pratique à votre service" },
  { id: "2", icon: "👥", title: "Séances personnalisées", desc: "Un traitement adapté à chaque patient" },
  { id: "3", icon: "⏱️", title: "Soulagement rapide", desc: "Des résultats dès les premières séances" },
  { id: "4", icon: "📍", title: "Cabinet facile d'accès", desc: "Accès facilité pour tous" },
];

export const defaultPainTypes = [
  { id: "1", icon: "🦴", title: "Douleurs dorsales", desc: "Soulagement des douleurs du dos, lombalgies et sciatiques par des techniques douces et adaptées." },
  { id: "2", icon: "🤕", title: "Maux de tête", desc: "Traitement des céphalées et migraines en travaillant sur les tensions cervicales et crâniennes." },
  { id: "3", icon: "🏃", title: "Blessures sportives", desc: "Récupération et prévention des blessures liées à la pratique sportive." },
  { id: "4", icon: "👶", title: "Pédiatrie", desc: "Accompagnement des nourrissons et enfants pour un développement harmonieux." },
  { id: "5", icon: "🤰", title: "Grossesse", desc: "Suivi des femmes enceintes pour soulager les tensions liées à la grossesse." },
  { id: "6", icon: "😴", title: "Troubles du sommeil", desc: "Amélioration de la qualité du sommeil en travaillant sur les tensions corporelles." },
];

export const defaultSessionSteps = [
  { id: "1", num: 1, title: "Échange et écoute", desc: "Discussion approfondie sur vos antécédents et symptômes actuels." },
  { id: "2", num: 2, title: "Bilan et évaluation", desc: "Évaluation complète pour comprendre vos besoins." },
  { id: "3", num: 3, title: "Traitement adapté", desc: "Techniques adaptées à vos besoins spécifiques." },
  { id: "4", num: 4, title: "Conseils personnalisés", desc: "Recommandations pour maintenir les bénéfices du traitement." },
];

export const defaultFAQItems = [
  { id: "1", question: "Comment se déroule une première consultation ?", answer: "" },
  { id: "2", question: "Combien de séances sont généralement nécessaires ?", answer: "" },
  { id: "3", question: "Quels sont les modes de paiement acceptés ?", answer: "" },
  { id: "4", question: "Êtes-vous remboursé par les mutuelles ?", answer: "" },
];

export const defaultContent = {
  badge: "Votre profession à Votre ville",
  title: "Soulagez vos douleurs chroniques.",
  subtitle: "Reprenez pleinement le contrôle de vos douleurs pour retrouver une liberté de mouvement optimale.",
  ctaPrimary: "Prendre Rendez-Vous En Ligne",
  ctaSecondary: "",
  specialtiesSectionTitle: "Des solutions adaptées à chaque douleur",
  specialtiesSectionSubtitle: "Découvrez comment l'ostéopathie peut vous aider à soulager vos douleurs",
  sessionInfoSectionTitle: "Tarifs & Remboursement",
  sessionInfoSectionSubtitle: "Informations pratiques",
  reviewsSectionTitle: "Ce que disent nos patients",
  reviewsSectionSubtitle: "Témoignages",
  stepsSectionTitle: "Déroulement d'une séance",
  stepsSectionSubtitle: "Le guide d'information",
  faqSectionTitle: "Des Questions ?",
  aboutSectionSubtitle: "",
  aboutSectionTitle: "Et si vous retrouviez confort et mobilité ?",
  aboutRichTextPresentation: "<p>Diplômé(e) en ostéopathie, je vous accueille dans mon cabinet pour vous accompagner vers un mieux-être durable.</p><p>Mon approche se veut globale et personnalisée : chaque patient est unique, chaque douleur a son histoire.</p><p>Passionné(e) par mon métier depuis de nombreuses années, j'ai à cœur de comprendre l'origine de vos douleurs.</p><p>Ma pratique s'appuie sur des techniques douces et respectueuses de votre corps.</p><p>Je suis là pour vous écouter et vous proposer un traitement adapté à vos besoins.</p>",
  aboutSectionCta: "En savoir plus",
};

export const defaultGlobalSettings = {
  firstName: "",
  lastName: "",
  profession: "",
  city: "",
  appointmentLink: "",
  phoneNumber: "",
};

export const defaultIdentitySettings = {
  favicon: "",
  logo: "",
};

export const defaultStyleSettings = {
  palette: "warm",
  typography: "playfair-lato",
  radius: "rounded",
};
