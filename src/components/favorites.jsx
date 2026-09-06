import { useEffect, useState } from 'react'
import { api } from '../api'

const Favorites = ({ onComplete }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) return setResults([])
      try { setResults((await api(`/movies?q=${encodeURIComponent(query)}`)).movies) } catch { setResults([]) }
    }, 250)
    return () => clearTimeout(timer)
  }, [query])
  const add = (movie) => { if (selected.length < 3 && !selected.includes(movie)) setSelected([...selected, movie]); setQuery(''); setResults([]) }
  const submit = async () => { try { await api('/auth/preferences', { method: 'POST', body: JSON.stringify(selected) }); onComplete() } catch (err) { setError(err.message) } }
  return <main className="auth-page"><section className="auth-card favorites-card"><span className="hero-kicker">STEP 1 OF 1</span><h1>Choose 3 favorites</h1><p className="intro">We will use these to create recommendations just for you.</p><div className="favorite-picker"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search our movie catalog" aria-label="Search movies" />{results.length > 0 && <div className="suggestions">{results.map((movie) => <button key={movie} onClick={() => add(movie)} type="button">+ {movie}</button>)}</div>}</div><div className="selected-movies">{selected.map((movie) => <button key={movie} onClick={() => setSelected(selected.filter((item) => item !== movie))}>{movie} ×</button>)}</div><button className="submit-button" onClick={submit} disabled={selected.length < 3}>Continue to CineMatch</button>{error && <p className="notice">{error}</p>}</section></main>
}

export default Favorites
