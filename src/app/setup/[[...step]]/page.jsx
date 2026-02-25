'use client'

import { useParams } from 'next/navigation'
import Setup from '@/components/site-editor/setup'

export default function SetupPage() {
  const params = useParams()
  const step = params.step?.[0] || null
  return <Setup initialStep={step} />
}
