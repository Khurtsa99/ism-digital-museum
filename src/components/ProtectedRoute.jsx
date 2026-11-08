import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, admin = false }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <p className="empty">Уншиж байна...</p>
  if (!user) return <Navigate to="/login" replace />
  if (admin && !isAdmin) return <p className="empty">Танд энэ хуудсыг үзэх эрх байхгүй.</p>
  return children
}
