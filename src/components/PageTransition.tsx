'use client'

import { useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import gsap from 'gsap'

/**
 * Animation 5 — Page Transitions
 * Wraps children with a subtle fade+slide on every route change.
 * Makes the app feel like a single fluid experience.
 */
export default function PageTransition({
  children,
}: {
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    if (!ref.current) return
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', clearProps: 'transform' }
    )
  }, [pathname])

  return (
    <div ref={ref} className="flex-1 flex flex-col">
      {children}
    </div>
  )
}
