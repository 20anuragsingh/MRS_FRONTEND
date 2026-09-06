import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import NavBar from './components/navbar'
import Login from './components/login'
import Favorites from './components/favorites'
import MovieDetails from './components/movie-details'
import './App.css'

function AppRoutes() {
  const navigate = useNavigate()
  const [token, setToken] = useState(() => localStorage.getItem('cinema_token'))

  const completeLogin = (session) => {
    if (session?.token) {
      localStorage.setItem('cinema_token', session.token)
      setToken(session.token)
    }
    navigate(session?.preferences_completed ? '/browse' : '/onboarding', { replace: true })
  }

  const handleLogout = () => {
    localStorage.removeItem('cinema_token')
    localStorage.removeItem('cinema_user_name')
    setToken(null)
    navigate('/', { replace: true })
  }

  return (
    <Routes>
      <Route
        path="/"
        element={token ? <Navigate to="/browse" replace /> : <Login onAuthenticated={completeLogin} />}
      />
      <Route
        path="/onboarding"
        element={token ? <Favorites onComplete={() => navigate('/browse', { replace: true })} /> : <Navigate to="/" replace />}
      />
      <Route
        path="/browse"
        element={token ? <NavBar onLogout={handleLogout} /> : <Navigate to="/" replace />}
      />
      <Route
        path="/profile"
        element={token ? <NavBar onLogout={handleLogout} /> : <Navigate to="/" replace />}
      />
      <Route
        path="/details/:mediaType/:tmdbId"
        element={token ? <MovieDetails /> : <Navigate to="/" replace />}
      />
      <Route path="*" element={<Navigate to={token ? '/browse' : '/'} replace />} />
    </Routes>
  )
}

function App() {
  return <BrowserRouter><AppRoutes /></BrowserRouter>
}

export default App
