import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

const KINDS = {
  all: 'Бүгд',
  history: 'Түүх',
  event: 'Арга хэмжээ',
  exhibit: 'Бүтээл',
  technology: 'Технологи',
}

// ISM Time Machine: түүх, арга хэмжээ, бүтээл, технологийг нэг цаг хугацааны шугамд нэгтгэнэ
export default function Timeline() {
  const [items, setItems] = useState([])
  const [kind, setKind] = useState('all')
  const [open, setOpen] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const [t, ev, ex] = await Promise.all([
        supabase.from('timeline_events').select('*'),
        supabase.from('events').select('*'),
        supabase.from('exhibits').select('id,title,description,image_url,year_created').eq('status', 'published'),
      ])
      if (t.error || ev.error || ex.error) {
        setError((t.error || ev.error || ex.error).message)
        return setLoading(false)
      }
      const all = [
        ...t.data.map((x) => ({ key: 't' + x.id, year: x.year, title: x.title, text: x.description, kind: x.kind || 'history', image: x.image_url })),
        ...ev.data.filter((x) => x.event_date).map((x) => ({
          key: 'e' + x.id, year: new Date(x.event_date).getFullYear(), title: x.title,
          text: x.description, kind: 'event', image: x.cover_image_url, link: `/events/${x.id}`,
        })),
        ...ex.data.filter((x) => x.year_created).map((x) => ({
          key: 'x' + x.id, year: x.year_created, title: x.title, text: x.description,
          kind: 'exhibit', image: x.image_url, link: `/exhibits/${x.id}`,
        })),
      ].sort((a, b) => a.year - b.year)
      setItems(all)
      setLoading(false)
    }
    load()
  }, [])

  const shown = useMemo(() => items.filter((i) => kind === 'all' || i.kind === kind), [items, kind])
  const years = shown.length ? [shown[0].year, shown[shown.length - 1].year] : null

  return (
    <>
      <h1>ISM Time Machine</h1>
      <p>Тэнхимийн түүх, арга хэмжээ, оюутнуудын бүтээл болон технологийн өөрчлөлтийг он цагийн дарааллаар үзнэ үү.</p>

      <div className="chips">
        {Object.entries(KINDS).map(([k, label]) => (
          <button key={k} className={kind === k ? 'chip active' : 'chip'} onClick={() => setKind(k)}>{label}</button>
        ))}
      </div>
      {years && <p className="meta">{years[0]} – {years[1]} он · {shown.length} үйл явдал</p>}

      {error && <p className="error">{error}</p>}
      {loading ? <p className="empty">Уншиж байна...</p>
        : shown.length === 0 ? <p className="empty">Энэ ангилалд үйл явдал алга.</p>
        : (
          <ol className="timeline">
            {shown.map((i, idx) => {
              const showYear = idx === 0 || shown[idx - 1].year !== i.year
              return (
                <li key={i.key} className={`tl-item tl-${i.kind}`}>
                  <div className="tl-year">{showYear ? i.year : ''}</div>
                  <div className="tl-dot" />
                  <div className="tl-card">
                    <button className="tl-head" onClick={() => setOpen(open === i.key ? null : i.key)} aria-expanded={open === i.key}>
                      <span className="tl-kind">{KINDS[i.kind] ?? i.kind}</span>
                      <strong>{i.title}</strong>
                    </button>
                    {open === i.key && (
                      <div className="tl-body">
                        {i.image && <img src={i.image} alt={i.title} />}
                        {i.text && <p>{i.text}</p>}
                        {i.link && <Link to={i.link}>Дэлгэрэнгүй үзэх</Link>}
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        )}
    </>
  )
}
