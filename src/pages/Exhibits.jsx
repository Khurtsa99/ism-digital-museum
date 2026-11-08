import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import ExhibitCard from '../components/ExhibitCard'

export default function Exhibits() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [year, setYear] = useState('')
  const [tech, setTech] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('exhibition_categories').select('*').order('name')
      .then(({ data }) => setCategories(data ?? []))
  }, [])

  // Шүүлтүүр өөрчлөгдөх бүрт өгөгдлийн сангаас дахин хайна
  useEffect(() => {
    async function load() {
      setLoading(true)
      let query = supabase
        .from('exhibits')
        .select('*, exhibition_categories(name), profiles(display_name)')
        .eq('status', 'published')
        .order('year_created', { ascending: false })
      if (q.trim()) query = query.ilike('title', `%${q.trim()}%`)
      if (category) query = query.eq('category_id', category)
      if (year) query = query.eq('year_created', Number(year))
      if (tech.trim()) query = query.ilike('technology_stack', `%${tech.trim()}%`)
      const { data, error } = await query
      if (error) setError(error.message)
      else { setError(''); setItems(data) }
      setLoading(false)
    }
    const t = setTimeout(load, 250)
    return () => clearTimeout(t)
  }, [q, category, year, tech])

  return (
    <>
      <h1>Дижитал үзэсгэлэн</h1>
      <div className="filters">
        <input placeholder="Нэрээр хайх" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Бүх ангилал</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="number" placeholder="Он" value={year} onChange={(e) => setYear(e.target.value)} />
        <input placeholder="Технологи (React, Python...)" value={tech} onChange={(e) => setTech(e.target.value)} />
      </div>
      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="empty">Уншиж байна...</p>
      ) : items.length === 0 ? (
        <p className="empty">Хайлтад тохирох үзмэр олдсонгүй. Шүүлтүүрээ өөрчилж үзнэ үү.</p>
      ) : (
        <div className="grid">{items.map((e) => <ExhibitCard key={e.id} exhibit={e} />)}</div>
      )}
    </>
  )
}
