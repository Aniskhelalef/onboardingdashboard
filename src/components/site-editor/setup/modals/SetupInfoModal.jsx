'use client'

import { useState } from 'react'
import { useSetup } from '../SetupContext'
import SetupModalLayout from './SetupModalLayout'
import ContactStep from '../steps/ContactStep'
import CabinetStep from '../steps/CabinetStep'
import TherapistsStep from '../steps/TherapistsStep'

const TABS = [
  { id: 'contact', label: 'Contact', sectionId: 'contact' },
  { id: 'cabinet', label: 'Cabinet', sectionId: 'locations' },
  { id: 'therapists', label: 'Thérapeutes', sectionId: 'therapists' },
]

const STEP_MAP = { contact: ContactStep, cabinet: CabinetStep, therapists: TherapistsStep }

export default function SetupInfoModal({ onClose }) {
  const { state, goToStep, handleValidateSection } = useSetup()
  const { completedActionIds } = state

  const firstIncomplete = TABS.find(t => !completedActionIds.includes(t.id))?.id || 'contact'
  const [tab, setTab] = useState(firstIncomplete)
  const StepComponent = STEP_MAP[tab]

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
      title="Informations"
      icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FC6D41" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
      tabs={tabsWithDone}
      activeTab={tab}
      onTabChange={saveAndSwitch}
      onClose={handleClose}
    >
      {StepComponent && <StepComponent />}
    </SetupModalLayout>
  )
}
