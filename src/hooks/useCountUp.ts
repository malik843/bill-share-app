'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * Animates a number from its previous value to the new target.
 * Returns a ref to attach to a <span>.
 *
 * Usage:
 *   const ref = useCountUp(15000, { prefix: '₦', duration: 0.9 })
 *   <span ref={ref}>₦0</span>
 */
export function useCountUp(
  target: number,
  options: { duration?: number; prefix?: string; decimals?: number } = {}
) {
  const { duration = 1, prefix = '', decimals = 0 } = options
  const ref = useRef<HTMLSpanElement>(null)
  const prevTarget = useRef(0)

  useEffect(() => {
    if (!ref.current) return

    const obj = { value: prevTarget.current }
    gsap.to(obj, {
      value: target,
      duration,
      ease: 'power3.out',
      onUpdate() {
        if (ref.current) {
          ref.current.textContent =
            prefix +
            obj.value
              .toFixed(decimals)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        }
      },
    })

    prevTarget.current = target
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])

  return ref
}
