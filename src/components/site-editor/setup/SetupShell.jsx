'use client';

import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useSetup } from "./SetupContext";
import { STEP_REGISTRY, ALL_STEP_IDS, MAIN_STEP_IDS } from "./constants";
import SetupSidebar from "./SetupSidebar";
import { cn } from "@/lib/utils";

import ContactStep from "./steps/ContactStep";
import CabinetStep from "./steps/CabinetStep";
import TherapistsStep from "./steps/TherapistsStep";
import SpecialtiesStep from "./steps/SpecialtiesStep";
import GoogleStep from "./steps/GoogleStep";
import AvisStep from "./steps/AvisStep";
import RedactionStep from "./steps/RedactionStep";
import DomainStep from "./steps/DomainStep";
import CodeStep from "./steps/CodeStep";

const STEP_COMPONENTS = {
  contact: ContactStep,
  cabinet: CabinetStep,
  therapists: TherapistsStep,
  specialties: SpecialtiesStep,
  google: GoogleStep,
  avis: AvisStep,
  redaction: RedactionStep,
  domain: DomainStep,
  code: CodeStep,
};

export default function SetupShell() {
  const router = useRouter();
  const { state, goToStep, allMainDone, handleFinish, handleResetAll, isModal, onClose } = useSetup();
  const { activeStepId } = state;

  const StepComponent = STEP_COMPONENTS[activeStepId];
  const stepIdx = ALL_STEP_IDS.indexOf(activeStepId);
  const mainIdx = MAIN_STEP_IDS.indexOf(activeStepId);
  const isMainStep = mainIdx !== -1;

  // ── Modal layout ──────────────────────────────────────────────
  if (isModal) {
    return (
      <div className="flex h-full">
        <div className="w-[220px] shrink-0 border-r border-gray-100 flex flex-col overflow-y-auto">
          <div className="px-5 pt-5 pb-3">
            <h2 className="text-base font-bold text-[#2D2D2D]">Options du site</h2>
          </div>
          <SetupSidebar />
        </div>
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-4 pb-2">
            <h3 className="text-sm font-semibold text-color-1">{STEP_REGISTRY[activeStepId]?.label}</h3>
            <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-color-1 hover:bg-gray-100 transition-colors cursor-pointer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {StepComponent ? <StepComponent /> : null}
          </div>
        </div>
      </div>
    );
  }

  // ── Full-page layout ──────────────────────────────────────────
  return (
    <div className="h-screen bg-gray-50 overflow-hidden flex flex-col items-center" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
      {/* Top nav */}
      <nav className="w-full max-w-[1200px] px-6 pt-4 pb-1 shrink-0 z-[70]">
        <div className="flex items-center justify-between relative h-10">
          <button onClick={() => router.push("/editor/accueil")} className="flex items-center gap-2 text-gray-500 hover:text-color-1 transition-colors cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
            <span className="font-medium text-sm">Retourner sur l'éditeur</span>
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex gap-6 overflow-hidden w-full max-w-[1200px] px-6 py-4 min-h-0" style={{ animation: "tab-fade-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}>
        {/* Left sidebar */}
        <div className="w-[240px] shrink-0 flex flex-col gap-3">
          <SetupSidebar />
          <button onClick={handleResetAll} className="mt-auto text-[10px] text-gray-300 hover:text-gray-500 transition-colors cursor-pointer self-start px-2 py-1">
            Reset demo
          </button>
        </div>

        {/* Right content */}
        <div className="flex-1 min-h-0">
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 h-full flex flex-col">
            <div className="flex-1">
              {StepComponent ? <StepComponent /> : null}
            </div>

            {/* Step navigation — only during guided flow for main steps */}
            {isMainStep && !allMainDone && (
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                <button
                  onClick={() => mainIdx > 0 && goToStep(MAIN_STEP_IDS[mainIdx - 1])}
                  className={cn("flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer", mainIdx > 0 ? "text-gray-600 hover:bg-gray-100" : "text-gray-300 cursor-not-allowed")}
                  disabled={mainIdx === 0}
                >
                  <ArrowLeft size={14} />
                  Précédent
                </button>
                <span className="text-xs text-gray-400">{mainIdx + 1} sur {MAIN_STEP_IDS.length}</span>
                {mainIdx < MAIN_STEP_IDS.length - 1 ? (
                  <button onClick={() => goToStep(MAIN_STEP_IDS[mainIdx + 1])} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FC6D41] text-white text-sm font-medium hover:bg-[#e55e35] transition-colors cursor-pointer">
                    Suivant
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button onClick={handleFinish} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors cursor-pointer">
                    <Check size={14} />
                    Terminer
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
