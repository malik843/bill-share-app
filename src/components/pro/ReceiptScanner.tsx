'use client'

import React, { useState, useCallback, useRef } from 'react'
import { Camera, Upload, X, Check, Loader2, AlertTriangle } from 'lucide-react'

interface ParsedItem {
  name: string
  amount: number
}

interface ReceiptScannerProps {
  onConfirm: (items: ParsedItem[], total: number | null) => void
  onClose: () => void
}

export default function ReceiptScanner({ onConfirm, onClose }: ReceiptScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [items, setItems] = useState<ParsedItem[]>([])
  const [total, setTotal] = useState<number | null>(null)
  const [confidence, setConfidence] = useState<'high' | 'low' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    setError(null)
    setScanning(true)

    try {
      // Convert to base64
      const buffer = await file.arrayBuffer()
      const base64 = btoa(
        new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      )

      const res = await fetch('/api/pro/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      })

      if (res.status === 403) {
        setError('Pro subscription required')
        setScanning(false)
        return
      }

      if (!res.ok) {
        setError('Failed to scan receipt. Please try again.')
        setScanning(false)
        return
      }

      const data = await res.json()
      setItems(data.items)
      setTotal(data.total)
      setConfidence(data.confidence)
    } catch {
      setError('Network error. Please try again.')
    }

    setScanning(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file && file.type.startsWith('image/')) handleFile(file)
    },
    [handleFile]
  )

  const updateItem = (index: number, field: 'name' | 'amount', value: string) => {
    setItems(prev =>
      prev.map((item, i) =>
        i === index
          ? { ...item, [field]: field === 'amount' ? parseFloat(value) || 0 : value }
          : item
      )
    )
  }

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{
          background: 'var(--color-surface, rgba(30,30,50,0.98))',
          border: '1px solid rgba(127,119,221,0.2)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-foreground">Scan Receipt</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {/* Upload zone */}
          {items.length === 0 && !scanning && (
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center gap-3 p-8 rounded-xl cursor-pointer transition-colors hover:bg-white/5"
              style={{
                border: '2px dashed rgba(127,119,221,0.3)',
                background: 'rgba(127,119,221,0.05)',
              }}
            >
              <Upload className="w-10 h-10 text-purple-400/60" />
              <p className="text-sm text-muted-foreground text-center">
                Drag & drop a receipt image or <span className="text-purple-400 font-semibold">browse</span>
              </p>
              <p className="text-xs text-muted-foreground/60">Supports JPG, PNG, HEIC</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) handleFile(file)
                }}
              />
            </div>
          )}

          {/* Scanning state */}
          {scanning && (
            <div className="flex flex-col items-center gap-3 py-12">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              <p className="text-sm text-muted-foreground">Scanning receipt…</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 mb-4">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <p className="text-sm text-rose-300">{error}</p>
            </div>
          )}

          {/* Editable parsed items */}
          {items.length > 0 && !scanning && (
            <>
              {confidence === 'low' && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <p className="text-xs text-amber-300">Low confidence — please review and correct the items below.</p>
                </div>
              )}

              <div className="space-y-2 mb-4">
                {items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  >
                    <input
                      type="text"
                      value={item.name}
                      onChange={e => updateItem(i, 'name', e.target.value)}
                      className="flex-1 bg-transparent text-sm text-foreground outline-none border-b border-white/10 focus:border-purple-400 transition-colors px-1 py-0.5"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">₦</span>
                      <input
                        type="number"
                        value={item.amount}
                        onChange={e => updateItem(i, 'amount', e.target.value)}
                        className="w-20 bg-transparent text-sm text-foreground outline-none border-b border-white/10 focus:border-purple-400 transition-colors text-right px-1 py-0.5"
                      />
                    </div>
                    <button
                      onClick={() => removeItem(i)}
                      className="text-muted-foreground hover:text-rose-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {total !== null && (
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/15 mb-4">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Detected Total</span>
                  <span className="text-sm font-bold text-foreground">₦{total.toLocaleString()}</span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground border border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onConfirm(items, total)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 cursor-pointer flex items-center justify-center gap-1.5"
                  style={{
                    background: 'linear-gradient(135deg, #7F77DD, #9B6FE8)',
                    boxShadow: '0 4px 15px rgba(127,119,221,0.3)',
                  }}
                >
                  <Check className="w-4 h-4" />
                  Use Items
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
