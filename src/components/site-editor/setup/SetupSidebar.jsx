'use client';

import { Check } from "lucide-react";
import { useSetup } from "./SetupContext";
import { STEP_REGISTRY, MAIN_STEP_IDS, ADVANCED_STEP_IDS } from "./constants";
import { cn } from "@/lib/utils";

export default function SetupSidebar() {
  const { state, goToStep, allMainDone, isModal, hideAdvanced } = useSetup();
  const { activeStepId, completedActionIds } = state;

  return (
    <>
      <div className={cn(isModal ? "p-4" : "bg-white border-2 border-gray-200 rounded-2xl p-5")}>
        {!isModal && <h2 className="text-base font-bold text-[#2D2D2D] mb-3">Configuration</h2>}
        <div className="flex flex-col gap-0.5">
          {MAIN_STEP_IDS.map((stepId) => {
            const step = STEP_REGISTRY[stepId];
            const isActive = stepId === activeStepId;
            const isDone = completedActionIds.includes(stepId);
            const Icon = step.icon;
            return (
              <button key={stepId} onClick={() => goToStep(stepId)} className={cn("flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer text-left", isActive ? (isModal ? "bg-color-1 text-white font-medium" : "text-[#FC6D41] font-semibold") : (isModal ? "text-gray-500 hover:bg-gray-50 hover:text-color-1" : "text-gray-600 hover:bg-gray-50"))}>
                {isModal ? (
                  <Icon className="w-4 h-4 shrink-0" />
                ) : isActive ? (
                  <div className="w-2 h-2 rounded-full bg-[#FC6D41] shrink-0" />
                ) : !allMainDone && isDone ? (
                  <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                ) : (
                  <div className="w-2 h-2 shrink-0" />
                )}
                {step.label}
              </button>
            );
          })}
        </div>
        {!isModal && !allMainDone && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
              <span>{completedActionIds.filter(id => MAIN_STEP_IDS.includes(id)).length}/{MAIN_STEP_IDS.length}</span>
            </div>
            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#FC6D41] rounded-full transition-all duration-300" style={{ width: `${(completedActionIds.filter(id => MAIN_STEP_IDS.includes(id)).length / MAIN_STEP_IDS.length) * 100}%` }} />
            </div>
          </div>
        )}
      </div>

      {!hideAdvanced && (
        <>
          {isModal && <div className="h-px bg-gray-100 mx-4" />}

          <div className={cn(isModal ? "p-4" : "bg-white border-2 border-gray-200 rounded-2xl p-5")}>
            {!isModal && <h2 className="text-sm font-bold text-[#2D2D2D] mb-3">Paramètres avancés</h2>}
            {isModal && <p className="px-3 pb-1.5 text-[10px] font-medium text-gray-300 uppercase tracking-wider">Avancés</p>}
            <div className="flex flex-col gap-0.5">
              {ADVANCED_STEP_IDS.map((stepId) => {
                const step = STEP_REGISTRY[stepId];
                const isActive = stepId === activeStepId;
                const Icon = step.icon;
                return (
                  <button key={stepId} onClick={() => goToStep(stepId)} className={cn("flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer text-left", isActive ? (isModal ? "bg-color-1 text-white font-medium" : "text-[#FC6D41] font-semibold") : (isModal ? "text-gray-500 hover:bg-gray-50 hover:text-color-1" : "text-gray-600 hover:bg-gray-50"))}>
                    {isModal ? (
                      <Icon className="w-4 h-4 shrink-0" />
                    ) : isActive ? (
                      <div className="w-2 h-2 rounded-full bg-[#FC6D41] shrink-0" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-gray-200 shrink-0" />
                    )}
                    {step.label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
