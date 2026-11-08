import { Link } from 'react-router-dom'

export default function ExhibitCard({ exhibit }) {
  return (
    <Link to={`/exhibits/${exhibit.id}`} className="card">
      {exhibit.image_url ? (
        <img src={exhibit.image_url} alt={exhibit.title} />
      ) : (
        <div className="img-placeholder">Зураггүй</div>
      )}
      <div className="card-body">
        <h3>{exhibit.title}</h3>
        <p className="meta">
          {exhibit.exhibition_categories?.name ?? 'Ангилалгүй'}
          {exhibit.year_created ? ` · ${exhibit.year_created} он` : ''}
        </p>
        {exhibit.technology_stack && <p className="tags">{exhibit.technology_stack}</p>}
      </div>
    </Link>
  )
}
