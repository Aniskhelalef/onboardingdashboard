'use client'

import Setup from '@/components/site-editor/Setup'

export default function SetupPage({ params }) {
  const step = params.step?.[0] || null
  return <Setup initialStep={step} />
}
