import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Exhibits from './pages/Exhibits'
import ExhibitDetail from './pages/ExhibitDetail'
import Teachers from './pages/Teachers'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import Timeline from './pages/Timeline'
import Login from './pages/Login'
import Register from './pages/Register'
import MyExhibits from './pages/MyExhibits'
import Admin from './pages/Admin'
import Creators from './pages/Creators'
import CreatorDetail from './pages/CreatorDetail'
import History from './pages/History'
import Profile from './pages/Profile'
import TeacherDetail from './pages/TeacherDetail'

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/exhibits" element={<Exhibits />} />
          <Route path="/exhibits/:id" element={<ExhibitDetail />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/teachers/:id" element={<TeacherDetail />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/creators" element={<Creators />} />
          <Route path="/creators/:id" element={<CreatorDetail />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/my" element={<ProtectedRoute><MyExhibits /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute admin><Admin /></ProtectedRoute>} />
          <Route path="*" element={<p className="empty">Хуудас олдсонгүй.</p>} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
