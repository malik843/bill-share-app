'use client'

import React, { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { X, ChevronRight, ChevronLeft, HelpCircle } from 'lucide-react'
import type { ExplainerStep } from '@/lib/debt-algorithm'

interface Props {
  steps: ExplainerStep[]
  userMap: Record<string, string>
  onClose: () => void
}

export default function ExplainerModal({ steps, userMap, onClose }: Props) {
  const [idx, setIdx] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const getName = (id: string) => userMap[id] || id.slice(0, 8)

  useEffect(() => {
    if (!ref.current) return
    gsap.fromTo(ref.current, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' })
  }, [idx])

  const step = steps[idx]
  if (!step) return null

  let desc = step.description
  for (const [id, name] of Object.entries(userMap)) {
    desc = desc.replaceAll(id, name)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}
        style={{ background: 'var(--color-surface, rgba(30,30,50,0.98))', border: '1px solid rgba(127,119,221,0.2)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-foreground">How We Settled</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div ref={ref} className="p-5">
          <div className="flex items-center gap-2 mb-4">
            {steps.map((_, i) => (
              <div key={i} className="h-1.5 flex-1 rounded-full" style={{ background: i <= idx ? '#7F77DD' : 'rgba(255,255,255,0.1)' }} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Step {step.step} of {steps.length}</p>
          <p className="text-sm text-foreground leading-relaxed mb-5">{desc}</p>
          {step.transaction && (
            <div className="flex items-center justify-between p-3 rounded-xl mb-4" style={{ background: 'rgba(127,119,221,0.1)', border: '1px solid rgba(127,119,221,0.15)' }}>
              <span className="text-sm font-semibold text-foreground">{getName(step.transaction.from)}</span>
              <span className="text-xs text-muted-foreground px-2">&rarr;</span>
              <span className="text-sm font-semibold text-foreground">{getName(step.transaction.to)}</span>
              <span className="text-sm font-bold text-purple-400 ml-auto pl-3">&#8358;{step.transaction.amount.toLocaleString()}</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-rose-400 font-semibold mb-1.5">Still Owe</p>
              {step.debtors.filter(d => Math.abs(d.amount) > 0.01).map(d => (
                <div key={d.userId} className="flex justify-between text-xs text-muted-foreground py-0.5">
                  <span>{getName(d.userId)}</span>
                  <span className="text-rose-400">&#8358;{Math.abs(d.amount).toFixed(0)}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-emerald-400 font-semibold mb-1.5">Still Owed</p>
              {step.creditors.filter(c => c.amount > 0.01).map(c => (
                <div key={c.userId} className="flex justify-between text-xs text-muted-foreground py-0.5">
                  <span>{getName(c.userId)}</span>
                  <span className="text-emerald-400">&#8358;{c.amount.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 border-t border-white/10">
          <button onClick={() => setIdx(s => Math.max(0, s - 1))} disabled={idx === 0} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer disabled:cursor-default">
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          {idx < steps.length - 1 ? (
            <button onClick={() => setIdx(s => s + 1)} className="flex items-center gap-1 text-sm font-semibold text-purple-400 hover:text-purple-300 cursor-pointer">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={onClose} className="text-sm font-semibold text-purple-400 hover:text-purple-300 cursor-pointer">Done</button>
          )}
        </div>
      </div>
    </div>
  )
}
