'use client'

import HomeDashboard from '@/components/HomeDashboard'
import { usePreDashboardGate } from '@/lib/usePreDashboardGate'

export default function ReferencementPage() {
  const { ready } = usePreDashboardGate()
  if (!ready) return null
  return <HomeDashboard initialTab="referencement" />
}
