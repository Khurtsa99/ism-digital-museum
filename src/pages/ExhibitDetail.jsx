import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function ExhibitDetail() {
  const { id } = useParams()
  const [e, setE] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('exhibits')
      .select('*, exhibition_categories(name), profiles(display_name)')
      .eq('id', id).single()
      .then(({ data, error }) => (error ? setError('Үзмэр олдсонгүй.') : setE(data)))
  }, [id])

  if (error) return <p className="empty">{error}</p>
  if (!e) return <p className="empty">Уншиж байна...</p>

  return (
    <article className="detail">
      <Link to="/exhibits">← Үзмэр рүү буцах</Link>
      <h1>{e.title}</h1>
      {e.image_url && <img src={e.image_url} alt={e.title} className="detail-img" />}
      <p className="meta">
        {e.exhibition_categories?.name ?? 'Ангилалгүй'}
        {e.year_created && ` · ${e.year_created} он`}
        </p>
      {e.profiles?.display_name && (
        <p className="meta">Зохиогч: <Link to={`/creators/${e.creator_id}`}>{e.profiles.display_name}</Link></p>
      )}
      {e.technology_stack && <p className="tags">Ашигласан технологи: {e.technology_stack}</p>}
      <p>{e.description}</p>
      <div className="row">
        {e.demo_url && <a className="btn" href={e.demo_url} target="_blank" rel="noreferrer">Demo үзэх</a>}
        {e.github_url && <a className="btn btn-light" href={e.github_url} target="_blank" rel="noreferrer">GitHub</a>}
      </div>
    </article>
  )
}
