import React, { useEffect, useState } from 'react'
import ChartCard from './ChartCard'

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
        <ChartCard title="Throughput (tasks/min)" data={[1,3,2,4]} />
        <ChartCard title="Latency (ms)" data={[120, 95, 110, 100]} />
      </div>
      <div style={{ marginTop: 16 }}>
        <ChartCard title="Agent Status" data={[ {name:'Catalog', value:1}, {name:'Cart', value:1}, {name:'Checkout', value:0} ]} />
      </div>
    </div>
  )
}
// ChartCard component moved to separate file (ChartCard.jsx)
