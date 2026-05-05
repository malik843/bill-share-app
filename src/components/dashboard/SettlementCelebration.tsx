'use client'

import { useRef, useCallback } from 'react'
import gsap from 'gsap'

interface Props {
  amount: number
  debtorName: string
  onComplete: () => void
}

/**
 * Animation 3 — Debt-Zero Celebration
 * The hero moment. Three layers:
 * 1. Amount counts down to ₦0.00
 * 2. Text flashes green + "All settled" message fades in
 * 3. Canvas-based confetti burst
 */
export default function SettlementCelebration({
  amount,
  debtorName,
  onComplete,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const amountRef = useRef<HTMLDivElement>(null)
  const messageRef = useRef<HTMLParagraphElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hasPlayed = useRef(false)

  const fireConfetti = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const colors = [
      '#1D9E75',
      '#7F77DD',
      '#D85A30',
      '#EF9F27',
      '#5DCAA5',
      '#F4C0D1',
    ]

    const particles = Array.from({ length: 70 }, () => ({
      x:
        canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.4,
      y: canvas.height * 0.3,
      vx: (Math.random() - 0.5) * 8,
      vy: -4 - Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      w: 6 + Math.random() * 6,
      h: 3 + Math.random() * 3,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.15,
      gravity: 0.2 + Math.random() * 0.1,
      alpha: 1,
    }))

    const cw = canvas.width
    const ch = canvas.height

    let frame = 0
    function draw() {
      ctx.clearRect(0, 0, cw, ch)
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.vy += p.gravity
        p.rot += p.rotV
        p.alpha = Math.max(0, 1 - frame / 100)

        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      })
      frame++
      if (frame < 110) requestAnimationFrame(draw)
      else ctx.clearRect(0, 0, cw, ch)
    }
    requestAnimationFrame(draw)
  }, [])

  const celebrate = useCallback(() => {
    if (hasPlayed.current) return
    hasPlayed.current = true

    const tl = gsap.timeline({
      onComplete: () => {
        // Small delay before closing so user can enjoy the moment
        setTimeout(onComplete, 1200)
      },
    })

    // 1. Count the amount down to zero
    const obj = { value: amount }
    tl.to(obj, {
      value: 0,
      duration: 1.4,
      ease: 'power2.inOut',
      onUpdate() {
        if (amountRef.current) {
          amountRef.current.textContent =
            '₦' + Math.round(obj.value).toLocaleString() + '.00'
        }
      },
    })

    // 2. Flash green at zero
    if (amountRef.current) {
      tl.to(
        amountRef.current,
        {
          color: '#1D9E75',
          duration: 0.3,
          ease: 'none',
        },
        '-=0.05'
      )
    }

    // 3. Message fades in
    if (messageRef.current) {
      tl.fromTo(
        messageRef.current,
        { y: 8, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' },
        '-=0.1'
      )
    }

    // 4. Confetti burst (runs in parallel at the 1.2s mark)
    tl.call(() => fireConfetti(), [], 1.2)
  }, [amount, fireConfetti, onComplete])

  return (
    <div className="celebration-overlay">
      <div
        ref={wrapRef}
        className="celebration-card"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        <div className="relative z-10 flex flex-col items-center">
          <div
            ref={amountRef}
            className="text-5xl md:text-6xl font-bold tracking-tight mb-2 transition-colors"
          >
            ₦{amount.toLocaleString()}.00
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            owed to {debtorName}
          </p>
          <p
            ref={messageRef}
            className="text-base font-semibold text-emerald-500 mb-6"
            style={{ opacity: 0 }}
          >
            All settled. You&apos;re even. 🎉
          </p>
          <button
            onClick={celebrate}
            className="settle-celebrate-btn"
          >
            Mark as settled →
          </button>
        </div>
      </div>
    </div>
  )
}
