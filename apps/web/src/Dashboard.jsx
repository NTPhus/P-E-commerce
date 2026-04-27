import React, { useEffect, useState } from 'react'

export default function Dashboard() {
  const [data, setData] = useState(null)
  useEffect(() => {
    fetch('/data/mockPhase1Data.json')
      .then(res => res.json())
      .then(setData)
  }, [])
  if (!data) return <div>Loading UI data...</div>
  return (
    <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
      <section className="panel" style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
        <h3>Tasks</h3>
        <ul>
          {data.tasks.map(t => (
            <li key={t.id}>{t.id}: {t.title} - {t.status}</li>
          ))}
        </ul>
      </section>
      <section className="panel" style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
        <h3>Catalog</h3>
        <ul>
          {data.catalog.products.map(p => (
            <li key={p.id}>{p.name} - ${p.price}</li>
          ))}
        </ul>
      </section>
      <section className="panel" style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
        <h3>Agents</h3>
        <ul>
          {data.agents.map((a, idx) => (
            <li key={idx}>{a} - idle</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
