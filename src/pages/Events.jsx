import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('events').select('*').order('event_date', { ascending: false })
      .then(({ data }) => { setEvents(data ?? []); setLoading(false) })
  }, [])

  return (
    <>
      <h1>Өдөрлөг ба арга хэмжээ</h1>
      {loading ? <p className="empty">Уншиж байна...</p>
        : events.length === 0 ? <p className="empty">Арга хэмжээ одоогоор алга.</p>
        : (
          <div className="grid">
            {events.map((ev) => (
              <Link to={`/events/${ev.id}`} className="card" key={ev.id}>
                {ev.cover_image_url ? <img src={ev.cover_image_url} alt={ev.title} /> : <div className="img-placeholder">Зураггүй</div>}
                <div className="card-body">
                  <h3>{ev.title}</h3>
                  <p className="meta">{ev.event_date}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
    </>
  )
}
