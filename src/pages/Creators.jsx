import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

// ISM Creators: оюутнуудын танилцуулга ба тэдний бүтээлийг холбоно
export default function Creators() {
  const [creators, setCreators] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [p, e] = await Promise.all([
        supabase.from('profiles').select('id, display_name, avatar_url'),
        supabase.from('exhibits').select('creator_id').eq('status', 'published'),
      ])
      const counts = {}
      ;(e.data ?? []).forEach((x) => { counts[x.creator_id] = (counts[x.creator_id] ?? 0) + 1 })
      setCreators(
        (p.data ?? []).map((c) => ({ ...c, count: counts[c.id] ?? 0 })).filter((c) => c.count > 0)
      )
      setLoading(false)
    }
    load()
  }, [])

  return (
    <>
      <h1>ISM Creators</h1>
      <p>Тэнхимийн оюутнууд болон тэдний бүтээлүүд.</p>
      {loading ? <p className="empty">Уншиж байна...</p>
        : creators.length === 0 ? <p className="empty">Одоогоор бүтээл нийтэлсэн оюутан алга.</p>
        : (
          <div className="grid">
            {creators.map((c) => (
              <Link to={`/creators/${c.id}`} className="card person" key={c.id}>
                {c.avatar_url ? <img src={c.avatar_url} alt={c.display_name} /> : <div className="img-placeholder">Зураггүй</div>}
                <div className="card-body">
                  <h3>{c.display_name}</h3>
                  <p className="meta">{c.count} бүтээл</p>
                </div>
              </Link>
            ))}
          </div>
        )}
    </>
  )
}
