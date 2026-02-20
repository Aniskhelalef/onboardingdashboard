import { User, MapPin, Users, Star, Building2, MessageSquare, Globe, Code, MessageCircle, Phone, Mail } from "lucide-react";

// ── Step definitions ──────────────────────────────────────────────────

export const STEP_REGISTRY = {
  contact:     { label: "Contact",       icon: User,          group: "main",     dataKey: "contact" },
  cabinet:     { label: "Cabinet",       icon: MapPin,        group: "main",     dataKey: "locations" },
  therapists:  { label: "Thérapeutes",   icon: Users,         group: "main",     dataKey: "therapists" },
  specialties: { label: "Spécialités",   icon: Star,          group: "main",     dataKey: "specialties" },
  google:      { label: "Google",        icon: Building2,     group: "main",     dataKey: "google" },
  avis:        { label: "Avis",          icon: MessageSquare, group: "main",     dataKey: "reviewTemplates" },
  domain:      { label: "Domaine",       icon: Globe,         group: "advanced", dataKey: "domain" },
  code:        { label: "Code",          icon: Code,          group: "advanced", dataKey: "customCode" },
};

export const MAIN_STEP_IDS = ["contact", "cabinet", "therapists", "specialties", "google", "avis"];
export const ADVANCED_STEP_IDS = ["domain", "code"];
export const ALL_STEP_IDS = [...MAIN_STEP_IDS, ...ADVANCED_STEP_IDS];

// Maps data section key → completedActions action ID
export const DATA_KEY_TO_ACTION_ID = {
  contact: "contact",
  locations: "cabinet",
  therapists: "therapists",
  specialties: "specialties",
  google: "google",
  reviewTemplates: "avis",
  domain: "domain",
  customCode: "code",
};

// ── Default data ──────────────────────────────────────────────────────

export const DEFAULT_SPECIALTIES = [
  { id: "1", icon: "🦴", title: "Douleurs musculaires", description: "Traitement des tensions, contractures et douleurs musculaires" },
  { id: "2", icon: "🤰", title: "Femmes enceintes", description: "Accompagnement de la grossesse et du post-partum" },
  { id: "3", icon: "👶", title: "Nourrissons", description: "Prise en charge des bébés et jeunes enfants" },
  { id: "4", icon: "⚽", title: "Sportifs", description: "Optimisation des performances et récupération" },
  { id: "5", icon: "💼", title: "Troubles posturaux", description: "Correction des déséquilibres liés au travail de bureau" },
  { id: "6", icon: "🧓", title: "Seniors", description: "Maintien de la mobilité et du confort au quotidien" },
];

export const DEFAULT_REVIEW_TEMPLATES = {
  googleLink: "",
  whatsapp: { message: "Bonjour ! 😊 Merci pour votre visite. Si vous avez apprécié votre consultation, un petit avis Google nous aiderait beaucoup :\n{link}\nMerci et à bientôt !" },
  sms: { message: "Bonjour, merci pour votre visite ! Votre avis compte beaucoup pour nous : {link}. Merci !" },
  email: { subject: "Votre avis compte pour nous", message: "Bonjour,\n\nMerci pour votre visite au cabinet. Si vous avez apprécié votre consultation, un avis Google nous aiderait beaucoup à aider d'autres patients à nous trouver.\n\nVoici le lien : {link}\n\nMerci beaucoup et à bientôt !" },
};

export const DEFAULT_SETUP_DATA = {
  contact: { firstName: "", lastName: "", profession: "", city: "", phoneNumber: "", appointmentLink: "" },
  locations: [],
  therapists: [],
  specialties: [],
  google: { connected: false, profile: null },
  customCode: [],
  reviewTemplates: DEFAULT_REVIEW_TEMPLATES,
};

// ── Emojis & icon mapping ─────────────────────────────────────────────

export const SPECIALTY_EMOJIS = ["🦴", "🤰", "👶", "⚽", "💼", "🧓", "🧠", "💆", "🏃", "❤️", "🌿", "🔥", "🎯", "✨", "🩺", "🧘", "😴", "🦵", "👩‍⚕️", "🤕"];

const ICON_MAPPING = {
  spine: "🦴", bone: "🦴", back: "🦴", posture: "💼", activity: "⚽", sport: "⚽",
  brain: "🧠", stress: "🧠", baby: "👶", pediatric: "👶", nourrisson: "👶",
  pregnant: "🤰", pregnancy: "🤰", senior: "🧓", elderly: "🧓", muscle: "💪",
  head: "🤕", migraine: "🤕", joint: "🦵", knee: "🦵", shoulder: "🦴", neck: "🦴",
  default: "✨",
};

export const getIconEmoji = (icon) => {
  if (/[^\x00-\x7F]/.test(icon)) return icon;
  return ICON_MAPPING[icon.toLowerCase()] || ICON_MAPPING.default;
};

// ── Review channels ───────────────────────────────────────────────────

export const REVIEW_CHANNELS = [
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "bg-green-500", getUrl: (msg) => `https://wa.me/?text=${encodeURIComponent(msg)}`, hasSubject: false },
  { id: "sms", label: "SMS", icon: Phone, color: "bg-blue-500", getUrl: (msg) => `sms:?body=${encodeURIComponent(msg)}`, hasSubject: false },
  { id: "email", label: "Email", icon: Mail, color: "bg-purple-500", getUrl: (msg, subj) => `mailto:?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(msg)}`, hasSubject: true },
];

// ── Migration helper ──────────────────────────────────────────────────

export const migrateParagraphsToRichText = (therapist) => {
  if (therapist.richTextPresentation) return therapist;
  const paragraphs = [therapist.paragraph1, therapist.paragraph2, therapist.paragraph3, therapist.paragraph4, therapist.paragraph5].filter(p => p && p.trim());
  const richTextPresentation = paragraphs.length > 0
    ? paragraphs.map(p => `<p>${p}</p>`).join("")
    : "<p>Diplômé(e) en ostéopathie, je vous accueille dans mon cabinet pour vous accompagner vers un mieux-être durable.</p><p>Mon approche se veut globale et personnalisée : chaque patient est unique, chaque douleur a son histoire.</p>";
  return { id: therapist.id, accroche: therapist.accroche || "", richTextPresentation, price: therapist.price || "", duration: therapist.duration || "", reimbursement: therapist.reimbursement || "", photo: therapist.photo || "" };
};
