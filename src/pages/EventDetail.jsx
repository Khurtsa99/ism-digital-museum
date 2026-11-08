import { useCallback, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function EventDetail() {
  const { id } = useParams()
  const [ev, setEv] = useState(null)
  const [photos, setPhotos] = useState([])
  const [index, setIndex] = useState(null) // нээлттэй зургийн дугаар
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('events').select('*').eq('id', id).single()
      .then(({ data, error }) => (error ? setError('Арга хэмжээ олдсонгүй.') : setEv(data)))
    supabase.from('event_photos').select('*').eq('event_id', id).order('id')
      .then(({ data }) => setPhotos(data ?? []))
  }, [id])

  const close = useCallback(() => setIndex(null), [])
  const prev = useCallback(() => setIndex((i) => (i - 1 + photos.length) % photos.length), [photos.length])
  const next = useCallback(() => setIndex((i) => (i + 1) % photos.length), [photos.length])

  // Гараас: Esc хаах, ← → солих
  useEffect(() => {
    if (index === null) return
    const onKey = (e) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [index, close, prev, next])

  if (error) return <p className="empty">{error}</p>
  if (!ev) return <p className="empty">Уншиж байна...</p>

  const current = index !== null ? photos[index] : null

  return (
    <article className="detail wide">
      <Link to="/events">← Арга хэмжээ рүү буцах</Link>
      <h1>{ev.title}</h1>
      <p className="meta">{ev.event_date}{photos.length > 0 && ` · ${photos.length} зураг`}</p>
      {ev.description && <p>{ev.description}</p>}

      <h2>Зурагт цомог</h2>
      {photos.length === 0 ? (
        <p className="empty">Энэ арга хэмжээнд зураг оруулаагүй байна.</p>
      ) : (
        <div className="gallery">
          {photos.map((p, i) => (
            <button type="button" className="g-item" key={p.id} onClick={() => setIndex(i)}>
              <img src={p.image_url} alt={p.caption ?? `${ev.title} ${i + 1}`} loading="lazy" />
              {p.caption && <span className="g-cap">{p.caption}</span>}
            </button>
          ))}
        </div>
      )}

      {current && (
        <div className="lb" onClick={close} role="dialog" aria-modal="true">
          <button className="lb-close" onClick={close} aria-label="Хаах">×</button>
          {photos.length > 1 && (
            <button className="lb-nav lb-prev" aria-label="Өмнөх"
              onClick={(e) => { e.stopPropagation(); prev() }}>‹</button>
          )}
          <figure onClick={(e) => e.stopPropagation()}>
            <img src={current.image_url} alt={current.caption ?? ''} />
            <figcaption>
              {current.caption}
              <small>{index + 1} / {photos.length}</small>
            </figcaption>
          </figure>
          {photos.length > 1 && (
            <button className="lb-nav lb-next" aria-label="Дараагийн"
              onClick={(e) => { e.stopPropagation(); next() }}>›</button>
          )}
        </div>
      )}
    </article>
  )
}