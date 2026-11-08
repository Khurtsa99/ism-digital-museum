import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import ImageInput from '../components/ImageInput'

export default function Profile() {
  const { user, profile } = useAuth()
  const [name, setName] = useState(profile?.display_name ?? '')
  const [avatar, setAvatar] = useState(profile?.avatar_url ?? '')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  async function save(e) {
    e.preventDefault()
    setMsg(''); setError('')
    if (!name.trim()) return setError('Нэр хоосон байж болохгүй.')
    const { error } = await supabase.from('profiles')
      .update({ display_name: name.trim(), avatar_url: avatar || null }).eq('id', user.id)
    if (error) setError(error.message)
    else setMsg('Профайл хадгалагдлаа. Өөрчлөлт дахин нэвтэрсний дараа цэсэнд шинэчлэгдэнэ.')
  }

  return (
    <form className="form narrow" onSubmit={save}>
      <Link to="/my">← Миний бүтээлүүд</Link>
      <h1>Миний профайл</h1>
      <label>Нэр<input value={name} onChange={(e) => setName(e.target.value)} /></label>
      <label>Зураг<ImageInput value={avatar} onChange={setAvatar} folder="avatars" /></label>
      {error && <p className="error">{error}</p>}
      {msg && <p className="success">{msg}</p>}
      <button className="btn">Хадгалах</button>
    </form>
  )
}
