'use client'

import HomeDashboard from '@/components/HomeDashboard'
import { usePreDashboardGate } from '@/lib/usePreDashboardGate'

export default function ParrainagePage() {
  const { ready } = usePreDashboardGate()
  if (!ready) return null
  return <HomeDashboard initialTab="parrainage" />
}
