import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, profile, isAdmin, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const close = () => setOpen(false)

  async function logout() {
    await signOut()
    close()
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand" onClick={close}>ISM <span>Digital Museum</span></Link>
        <button className="burger" onClick={() => setOpen(!open)} aria-label="Цэс">☰</button>
        <nav className={open ? 'nav open' : 'nav'}>
          <NavLink to="/exhibits" onClick={close}>Үзмэр</NavLink>
          <NavLink to="/creators" onClick={close}>Creators</NavLink>
          <NavLink to="/timeline" onClick={close}>Time Machine</NavLink>
          <NavLink to="/teachers" onClick={close}>Багш нар</NavLink>
          <NavLink to="/events" onClick={close}>Арга хэмжээ</NavLink>
          {user && <NavLink to="/my" onClick={close}>Миний бүтээл</NavLink>}
          {isAdmin && <NavLink to="/admin" onClick={close}>Админ</NavLink>}
          {user ? (
            <button className="btn btn-light" onClick={logout}>
              Гарах ({profile?.display_name ?? 'хэрэглэгч'})
            </button>
          ) : (
            <NavLink to="/login" className="btn btn-light" onClick={close}>Нэвтрэх</NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}
