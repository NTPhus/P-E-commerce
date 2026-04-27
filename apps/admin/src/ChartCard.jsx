import React from 'react'

export default function ChartCard({ title, data }) {
  // Simple sparkline SVG
  const w = 260, h = 80
  const points = data?.map((v, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * w
    const y = h - (v ?? 0) / Math.max(...data, 1) * h
    return `${x},${y}`
  }).join(' ')
  return (
    <div className="panel" style={{ padding: 12, borderRadius: 8 }}>
      <div style={{ fontWeight: 'bold', marginBottom: 6 }}>{title}</div>
      <svg width={w} height={h}>
        <polyline fill="none" stroke="#3b82f6" strokeWidth={2} points={points || ''} />
      </svg>
    </div>
  )
}
