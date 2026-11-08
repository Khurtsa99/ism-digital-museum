import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import ImageInput from './ImageInput'

// Ерөнхий CRUD хүснэгт: fields = [{ name, label, type, required, relation }]
// type: text | textarea | number | date | image | select (options эсвэл relation)
export default function AdminCrud({ table, fields, titleField, orderBy = 'id', folder, allowCreate = true }) {
  const empty = Object.fromEntries(fields.map((f) => [f.name, '']))
  const [rows, setRows] = useState([])
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState(null)
  const [relations, setRelations] = useState({})
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  async function load() {
    const { data, error } = await supabase.from(table).select('*').order(orderBy, { ascending: true })
    if (error) setError(error.message)
    else setRows(data)
  }

  useEffect(() => {
    load()
    fields.filter((f) => f.relation).forEach(async (f) => {
      const { data } = await supabase.from(f.relation.table).select('*')
      setRelations((r) => ({ ...r, [f.name]: data ?? [] }))
    })
    // eslint-disable-next-line
  }, [table])

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }))

  async function save(e) {
    e.preventDefault()
    setError(''); setMsg('')
    for (const f of fields) {
      if (f.required && !String(form[f.name]).trim()) return setError(`"${f.label}" заавал бөглөнө.`)
    }
    // хоосон утгыг null болгох
    const payload = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v === '' ? null : v])
    )
    const q = editingId
      ? supabase.from(table).update(payload).eq('id', editingId)
      : supabase.from(table).insert(payload)
    const { error } = await q
    if (error) return setError(error.message)
    setMsg(editingId ? 'Засвар хадгалагдлаа.' : 'Нэмэгдлээ.')
    setForm(empty); setEditingId(null)
    load()
  }

  function edit(row) {
    setEditingId(row.id)
    setForm(Object.fromEntries(fields.map((f) => [f.name, row[f.name] ?? ''])))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function remove(row) {
    if (!window.confirm('Энэ мөрийг устгах уу?')) return
    const { error } = await supabase.from(table).delete().eq('id', row.id)
    if (error) setError(error.message)
    else load()
  }

  function input(f) {
    const v = form[f.name]
    if (f.type === 'textarea')
      return <textarea rows={3} value={v} onChange={(e) => set(f.name, e.target.value)} />
    if (f.type === 'image')
      return <ImageInput value={v} onChange={(url) => set(f.name, url)} folder={folder ?? table} />
    if (f.type === 'select') {
      const opts = f.relation
        ? (relations[f.name] ?? []).map((r) => ({ value: r.id, label: r[f.relation.label] }))
        : f.options
      return (
        <select value={v} onChange={(e) => set(f.name, e.target.value)}>
          <option value="">— сонгох —</option>
          {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )
    }
    return <input type={f.type ?? 'text'} value={v} onChange={(e) => set(f.name, e.target.value)} />
  }
  const imgField = fields.find((f) => f.type === 'image')?.name
  return (
    <div>
      {(allowCreate || editingId) && (
      <form className="form" onSubmit={save}>
        {fields.map((f) => (
          <label key={f.name}>{f.label}{f.required && ' *'}{input(f)}</label>
        ))}
        <div className="row">
          <button className="btn" type="submit">{editingId ? 'Засвар хадгалах' : 'Нэмэх'}</button>
          {editingId && (
            <button type="button" className="btn btn-light" onClick={() => { setEditingId(null); setForm(empty) }}>
              Болих
            </button>
          )}
        </div>
        {error && <p className="error">{error}</p>}
        {msg && <p className="success">{msg}</p>}
      </form>
      )}

      {rows.length === 0 ? (
        <p className="empty">Одоогоор өгөгдөл алга. Дээрх маягтаар нэмнэ үү.</p>
      ) : (
        <table className="table">
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
  {imgField && r[imgField] && <img src={r[imgField]} alt="" className="row-thumb" />}
  {r[titleField] || '(тайлбаргүй)'}
</td>
                <td className="actions">
                  <button className="link" onClick={() => edit(r)}>Засах</button>
                  <button className="link danger" onClick={() => remove(r)}>Устгах</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
