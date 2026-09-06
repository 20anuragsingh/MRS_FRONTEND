import { useEffect, useState } from 'react'
import { api, imageUrl } from '../api'

const Search = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) return setResults([])
      try { setResults((await api(`/tmdb/search?q=${encodeURIComponent(query)}`)).results?.slice(0, 5) || []) } catch { setResults([]) }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])
  return <section className="search-panel"><label htmlFor="movie-search">Search movies on TMDB</label><div><span>⌕</span><input id="movie-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Movie titles" /><button type="button" onClick={() => setQuery('')}>Clear</button></div>{query && <div className="search-results">{results.map((movie) => <article key={movie.id}>{movie.poster_path ? <img src={imageUrl(movie.poster_path, 'w92')} alt="" /> : <span className="search-placeholder" />}<span><strong>{movie.title}</strong><small>{movie.release_date?.slice(0, 4) || 'Release date unavailable'}</small></span></article>)}{!results.length && <p>No titles found.</p>}</div>}</section>
}

export default Search
