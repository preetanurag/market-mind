import { useEffect, useState } from 'react'
import { getTrades } from '../lib/content'

export default function Trades() {
  const [trades, setTrades] = useState([])

  useEffect(() => {
    getTrades().then(setTrades)
  }, [])

  return (
    <main className="section-shell page-shell">
      <p className="eyebrow">Trades</p>
      <h1>Market notes, experiments, and decision journals.</h1>
      <div className="card-grid">
        {trades.map((trade) => (
          <article className="content-card" key={trade.id}>
            <span>{trade.status}</span>
            <h2>{trade.title}</h2>
            <p>{trade.thesis}</p>
            <div className="tag-row">
              {(trade.tags || []).map((tag) => <b key={tag}>{tag}</b>)}
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}
