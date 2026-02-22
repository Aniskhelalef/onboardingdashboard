'use client'

import { useState } from 'react'
import { useSetup } from '../SetupContext'
import SetupModalLayout from './SetupModalLayout'
import GoogleStep from '../steps/GoogleStep'
import AvisStep from '../steps/AvisStep'

const TABS = [
  { id: 'google', label: 'Google', sectionId: 'google' },
  { id: 'whatsapp', label: 'WhatsApp', sectionId: 'reviewTemplates' },
  { id: 'sms', label: 'SMS', sectionId: 'reviewTemplates' },
  { id: 'email', label: 'Email', sectionId: 'reviewTemplates' },
]

export default function SetupVisModal({ onClose }) {
  const { state, goToStep, handleValidateSection } = useSetup()
  const { completedActionIds } = state

  const firstIncomplete = TABS.find(t => !completedActionIds.includes(t.id))?.id || 'google'
  const [tab, setTab] = useState(firstIncomplete)

  const saveAndSwitch = (id) => {
    const current = TABS.find(t => t.id === tab)
    if (current) handleValidateSection(current.sectionId)
    setTab(id)
    goToStep(id)
  }

  const handleClose = () => {
    const current = TABS.find(t => t.id === tab)
    if (current) handleValidateSection(current.sectionId)
    onClose()
  }

  const tabsWithDone = TABS.map(t => ({
    ...t,
    done: completedActionIds.includes(t.id),
  }))

  return (
    <SetupModalLayout
      title="Visibilité"
      icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FC6D41" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
      tabs={tabsWithDone}
      activeTab={tab}
      onTabChange={saveAndSwitch}
      onClose={handleClose}
    >
      {tab === 'google' ? (
        <GoogleStep />
      ) : (
        <AvisStep channelId={tab} />
      )}
    </SetupModalLayout>
  )
}
