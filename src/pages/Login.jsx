import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (!email.includes('@')) return setError('Имэйл хаягаа зөв оруулна уу.')
    if (password.length < 6) return setError('Нууц үг дор хаяж 6 тэмдэгт байх ёстой.')
    setBusy(true)
    const { error } = await signIn(email, password)
    setBusy(false)
    if (error) return setError('Имэйл эсвэл нууц үг буруу байна.')
    navigate('/my')
  }

  return (
    <form className="form narrow" onSubmit={submit}>
      <h1>Нэвтрэх</h1>
      <label>Имэйл<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label>Нууц үг<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
      {error && <p className="error">{error}</p>}
      <button className="btn" disabled={busy}>{busy ? 'Түр хүлээнэ үү...' : 'Нэвтрэх'}</button>
      <p>Бүртгэлгүй юу? <Link to="/register">Бүртгүүлэх</Link></p>
    </form>
  )
}
