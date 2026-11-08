import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

// Тэнхимийн түүх: түүхэн мэдээлэл, хөгжлийн үе шатууд
export default function History() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('timeline_events').select('*').eq('kind', 'history').order('year')
      .then(({ data }) => { setItems(data ?? []); setLoading(false) })
  }, [])

  return (
    <>
      <h1>Тэнхимийн түүх</h1>
      <p>Тэнхимийн хөгжлийн үе шатууд. Бүх үйл явдлыг <Link to="/timeline">Time Machine</Link>-ээр он цагийн дарааллаар үзэж болно.</p>
      {loading ? <p className="empty">Уншиж байна...</p>
        : items.length === 0 ? <p className="empty">Түүхэн мэдээлэл одоогоор алга.</p>
        : items.map((i) => (
          <section key={i.id} className="history-block">
            <h2>{i.year} · {i.title}</h2>
            {i.image_url && <img src={i.image_url} alt={i.title} className="detail-img" />}
            <p>{i.description}</p>
          </section>
        ))}
    </>
  )
}
