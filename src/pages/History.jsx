import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

const paragraphs = (t) => (t ?? '').split('\n').map((s) => s.trim()).filter(Boolean)

// Тэнхимийн түүх: хөгжлийн үе шатуудыг дарааллаар нь харуулна
export default function History() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('timeline_events').select('*').eq('kind', 'history').order('year')
      .then(({ data }) => { setItems(data ?? []); setLoading(false) })
  }, [])

  const first = items[0]?.year
  const years = first ? new Date().getFullYear() - first : 0

  return (
    <>
      <section className="hist-hero">
        <h1>Тэнхимийн түүх</h1>
        <p>Мэдээллийн Системийн Менежментийн тэнхимийн хөгжлийн үе шатууд, онцлох үйл явдлууд.</p>
        <Link to="/timeline" className="btn btn-light">Time Machine-ээр үзэх →</Link>
      </section>

      {loading ? <p className="empty">Уншиж байна...</p>
        : items.length === 0 ? <p className="empty">Түүхэн мэдээлэл одоогоор алга.</p>
        : (
          <>
            <div className="hist-stats">
              <div><b>{first}</b><span>эхэлсэн он</span></div>
              <div><b>{years}</b><span>жилийн түүх</span></div>
              <div><b>{items.length}</b><span>онцлох үйл явдал</span></div>
            </div>

            <nav className="hist-index" aria-label="Оны жагсаалт">
              {items.map((i) => <a key={i.id} href={`#y-${i.id}`}>{i.year}</a>)}
            </nav>

            <ol className="hist-list">
              {items.map((i, idx) => (
                <li key={i.id} id={`y-${i.id}`} className={`hist-item ${idx % 2 ? 'flip' : ''}`}>
                  {i.image_url && <img src={i.image_url} alt={i.title} loading="lazy" />}
                  <div className="hist-text">
                    <span className="hist-phase">Үе шат {idx + 1}</span>
                    <div className="hist-year">{i.year}</div>
                    <h2>{i.title}</h2>
                    {paragraphs(i.description).map((p, k) => <p key={k}>{p}</p>)}
                  </div>
                </li>
              ))}
            </ol>
          </>
        )}
    </>
  )
}