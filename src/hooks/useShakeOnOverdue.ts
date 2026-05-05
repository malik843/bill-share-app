'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * Gentle horizontal shake on overdue items.
 * Fires once, 800ms after mount — not aggressive, just a nudge.
 */
export function useShakeOnOverdue(isOverdue: boolean) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOverdue || !ref.current) return

    const timer = setTimeout(() => {
      if (!ref.current) return
      gsap.to(ref.current, {
        x: 4,
        duration: 0.07,
        repeat: 5,
        yoyo: true,
        ease: 'none',
        onComplete: () => {
          if (ref.current) gsap.set(ref.current, { x: 0 })
        },
      })
    }, 800)

    return () => clearTimeout(timer)
  }, [isOverdue])

  return ref
}
