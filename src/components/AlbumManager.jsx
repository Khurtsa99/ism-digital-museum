import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase, uploadImage } from '../lib/supabaseClient'

const MAX_FILES = 20
const MAX_SIZE = 5 * 1024 * 1024

// Админ: арга хэмжээний зурагт цомгийг нэг дор олон зургаар удирдана
export default function AlbumManager() {
  const [events, setEvents] = useState([])
  const [eventId, setEventId] = useState('')
  const [photos, setPhotos] = useState([])
  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const inputRef = useRef(null)

  // Сонгосон файлуудын урьдчилсан харагдац
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files])
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews])

  useEffect(() => {
    supabase.from('events').select('id, title, event_date')
      .order('event_date', { ascending: false })
      .then(({ data }) => setEvents(data ?? []))
  }, [])

  async function loadPhotos(id) {
    const { data, error } = await supabase.from('event_photos').select('*').eq('event_id', id).order('id')
    if (error) setError(error.message)
    else setPhotos(data)
  }

  useEffect(() => {
    if (eventId) loadPhotos(eventId)
    else setPhotos([])
  }, [eventId])

  function onPick(e) {
    const picked = Array.from(e.target.files ?? [])
    const good = picked.filter((f) => f.type.startsWith('image/') && f.size <= MAX_SIZE)
    const skipped = picked.length - good.length
    setMsg('')
    setError(
      skipped > 0 ? `${skipped} файл алгасагдлаа (зураг биш эсвэл 5MB-аас том).`
        : picked.length > MAX_FILES ? `Нэг дор дээд тал нь ${MAX_FILES} зураг оруулна.` : ''
    )
    setFiles(good.slice(0, MAX_FILES))
  }

  function removeSelected(i) {
    setFiles((fs) => fs.filter((_, idx) => idx !== i))
  }

  async function upload() {
    if (!eventId) return setError('Эхлээд арга хэмжээгээ сонгоно уу.')
    if (files.length === 0) return setError('Оруулах зургаа сонгоно уу.')
    setBusy(true); setError(''); setMsg(''); setProgress(0)

    const rows = []
    let failed = 0
    for (let i = 0; i < files.length; i++) {
      try {
        const url = await uploadImage(files[i], 'events')
        rows.push({ event_id: Number(eventId), image_url: url })
      } catch {
        failed++
      }
      setProgress(i + 1)
    }
    if (rows.length > 0) {
      const { error } = await supabase.from('event_photos').insert(rows)
      if (error) setError(error.message)
    }
    setMsg(`${rows.length} зураг нэмэгдлээ.` + (failed ? ` ${failed} зураг амжилтгүй болсон.` : ''))
    setFiles([])
    if (inputRef.current) inputRef.current.value = ''
    setBusy(false)
    loadPhotos(eventId)
  }

  async function saveCaption(p, value) {
    const v = value.trim()
    if ((p.caption ?? '') === v) return
    const { error } = await supabase.from('event_photos').update({ caption: v || null }).eq('id', p.id)
    if (error) setError(error.message)
    else setPhotos((ps) => ps.map((x) => (x.id === p.id ? { ...x, caption: v || null } : x)))
  }

  async function removePhoto(p) {
    if (!window.confirm('Энэ зургийг устгах уу?')) return
    const { error } = await supabase.from('event_photos').delete().eq('id', p.id)
    if (error) return setError(error.message)
    // Storage-оос файлыг нь мөн цэвэрлэнэ
    const marker = '/object/public/images/'
    const at = p.image_url?.indexOf(marker)
    if (at > -1) {
      await supabase.storage.from('images').remove([decodeURIComponent(p.image_url.slice(at + marker.length))])
    }
    setPhotos((ps) => ps.filter((x) => x.id !== p.id))
  }

  return (
    <div className="album-admin">
      <div className="form">
        <label>Арга хэмжээ *
          <select value={eventId} onChange={(e) => setEventId(e.target.value)}>
            <option value="">— сонгох —</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.title} ({ev.event_date})</option>
            ))}
          </select>
        </label>

        <label>Зурагнууд (нэг дор олныг сонгож болно)
          <input ref={inputRef} type="file" accept="image/*" multiple onChange={onPick} disabled={busy} />
          <small>Дээд тал нь {MAX_FILES} зураг, тус бүр 5MB-аас бага. Ctrl эсвэл Shift дарж олныг сонгоно.</small>
        </label>

        {files.length > 0 && (
          <div className="pick-grid">
            {previews.map((src, i) => (
              <div className="pick-item" key={src}>
                <img src={src} alt="" />
                <button type="button" onClick={() => removeSelected(i)} disabled={busy} aria-label="Хасах">×</button>
              </div>
            ))}
          </div>
        )}

        {busy && (
          <div>
            <div className="progress"><div style={{ width: `${(progress / files.length) * 100}%` }} /></div>
            <small>Хуулж байна: {progress} / {files.length}</small>
          </div>
        )}

        <div className="row">
          <button type="button" className="btn" onClick={upload} disabled={busy || files.length === 0}>
            {files.length > 0 ? `${files.length} зураг оруулах` : 'Зураг оруулах'}
          </button>
        </div>
        {error && <p className="error">{error}</p>}
        {msg && <p className="success">{msg}</p>}
      </div>

      {eventId && (
        <>
          <h3>Цомог дахь зургууд ({photos.length})</h3>
          {photos.length === 0 ? (
            <p className="empty">Энэ арга хэмжээнд зураг оруулаагүй байна.</p>
          ) : (
            <div className="photo-admin-grid">
              {photos.map((p) => (
                <div className="photo-admin" key={p.id}>
                  <img src={p.image_url} alt={p.caption ?? ''} />
                  <input
                    defaultValue={p.caption ?? ''}
                    placeholder="Тайлбар (заавал биш)"
                    onBlur={(e) => saveCaption(p, e.target.value)}
                  />
                  <button type="button" className="link danger" onClick={() => removePhoto(p)}>Устгах</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}