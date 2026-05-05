'use client'

import React, { useState, useRef, useEffect } from 'react'
import { X, Users, Smile } from 'lucide-react'
import gsap from 'gsap'
import { useToast } from '@/components/providers/ToastProvider'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const ICONS = ['🏠', '🍕', '✈️', '🎮', '🎵', '⚽', '📚', '🏖️', '🎂', '💼']

interface CreateGroupModalProps {
  groupCount: number
  onClose: () => void
  onCreated: (group: any) => void
}

export default function CreateGroupModal({ groupCount, onClose, onCreated }: CreateGroupModalProps) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('🏠')
  const [submitting, setSubmitting] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const { addToast } = useToast()
  const reduced = useReducedMotion()
  const atLimit = groupCount >= 3

  useEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 })
      gsap.fromTo(modalRef.current, { y: 30, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: 'power3.out' })
    })
    return () => ctx.revert()
  }, [reduced])

  const handleClose = () => {
    if (reduced) { onClose(); return }
    const ctx = gsap.context(() => {
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 })
      gsap.to(modalRef.current, { y: 20, opacity: 0, scale: 0.95, duration: 0.2, ease: 'power2.in', onComplete: onClose })
    })
    return () => ctx.revert()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (atLimit) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, icon, currency: 'NGN' }),
      })
      const data = await res.json()
      if (!res.ok) {
        addToast(data.error || 'Failed to create group', 'error')
        return
      }
      addToast(`Group "${name}" created!`, 'success')
      onCreated(data)
      handleClose()
    } catch {
      addToast('Network error', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div ref={modalRef} className="w-full max-w-md bg-background rounded-[2rem] shadow-2xl border border-border overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Users className="w-5 h-5" /> New Group
          </h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-muted transition-colors cursor-pointer">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {atLimit ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="font-bold text-lg mb-1">Group limit reached</h3>
            <p className="text-sm text-muted-foreground mb-5">Free plan allows up to 3 groups. Upgrade to Pro for unlimited groups.</p>
            <button className="px-6 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors cursor-pointer">
              Upgrade to Pro
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Group Name</label>
              <input
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Flat 3 Housemates"
                className="w-full p-3 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1 block">
                <Smile className="w-4 h-4" /> Icon
              </label>
              <div className="grid grid-cols-5 gap-2">
                {ICONS.map(em => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setIcon(em)}
                    className={`text-2xl p-2 rounded-xl border-2 transition-all cursor-pointer ${icon === em ? 'border-primary bg-primary/10 scale-110' : 'border-transparent hover:border-border hover:bg-muted/40'}`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-foreground text-background font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Creating…' : 'Create Group'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
