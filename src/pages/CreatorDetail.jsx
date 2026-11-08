import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import ExhibitCard from '../components/ExhibitCard'

export default function CreatorDetail() {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [items, setItems] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('profiles').select('*').eq('id', id).single()
      .then(({ data, error }) => (error ? setError('Бүтээгч олдсонгүй.') : setProfile(data)))
    supabase.from('exhibits').select('*, exhibition_categories(name)')
      .eq('creator_id', id).eq('status', 'published').order('year_created', { ascending: false })
      .then(({ data }) => setItems(data ?? []))
  }, [id])

  if (error) return <p className="empty">{error}</p>
  if (!profile) return <p className="empty">Уншиж байна...</p>

  return (
    <>
      <Link to="/creators">← ISM Creators</Link>
      <div className="creator-head">
        {profile.avatar_url && <img src={profile.avatar_url} alt={profile.display_name} />}
        <h1>{profile.display_name}</h1>
      </div>
      <h2>Бүтээлүүд ({items.length})</h2>
      {items.length === 0 ? <p className="empty">Нийтэлсэн бүтээл алга.</p>
        : <div className="grid">{items.map((e) => <ExhibitCard key={e.id} exhibit={e} />)}</div>}
    </>
  )
}
