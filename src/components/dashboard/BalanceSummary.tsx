'use client'

import { useCountUp } from '@/hooks/useCountUp'

interface Props {
  owed: number
  owing: number
}

/**
 * Animation 2 — CountUp Balances
 * Numbers animate to their final value on mount and on every data refresh.
 * Colour shifts: neutral when zero, green for owed, warming amber→red for owing.
 */
export default function BalanceSummary({ owed, owing }: Props) {
  const owedRef = useCountUp(owed, { prefix: '₦', duration: 0.9 })
  const owingRef = useCountUp(owing, { prefix: '₦', duration: 0.9 })

  // Dynamic color based on amount intensity
  const owingColor =
    owing === 0
      ? 'text-muted-foreground'
      : owing < 10000
        ? 'text-amber-500'
        : 'text-red-500'

  const owedColor =
    owed === 0 ? 'text-muted-foreground' : 'text-emerald-500'

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {/* You are owed */}
      <div className="balance-card balance-card-owed">
        <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">
          You are owed
        </p>
        <span
          ref={owedRef}
          className={`text-2xl md:text-3xl font-bold tracking-tight transition-colors duration-500 ${owedColor}`}
        >
          ₦0
        </span>
      </div>

      {/* You owe */}
      <div className="balance-card balance-card-owing">
        <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">
          You owe
        </p>
        <span
          ref={owingRef}
          className={`text-2xl md:text-3xl font-bold tracking-tight transition-colors duration-500 ${owingColor}`}
        >
          ₦0
        </span>
      </div>
    </div>
  )
}
