import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import ExhibitCard from '../components/ExhibitCard'

export default function Home() {
  const [latest, setLatest] = useState([])
  const [counts, setCounts] = useState({ exhibits: 0, teachers: 0, events: 0 })
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('exhibits')
        .select('*, exhibition_categories(name)')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(3)
      if (error) return setError(error.message)
      setLatest(data)
      const c = {}
      for (const t of ['exhibits', 'teachers', 'events']) {
        const r = await supabase.from(t).select('*', { count: 'exact', head: true })
        c[t] = r.count ?? 0
      }
      setCounts(c)
    }
    load()
  }, [])

  return (
    <>
      <section className="hero">
        <h1>ISM Digital Museum</h1>
        <p>
          Мэдээллийн Системийн Менежментийн тэнхимийн түүх, багш нар, арга хэмжээ,
          оюутнуудын бүтээлийг нэг дор.
        </p>
        <div className="row">
          <Link to="/timeline" className="btn btn-light">Time Machine нээх</Link>
          <Link to="/exhibits" className="btn btn-outline">Үзмэр үзэх</Link>
          <Link to="/history" className="btn btn-outline">Тэнхимийн түүх</Link>
        </div>
      </section>

      <section className="stats">
        <div><b>{counts.exhibits}</b> үзмэр</div>
        <div><b>{counts.teachers}</b> багш</div>
        <div><b>{counts.events}</b> арга хэмжээ</div>
      </section>

      <h2>Сүүлд нэмэгдсэн үзмэр</h2>
      {error && <p className="error">{error}</p>}
      {latest.length === 0 && !error ? (
        <p className="empty">Одоогоор үзмэр алга. Нэвтэрч ороод эхний бүтээлээ нэмээрэй.</p>
      ) : (
        <div className="grid">{latest.map((e) => <ExhibitCard key={e.id} exhibit={e} />)}</div>
      )}
    </>
  )
}
