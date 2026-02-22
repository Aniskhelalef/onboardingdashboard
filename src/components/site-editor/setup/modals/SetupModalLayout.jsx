'use client'

import { cn } from '@/lib/utils'

export default function SetupModalLayout({ title, icon, tabs, activeTab, onTabChange, onClose, children }) {
  const tabIdx = tabs.findIndex(t => t.id === activeTab)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative bg-white rounded-2xl overflow-hidden w-[720px] max-w-[90vw] h-[520px] flex"
        onClick={e => e.stopPropagation()}
        style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'tab-fade-in 0.15s ease-out' }}
      >
        {/* Left sidebar */}
        <div className="w-[200px] shrink-0 border-r border-gray-100 py-5 px-3 flex flex-col">
          <div className="flex items-center gap-2 px-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-color-2/15 flex items-center justify-center shrink-0">
              {icon}
            </div>
            <h2 className="text-[13px] font-bold text-color-1">{title}</h2>
          </div>
          <div className="flex flex-col gap-0.5">
            {tabs.map((tab, i) => {
              const isCurrent = activeTab === tab.id
              const isDone = tab.done
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    'flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-all cursor-pointer',
                    isCurrent ? 'bg-color-2/10 text-color-2'
                    : isDone ? 'text-green-600'
                    : 'text-gray-300 hover:text-gray-500 hover:bg-gray-50'
                  )}
                >
                  <span className={cn(
                    'w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0',
                    isCurrent ? 'bg-color-2 text-white'
                    : isDone ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-400'
                  )}>
                    {isDone && !isCurrent ? (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : i + 1}
                  </span>
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Right content */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold text-color-1">
                {tabs[tabIdx]?.label || title}
              </h3>
              {tabs.length > 1 && (
                <span className="text-[11px] font-medium text-gray-300">
                  Étape {tabIdx + 1} / {tabs.length}
                </span>
              )}
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          {/* Step content */}
          <div className="flex-1 overflow-hidden px-6 py-4 flex flex-col">
            <div className="flex-1 min-h-0" style={{ animation: 'tab-fade-in 0.2s ease' }}>
              {children}
            </div>

            {/* Footer CTA */}
            <div className="shrink-0 pt-3">
              {tabs.length > 1 && tabIdx < tabs.length - 1 ? (
                <button
                  onClick={() => onTabChange(tabs[tabIdx + 1].id)}
                  className="w-full py-2.5 rounded-xl text-[13px] font-medium flex items-center justify-center gap-2 bg-[#FC6D41] text-white hover:bg-[#e55e35] cursor-pointer transition-all"
                >
                  Suivant
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl text-[13px] font-medium flex items-center justify-center gap-2 bg-green-500 text-white hover:bg-green-600 cursor-pointer transition-all"
                >
                  Terminer
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
