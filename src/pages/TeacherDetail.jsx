import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

const lines = (text) => (text ?? '').split('\n').map((l) => l.trim()).filter(Boolean)
const items = (text) => (text ?? '').split(/[,;\n]+/).map((c) => c.trim()).filter(Boolean)

export default function TeacherDetail() {
  const { id } = useParams()
  const [t, setT] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('teachers').select('*').eq('id', id).single()
      .then(({ data, error }) => (error ? setError('Багш олдсонгүй.') : setT(data)))
  }, [id])

  if (error) return <p className="empty">{error}</p>
  if (!t) return <p className="empty">Уншиж байна...</p>

  // "Хамгаалсан газар | Он | Сэдэв | Зэрэг" хэлбэрийн мөрийг хүснэгт болгоно
  const education = lines(t.education).map((l) => {
    const [place = '', year = '', topic = '', degree = ''] = l.split('|').map((s) => s.trim())
    return { place, year, topic, degree }
  })
  const sections = [
    { title: 'Ажил эрхлэлт', list: lines(t.work_history) },
    { title: 'Мэргэжлийн сургалт', list: lines(t.training) },
    { title: 'Эрдэм шинжилгээний бүтээл', list: lines(t.publications) },
    { title: 'Судалгааны төсөл, ажлын тайлан, орчуулга', list: lines(t.research) },
  ].filter((s) => s.list.length > 0)
  const courses = items(t.courses)
  const hasMore = t.bio || education.length > 0 || sections.length > 0

  return (
    <>
      <Link to="/teachers">← Багш нар руу буцах</Link>
      <div className="teacher-detail">
        <aside className="teacher-profile">
          {t.photo_url
            ? <img className="avatar" src={t.photo_url} alt={t.name} />
            : <div className="avatar avatar-empty">{t.name?.[0]}</div>}
          <h2>{t.name}</h2>
          <p className="position">{t.position}</p>
          <dl className="info">
            {t.department && <div className="info-row"><dt>Алба нэгж</dt><dd>{t.department}</dd></div>}
            {t.degree && <div className="info-row"><dt>Цол зэрэг</dt><dd>{t.degree}</dd></div>}
            {t.email && <div className="info-row"><dt>И-Мэйл</dt><dd>{t.email}</dd></div>}
            {t.office && <div className="info-row"><dt>Өрөөний дугаар</dt><dd>{t.office}</dd></div>}
            {courses.length > 0 && (
              <div className="info-row info-stack">
                <dt>Заадаг хичээл</dt>
                <dd><ul>{courses.map((c) => <li key={c}>{c}</li>)}</ul></dd>
              </div>
            )}
          </dl>
        </aside>

        <section className="teacher-more">
          <h2>Дэлгэрэнгүй</h2>
          {!hasMore && <p className="empty">Дэлгэрэнгүй мэдээлэл оруулаагүй байна.</p>}

          {t.bio && (
            <details className="acc" open>
              <summary>Танилцуулга</summary>
              <div className="acc-body"><p>{t.bio}</p></div>
            </details>
          )}

          {education.length > 0 && (
            <details className="acc" open>
              <summary>Боловсрол</summary>
              <div className="acc-body table-wrap">
                <table className="edu">
                  <thead>
                    <tr><th>Хамгаалсан газар</th><th>Хамгаалсан он</th><th>Хамгаалсан сэдэв</th><th>Зэрэг</th></tr>
                  </thead>
                  <tbody>
                    {education.map((e, i) => (
                      <tr key={i}><td>{e.place}</td><td>{e.year}</td><td>{e.topic}</td><td>{e.degree}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}

          {sections.map((s) => (
            <details className="acc" key={s.title}>
              <summary>{s.title}</summary>
              <div className="acc-body">
                <ul>{s.list.map((x, i) => <li key={i}>{x}</li>)}</ul>
              </div>
            </details>
          ))}
        </section>
      </div>
    </>
  )
}