import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, imageUrl } from '../api'

const Profile = () => {
  const [favorites, setFavorites] = useState([])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [notice, setNotice] = useState('')
  const [showAll, setShowAll] = useState(false)
  const navigate = useNavigate()

  const loadFavorites = async () => {
    const { favorites: names } = await api('/favorites')
    const movies = names.map((name) => ({ name }))
    setFavorites(movies)
    if (names.length) {
      try {
        const { posters } = await api('/tmdb/posters', { method: 'POST', body: JSON.stringify({ titles: names }) })
        setFavorites(movies.map((movie) => ({ ...movie, ...(posters[movie.name] || {}) })))
      } catch { /* Poster fallback remains visible. */ }
    }
  }

  useEffect(() => {
    let ignore = false
    api('/favorites')
      .then(async ({ favorites: names }) => {
        if (ignore) return
        const movies = names.map((name) => ({ name }))
        setFavorites(movies)
        if (names.length) {
          try {
            const { posters } = await api('/tmdb/posters', { method: 'POST', body: JSON.stringify({ titles: names }) })
            if (!ignore) setFavorites(movies.map((movie) => ({ ...movie, ...(posters[movie.name] || {}) })))
          } catch { /* Poster fallback remains visible. */ }
        }
      })
      .catch((error) => {
        if (!ignore) setNotice(error.message)
      })
    return () => { ignore = true }
  }, [])
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) return setResults([])
      try { setResults((await api(`/movies?q=${encodeURIComponent(query)}`)).movies) } catch { setResults([]) }
    }, 250)
    return () => clearTimeout(timer)
  }, [query])

  const addFavorite = async (movie) => {
    try {
      await api('/favorites', { method: 'POST', body: JSON.stringify({ movie }) })
      setQuery('')
      setResults([])
      setNotice(`Added ${movie}. Your recommendations were refreshed.`)
      await loadFavorites()
    } catch (error) { setNotice(error.message) }
  }

  const displayedFavorites = showAll ? favorites : favorites.slice(0, 12)

  return (
    <main className="profile-page">
      <section className="profile-hero">
        <span className="hero-kicker">MY PROFILE</span>
        <h1>Your selected movies</h1>
        <p>These favorites shape the recommendations CineMatch creates for you.</p>
      </section>
      <section className="profile-content">
        <div className="profile-add">
          <label htmlFor="add-favorite">Add a favorite movie</label>
          <div className="favorite-picker">
            <input id="add-favorite" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the movie catalog" />
            {results.length > 0 && (
              <div className="suggestions">
                {results.map((movie) => (
                  <button key={movie} type="button" onClick={() => addFavorite(movie)}>+ Add {movie}</button>
                ))}
              </div>
            )}
          </div>
          {notice && <p className="notice">{notice}</p>}
        </div>
        {favorites.length > 0 && (
          <div className="movie-row-header" style={{ maxWidth: 1200 }}>
            <h2>Favorites ({favorites.length})</h2>
            {favorites.length > 12 && (
              <button type="button" className="row-more-button" onClick={() => setShowAll(!showAll)}>
                {showAll ? 'Show Less ⌃' : 'More ›'}
              </button>
            )}
          </div>
        )}
        <div className="profile-grid">
          {displayedFavorites.map((movie) => (
            <article className={`movie-card ${movie.tmdb_id ? 'clickable-card' : ''}`} key={movie.name} onClick={() => movie.tmdb_id && navigate(`/details/movie/${movie.tmdb_id}`)}>
              {movie.poster_path ? <img src={imageUrl(movie.poster_path)} alt={`${movie.name} poster`} /> : <div className="no-poster">{movie.name}</div>}
              <div className="movie-card-info"><strong>{movie.name}</strong><span>Selected favorite</span></div>
            </article>
          ))}
        </div>
        {favorites.length > 12 && (
          <div className="movie-row-footer" style={{ maxWidth: 1200 }}>
            <button type="button" className="more-button row-footer-button" onClick={() => setShowAll(!showAll)}>
              {showAll ? 'Show Less ⌃' : 'Show More ⌄'}
            </button>
          </div>
        )}
        {!favorites.length && <p className="profile-empty">No movies selected yet. Add a favorite above.</p>}
      </section>
    </main>
  )
}

export default Profile
