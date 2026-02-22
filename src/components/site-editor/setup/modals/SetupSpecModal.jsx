'use client'

import { useEffect, useRef } from 'react'
import { useSetup } from '../SetupContext'
import SetupModalLayout from './SetupModalLayout'
import SpecialtiesStep from '../steps/SpecialtiesStep'

const TABS = [
  { id: 'specialties', label: 'Spécialités', sectionId: 'specialties' },
]

export default function SetupSpecModal({ onClose }) {
  const { state, handleValidateSection } = useSetup()
  const { completedActionIds } = state
  const wasComplete = useRef(completedActionIds.includes('specialties'))

  // Auto-close when specialties step is completed
  useEffect(() => {
    if (!wasComplete.current && completedActionIds.includes('specialties')) {
      onClose()
    }
  }, [completedActionIds, onClose])

  const handleClose = () => {
    handleValidateSection('specialties')
    onClose()
  }

  const tabsWithDone = TABS.map(t => ({
    ...t,
    done: completedActionIds.includes(t.id),
  }))

  return (
    <SetupModalLayout
      title="Spécialités"
      icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FC6D41" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
      tabs={tabsWithDone}
      activeTab="specialties"
      onTabChange={() => {}}
      onClose={handleClose}
    >
      <SpecialtiesStep />
    </SetupModalLayout>
  )
}
