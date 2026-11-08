import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

const splitCourses = (text) =>
  (text ?? '').split(/[,;\n]+/).map((c) => c.trim()).filter(Boolean)

export default function Teachers() {
  const [teachers, setTeachers] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('teachers').select('*').order('name')
      .then(({ data }) => { setTeachers(data ?? []); setLoading(false) })
  }, [])

  const shown = teachers.filter((t) =>
    (t.name + ' ' + (t.courses ?? '')).toLowerCase().includes(q.toLowerCase())
  )

  return (
    <>
      <h1>Тэнхимийн багш нар</h1>
      <div className="filters">
        <input placeholder="Нэр эсвэл хичээлээр хайх" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {loading ? <p className="empty">Уншиж байна...</p>
        : shown.length === 0 ? <p className="empty">Багш олдсонгүй.</p>
        : (
          <div className="teacher-grid">
            {shown.map((t) => {
              const courses = splitCourses(t.courses)
              return (
                <Link to={`/teachers/${t.id}`} className="teacher-card" key={t.id}>
                  {t.photo_url
                    ? <img className="avatar" src={t.photo_url} alt={t.name} />
                    : <div className="avatar avatar-empty">{t.name?.[0]}</div>}
                  <h3>{t.name}</h3>
                  <p className="position">{t.position}</p>
                  <dl className="info">
                    {t.email && <div className="info-row"><dt>И-Мэйл</dt><dd>{t.email}</dd></div>}
                    {t.office && <div className="info-row"><dt>Өрөөний дугаар</dt><dd>{t.office}</dd></div>}
                    {courses.length > 0 && (
                      <div className="info-row info-stack">
                        <dt>Заадаг хичээл</dt>
                       <dd>
  <ul>{courses.slice(0, 3).map((c) => <li key={c}>{c}</li>)}</ul>
  {courses.length > 3 && <small>+ {courses.length - 3} хичээл</small>}
</dd>
                      </div>
                    )}
                  </dl>
                  <span className="more">Дэлгэрэнгүй үзэх →</span>
                </Link>
              )
            })}
          </div>
        )}
    </>
  )
}