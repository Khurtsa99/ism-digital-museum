import { useState } from 'react'
import { uploadImage } from '../lib/supabaseClient'

// Зураг сонгоход Supabase Storage-д хуулж, URL-ийг onChange-аар буцаана
export default function ImageInput({ value, onChange, folder }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [inputKey, setInputKey] = useState(0) // файл сонгогчийг дахин цэвэрлэхэд

  async function pick(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return setError('Зөвхөн зураг сонгоно уу.')
    if (file.size > 5 * 1024 * 1024) return setError('Зургийн хэмжээ 5MB-аас бага байх ёстой.')
    setError('')
    setBusy(true)
    try {
      onChange(await uploadImage(file, folder))
    } catch (err) {
      setError('Зураг хуулахад алдаа гарлаа: ' + err.message)
    }
    setBusy(false)
  }

  function remove() {
    onChange('')
    setInputKey((k) => k + 1)
    setError('')
  }

  return (
    <div>
      {value && (
        <div>
          <img src={value} alt="" className="thumb" />
          <button type="button" className="link danger" onClick={remove}>Зургийг арилгах</button>
        </div>
      )}
      <input key={inputKey} type="file" accept="image/*" onChange={pick} disabled={busy} />
      {busy && <small> Хуулж байна...</small>}
      {error && <p className="error">{error}</p>}
    </div>
  )
}