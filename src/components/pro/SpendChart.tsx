'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useCountUp } from '@/hooks/useCountUp'

interface SpendChartProps {
  data: Record<string, number>
}

export default function SpendChart({ data }: SpendChartProps) {
  const chartData = Object.entries(data).map(([month, amount]) => ({
    month: new Date(month + '-01').toLocaleDateString('en-NG', { month: 'short' }),
    amount,
  }))

  const total = Object.values(data).reduce((s, v) => s + v, 0)
  const totalRef = useCountUp(total, { prefix: '₦', duration: 0.8 })

  if (chartData.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-muted-foreground">No spending data yet for this period.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <p className="text-xs text-muted-foreground">Your total spend</p>
        <span ref={totalRef} className="text-3xl font-medium text-foreground">₦0</span>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={chartData} barSize={28}>
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            formatter={(v) => [`₦${Number(v).toLocaleString()}`, 'Spent']}
            contentStyle={{
              background: 'rgba(30,30,50,0.95)',
              border: '1px solid rgba(127,119,221,0.2)',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'white',
            }}
            cursor={{ fill: 'rgba(127,119,221,0.1)' }}
          />
          <Bar dataKey="amount" fill="#7F77DD" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
