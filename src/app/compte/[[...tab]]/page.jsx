'use client'

import HomeDashboard from '@/components/HomeDashboard'
import { usePreDashboardGate } from '@/lib/usePreDashboardGate'

export default function ComptePage({ params }) {
  const { ready } = usePreDashboardGate()
  if (!ready) return null
  const subTab = params.tab?.[0] || 'compte'
  return <HomeDashboard initialTab="account" initialSettingsTab={subTab} />
}
