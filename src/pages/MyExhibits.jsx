import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import ImageInput from '../components/ImageInput'

const EMPTY = {
  title: '', description: '', image_url: '', category_id: '',
  technology_stack: '', year_created: '', demo_url: '', github_url: '', status: 'published',
}

export default function MyExhibits() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  async function load() {
    const { data, error } = await supabase.from('exhibits').select('*')
      .eq('creator_id', user.id).order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setItems(data)
  }

  useEffect(() => {
    load()
    supabase.from('exhibition_categories').select('*').order('name').then(({ data }) => setCategories(data ?? []))
    // eslint-disable-next-line
  }, [])

  function validate() {
    if (!form.title.trim()) return 'Гарчиг заавал оруулна.'
    const y = Number(form.year_created)
    if (form.year_created && (y < 1990 || y > new Date().getFullYear() + 1)) return 'Он буруу байна.'
    for (const k of ['demo_url', 'github_url']) {
      if (form[k] && !/^https?:\/\//.test(form[k])) return 'Холбоос http:// эсвэл https://-ээр эхлэх ёстой.'
    }
    return ''
  }

  async function save(e) {
    e.preventDefault()
    setMsg('')
    const v = validate()
    if (v) return setError(v)
    setError('')
    const payload = {
      ...Object.fromEntries(Object.entries(form).map(([k, val]) => [k, val === '' ? null : val])),
      creator_id: user.id,
    }
    const { error } = editingId
      ? await supabase.from('exhibits').update(payload).eq('id', editingId)
      : await supabase.from('exhibits').insert(payload)
    if (error) return setError(error.message)
    setMsg(editingId ? 'Өөрчлөлт хадгалагдлаа.' : 'Бүтээл нэмэгдлээ.')
    setForm(EMPTY); setEditingId(null)
    load()
  }

  function edit(it) {
    setEditingId(it.id)
    setForm(Object.fromEntries(Object.keys(EMPTY).map((k) => [k, it[k] ?? ''])))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function remove(it) {
    if (!window.confirm(`"${it.title}" бүтээлийг устгах уу?`)) return
    const { error } = await supabase.from('exhibits').delete().eq('id', it.id)
    if (error) setError(error.message)
    else load()
  }

  return (
    <>
      <h1>Миний бүтээлүүд</h1>
      <p><Link to="/profile">Профайлаа засах</Link></p>
      <form className="form" onSubmit={save}>
        <label>Гарчиг *<input value={form.title} onChange={(e) => set('title', e.target.value)} /></label>
        <label>Тайлбар<textarea rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} /></label>
        <label>Ангилал
          <select value={form.category_id} onChange={(e) => set('category_id', e.target.value)}>
            <option value="">— сонгох —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label>Ашигласан технологи<input placeholder="React, Supabase" value={form.technology_stack} onChange={(e) => set('technology_stack', e.target.value)} /></label>
        <label>Бүтээсэн он<input type="number" value={form.year_created} onChange={(e) => set('year_created', e.target.value)} /></label>
        <label>Demo холбоос<input value={form.demo_url} onChange={(e) => set('demo_url', e.target.value)} /></label>
        <label>GitHub холбоос<input value={form.github_url} onChange={(e) => set('github_url', e.target.value)} /></label>
        <label>Зураг<ImageInput value={form.image_url} onChange={(u) => set('image_url', u)} folder="exhibits" /></label>
        <label>Төлөв
          <select value={form.status} onChange={(e) => set('status', e.target.value)}>
            <option value="published">Нийтлэх</option>
            <option value="draft">Ноорог (зөвхөн надад харагдана)</option>
          </select>
        </label>
        <div className="row">
          <button className="btn">{editingId ? 'Өөрчлөлт хадгалах' : 'Бүтээл нэмэх'}</button>
          {editingId && <button type="button" className="btn btn-light" onClick={() => { setEditingId(null); setForm(EMPTY) }}>Болих</button>}
        </div>
        {error && <p className="error">{error}</p>}
        {msg && <p className="success">{msg}</p>}
      </form>

      <h2>Нэмсэн бүтээлүүд</h2>
      {items.length === 0 ? <p className="empty">Та хараахан бүтээл нэмээгүй байна. Дээрх маягтаас эхлээрэй.</p> : (
        <table className="table">
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td>{it.title} {it.status === 'draft' && <small>(ноорог)</small>}</td>
                <td className="actions">
                  <button className="link" onClick={() => edit(it)}>Засах</button>
                  <button className="link danger" onClick={() => remove(it)}>Устгах</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
