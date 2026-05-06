'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { X, Sparkles, Camera, BarChart3, RefreshCw, Infinity } from 'lucide-react'

interface UpgradeModalProps {
  onClose: () => void
}

const PRO_FEATURES = [
  { icon: Camera, label: 'Receipt OCR', desc: 'Scan receipts and auto-fill expenses' },
  { icon: BarChart3, label: 'Spend Analytics', desc: 'See where your money goes with charts' },
  { icon: RefreshCw, label: 'Recurring Splits', desc: 'Auto-detect Netflix, DSTV & more' },
  { icon: Infinity, label: 'Unlimited Groups', desc: 'No more 3-group limit' },
]

export default function UpgradeModal({ onClose }: UpgradeModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline()
    tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 })
    tl.fromTo(
      cardRef.current,
      { opacity: 0, y: 40, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power3.out' },
      '-=0.1'
    )
    return () => { tl.kill() }
  }, [])

  const handleClose = () => {
    const tl = gsap.timeline({
      onComplete: onClose,
    })
    tl.to(cardRef.current, { opacity: 0, y: 20, scale: 0.97, duration: 0.2 })
    tl.to(overlayRef.current, { opacity: 0, duration: 0.15 }, '-=0.1')
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        ref={cardRef}
        className="w-full max-w-md rounded-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, rgba(30,30,50,0.98), rgba(20,20,35,0.98))',
          border: '1px solid rgba(127,119,221,0.3)',
          boxShadow: '0 0 80px rgba(127,119,221,0.15), 0 25px 50px -12px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div className="relative p-6 pb-4 text-center">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-3"
            style={{
              background: 'linear-gradient(135deg, #7F77DD, #9B6FE8)',
              color: 'white',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            PRO
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">Upgrade to Pro</h2>
          <p className="text-sm text-muted-foreground">Unlock powerful features that save you time</p>
        </div>

        {/* Features */}
        <div className="px-6 pb-4 space-y-3">
          {PRO_FEATURES.map((feat, i) => (
            <div
              key={feat.label}
              className="flex items-start gap-3 p-3 rounded-xl transition-colors"
              style={{
                background: 'rgba(127,119,221,0.08)',
                border: '1px solid rgba(127,119,221,0.12)',
              }}
            >
              <div
                className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(127,119,221,0.15)' }}
              >
                <feat.icon className="w-4.5 h-4.5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{feat.label}</p>
                <p className="text-xs text-muted-foreground">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="p-6 pt-2">
          <button
            onClick={handleClose}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #7F77DD, #9B6FE8)',
              boxShadow: '0 4px 15px rgba(127,119,221,0.3)',
            }}
          >
            Coming Soon — Get Notified
          </button>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Free during beta. We&apos;ll let you know when Pro launches.
          </p>
        </div>
      </div>
    </div>
  )
}
