import React, { useEffect, useState } from 'react'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  useEffect(() => {
    fetch('/data/mockPhase1Data.json')
      .then(res => res.json())
      .then(setData)
      .then(d => {
        // initialize chat from mock if present
        if (d?.chat?.rooms?.length) {
          const firstRoom = d.chat.rooms[0]
          setChatMessages(firstRoom.messages || [])
        }
        return d
      })
      .catch(() => {})
  }, [])
  if (!data) return <div>Loading UI data...</div>
  const addMockChat = (text) => {
    const msg = { id: Math.random().toString(36).slice(2), roomId: 'admin-chat', senderId: 'admin', text, timestamp: Date.now() }
    setChatMessages(prev => [...prev, msg])
  }
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
      <section className="panel" style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
        <h3>Admin Chat (Local)</h3>
        <div style={{ maxHeight: 180, overflow: 'auto', background: '#fff', padding: 8, borderRadius: 6 }}>
          {chatMessages.map(m => (
            <div key={m.id} style={{ marginBottom: 6 }}>
              <strong>{m.senderId}:</strong> {m.text}
              <div style={{ fontSize: 10, color: '#888' }}>{new Date(m.timestamp).toLocaleTimeString()}</div>
            </div>
          ))}
        </div>
        <ChatComposer onSend={addMockChat} />
      </section>
    </div>
  )
}

function ChatComposer({ onSend }) {
  const [text, setText] = useState('')
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
      <input value={text} onChange={e => setText(e.target.value)} placeholder="Type a message" style={{ flex: 1, padding: 6 }} />
      <button onClick={() => { if (text.trim()) { onSend(text.trim()); setText('') } }} style={{ padding: '6px 12px' }}>Send</button>
    </div>
  )
}
