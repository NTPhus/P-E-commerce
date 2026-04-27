import React, { useEffect, useState } from 'react'

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null)
  useEffect(() => {
    // In MVP we fetch from a mock endpoint if available; otherwise show placeholders
    fetch('/v1/metrics/throughput')
      .then(res => res.json())
      .then(setMetrics)
      .catch(() => setMetrics({} as any))
  }, [])
  return (
    <div style={{ padding: 16 }}>
      <h2>Admin Dashboard</h2>
      <div className="charts" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        <ChartCard title="Throughput (tasks/min)" data={[{x:0,y:1},{x:1,y:3}]} />
        <ChartCard title="Latency (ms)" data={[{x:0,y:120},{x:1,y:95}]} />
      </div>
      <div style={{ marginTop: 16 }}>
        <ChartCard title="Agent Status" data={[{name:'Catalog', value:1},{name:'Cart', value:1},{name:'Checkout', value:0}]} />
      </div>
    </div>
  )
}

function ChartCard({ title, data }: any) {
  // Simple placeholder SVG chart
  const width = 400, height = 120
  return (
    <div className="panel" style={{ padding: 12, borderRadius: 8, background: '#fff' }}>
      <div style={{ fontWeight: 'bold', marginBottom: 6 }}>{title}</div>
      <svg width={width} height={height}>
        {data?.length ? data.map((p: any, i: number) => {
          const x = i * (width / (data.length - 1 || 1))
          const y = height - (p.y ?? p.value || 0) * (height / 200)
          return (
            <circle key={i} cx={x} cy={y} r={4} fill="#3b82f6" />
          )
        }) : null}
      </svg>
    </div>
  )
}
