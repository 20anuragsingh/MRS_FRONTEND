import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import NavBar from './components/navbar'
import Login from './components/login'
import Favorites from './components/favorites'
import MovieDetails from './components/movie-details'
import './App.css'

function AppRoutes() {
  const navigate = useNavigate()
  const hasToken = Boolean(localStorage.getItem('cinema_token'))
  const completeLogin = (session) => navigate(session.preferences_completed ? '/browse' : '/onboarding', { replace: true })

  return <Routes>
    <Route path="/" element={<Login onAuthenticated={completeLogin} />} />
    <Route path="/onboarding" element={hasToken ? <Favorites onComplete={() => navigate('/browse', { replace: true })} /> : <Navigate to="/" replace />} />
    <Route path="/browse" element={hasToken ? <NavBar /> : <Navigate to="/" replace />} />
    <Route path="/profile" element={hasToken ? <NavBar /> : <Navigate to="/" replace />} />
    <Route path="/details/:mediaType/:tmdbId" element={hasToken ? <MovieDetails /> : <Navigate to="/" replace />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}

function App() {
  return <BrowserRouter><AppRoutes /></BrowserRouter>
}

export default App
