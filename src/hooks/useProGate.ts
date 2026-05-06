'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

/**
 * Client-side Pro gate hook.
 * Wraps any action with a Pro check — if the user isn't on the Pro plan,
 * it opens the upgrade modal instead of running the action.
 */
export function useProGate() {
  const { data: session } = useSession()
  const [showUpgrade, setShowUpgrade] = useState(false)

  const isPro = (session?.user as any)?.plan === 'PRO'

  function requirePro(fn: () => void) {
    if (isPro) {
      fn()
    } else {
      setShowUpgrade(true)
    }
  }

  return { isPro, requirePro, showUpgrade, setShowUpgrade }
}
