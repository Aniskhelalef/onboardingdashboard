'use client';

import { Sparkles } from "lucide-react";
import { useSetup } from "../SetupContext";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const TONES = [
  { id: "professionnel", label: "Professionnel" },
  { id: "chaleureux", label: "Chaleureux" },
  { id: "expert", label: "Expert" },
];

const STYLES = [
  { id: "informatif", label: "Informatif" },
  { id: "conversationnel", label: "Conversationnel" },
  { id: "pedagogique", label: "Pédagogique" },
];

const PRONOUNS = [
  { id: "nous", label: "Nous", desc: '"Nous vous accueillons..."' },
  { id: "je", label: "Je", desc: '"Je vous accueille..."' },
  { id: "on", label: "On", desc: '"On vous accueille..."' },
];

function getPreviewText(tone, style, pronoun) {
  const pronoms = {
    nous: { subject: "Nous", verb: "proposons", accueil: "accueillons", invite: "invitons", souhait: "souhaitons", possessif: "notre", possessifPl: "nos" },
    je: { subject: "Je", verb: "propose", accueil: "accueille", invite: "invite", souhait: "souhaite", possessif: "mon", possessifPl: "mes" },
    on: { subject: "On", verb: "propose", accueil: "accueille", invite: "invite", souhait: "souhaite", possessif: "notre", possessifPl: "nos" },
  };
  const p = pronoms[pronoun] || pronoms.nous;
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  const previews = {
    professionnel: {
      informatif: `${p.subject} ${p.verb} des séances de kinésithérapie adaptées à chaque patient. ${cap(p.possessifPl)} protocoles sont élaborés selon les dernières recommandations de la HAS afin d'assurer une prise en charge optimale.`,
      conversationnel: `${p.subject} ${p.accueil} chaque patient avec attention. Vous avez des douleurs lombaires ? ${cap(p.possessifPl)} séances de rééducation sont conçues pour répondre précisément à ${p.possessif} problématique.`,
      pedagogique: `La kinésithérapie vise à restaurer la mobilité et réduire la douleur. ${p.subject} ${p.verb} un bilan initial complet, puis ${pronoun === "nous" ? "nous mettons" : pronoun === "je" ? "je mets" : "on met"} en place un plan de traitement personnalisé, étape par étape.`,
    },
    chaleureux: {
      informatif: `${p.subject} ${p.accueil} dans un cadre bienveillant pour prendre soin de votre bien-être. ${cap(p.possessifPl)} séances de kinésithérapie sont pensées pour que vous vous sentiez écouté et accompagné à chaque instant.`,
      conversationnel: `Bienvenue ! ${p.subject} ${p.souhait} avant tout que vous vous sentiez à l'aise. ${p.subject} ${p.invite} à découvrir ${p.possessif} approche douce et personnalisée — parce que votre confort est ${p.possessif} priorité.`,
      pedagogique: `Prendre soin de soi, c'est d'abord comprendre son corps. ${p.subject} ${p.verb} de vous guider avec bienveillance : ensemble, ${pronoun === "je" ? "nous" : p.subject.toLowerCase()} verrons comment soulager vos tensions, pas à pas.`,
    },
    expert: {
      informatif: `${p.subject} ${p.verb} une prise en charge en kinésithérapie basée sur les données probantes. Évaluation posturale, thérapie manuelle et exercices fonctionnels : ${p.possessifPl} protocoles ciblent les mécanismes physiopathologiques sous-jacents.`,
      conversationnel: `Vous ressentez une raideur cervicale après de longues heures de travail ? ${p.subject} ${p.verb} une analyse biomécanique approfondie pour identifier les causes et adapter le traitement en conséquence.`,
      pedagogique: `Le rachis lombaire supporte l'essentiel des contraintes mécaniques du quotidien. ${p.subject} ${p.verb} de vous expliquer les mécanismes en jeu puis de mettre en œuvre un programme de renforcement ciblé et progressif.`,
    },
  };
  return previews[tone]?.[style] || previews.professionnel.informatif;
}

export default function RedactionStep() {
  const { state, dispatch, changedSections, handleValidateSection } = useSetup();
  const { tone, style, pronoun, systemPrompt } = state.data.redaction;

  const setField = (field, value) => dispatch({ type: "SET_REDACTION", payload: { [field]: value } });

  return (
    <div className="space-y-4" style={{ animation: "tab-fade-in 0.3s ease" }}>
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">Rédaction IA</h2>
        <p className="text-sm text-muted-foreground">Configurez le style et le ton de vos contenus générés par l'IA.</p>
      </div>

      {/* Tone */}
      <div className="space-y-2">
        <Label className="text-xs">Ton de communication</Label>
        <div className="flex gap-2">
          {TONES.map((t) => (
            <button key={t.id} onClick={() => setField("tone", t.id)} className={cn("flex-1 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer", tone === t.id ? "bg-color-1 text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-150")}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Style */}
      <div className="space-y-2">
        <Label className="text-xs">Style de rédaction</Label>
        <div className="flex gap-2">
          {STYLES.map((s) => (
            <button key={s.id} onClick={() => setField("style", s.id)} className={cn("flex-1 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer", style === s.id ? "bg-color-1 text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-150")}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pronoun */}
      <div className="space-y-2">
        <Label className="text-xs">Pronom utilisé</Label>
        <div className="flex gap-2">
          {PRONOUNS.map((p) => (
            <button key={p.id} onClick={() => setField("pronoun", p.id)} className={cn("flex-1 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex flex-col items-center gap-0.5", pronoun === p.id ? "bg-color-1 text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-150")}>
              <span>{p.label}</span>
              <span className={cn("text-[9px]", pronoun === p.id ? "text-white/60" : "text-gray-400")}>{p.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* System prompt */}
      <div className="space-y-1.5">
        <Label className="text-xs">Instructions supplémentaires</Label>
        <Textarea value={systemPrompt} onChange={(e) => setField("systemPrompt", e.target.value)} placeholder="Ex: Toujours mentionner que le cabinet est accessible PMR. Éviter le jargon médical trop technique. Mettre en avant l'approche douce..." className="text-sm min-h-[80px] resize-none" />
        <p className="text-[10px] text-muted-foreground">Ces instructions seront appliquées à tous les contenus générés par l'IA (articles, descriptions, etc.)</p>
      </div>

      {/* Preview */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles size={12} className="text-color-2" />
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Aperçu du style</span>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">{getPreviewText(tone, style, pronoun)}</p>
      </div>

      <button onClick={() => handleValidateSection("redaction")} className={cn("px-5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer", changedSections.has("redaction") ? "bg-[#FC6D41] text-white hover:bg-[#e55e35]" : "bg-gray-100 text-gray-400")}>
        {state.validatedSection === "redaction" ? "Enregistré !" : "Enregistrer"}
      </button>
    </div>
  );
}
