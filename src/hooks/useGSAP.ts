'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * GSAP context wrapper — auto-reverts all animations on unmount.
 * Prevents memory leaks during React hot-reload and route changes.
 */
export function useGSAP(
  callback: (g: typeof gsap) => gsap.core.Timeline | void,
  deps: React.DependencyList = []
) {
  const ctx = useRef<gsap.Context | null>(null)

  useEffect(() => {
    ctx.current = gsap.context(() => {
      callback(gsap)
    })
    return () => ctx.current?.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
