import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  async function submit(e) {
    e.preventDefault()
    setError(''); setInfo('')
    if (!name.trim()) return setError('Нэрээ оруулна уу.')
    if (!email.includes('@')) return setError('Имэйл хаягаа зөв оруулна уу.')
    if (password.length < 6) return setError('Нууц үг дор хаяж 6 тэмдэгт байх ёстой.')
    const { data, error } = await signUp(email, password, name.trim())
    if (error) return setError(error.message)
    if (data.session) navigate('/my')
    else setInfo('Бүртгэл амжилттай. Имэйлээ шалгаж баталгаажуулаад нэвтэрнэ үү.')
  }

  return (
    <form className="form narrow" onSubmit={submit}>
      <h1>Бүртгүүлэх</h1>
      <label>Нэр<input value={name} onChange={(e) => setName(e.target.value)} /></label>
      <label>Имэйл<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label>Нууц үг<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
      {error && <p className="error">{error}</p>}
      {info && <p className="success">{info}</p>}
      <button className="btn">Бүртгүүлэх</button>
      <p>Бүртгэлтэй юу? <Link to="/login">Нэвтрэх</Link></p>
    </form>
  )
}
