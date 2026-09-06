import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api, imageUrl } from '../api'

const MovieDetails = () => {
  const { mediaType, tmdbId } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [error, setError] = useState('')
  const [showAllCast, setShowAllCast] = useState(false)

  useEffect(() => { api(`/tmdb/${mediaType}/${tmdbId}/details`).then(setMovie).catch((err) => setError(err.message)) }, [mediaType, tmdbId])
  if (error) return <main className="detail-page"><button className="back-button" onClick={() => navigate(-1)}>← Back</button><p className="notice">{error}</p></main>
  if (!movie) return <main className="detail-page"><button className="back-button" onClick={() => navigate(-1)}>← Back</button><p>Loading title details…</p></main>
  const title = movie.title || movie.name
  const director = movie.credits?.crew?.filter((person) => person.job === 'Director').map((person) => person.name).join(', ') || movie.created_by?.map((person) => person.name).join(', ') || 'Not available'
  const allCast = movie.credits?.cast || []
  const cast = showAllCast ? allCast.slice(0, 30) : allCast.slice(0, 10)
  const release = movie.release_date || movie.first_air_date
  const runtime = movie.runtime ? `${movie.runtime} min` : movie.number_of_seasons ? `${movie.number_of_seasons} season${movie.number_of_seasons === 1 ? '' : 's'}` : 'Not available'
  return <main className="detail-page" style={movie.backdrop_path ? { '--detail-backdrop': `url(${imageUrl(movie.backdrop_path, 'original')})` } : {}}><div className="detail-backdrop" /><button className="back-button" onClick={() => navigate(-1)}>← Back</button><section className="detail-content"><div className="detail-poster">{movie.poster_path ? <img src={imageUrl(movie.poster_path, 'w500')} alt={`${title} poster`} /> : <div className="no-poster">{title}</div>}</div><div className="detail-copy"><span className="hero-kicker">{mediaType === 'tv' ? 'TV SHOW' : 'MOVIE'}</span><h1>{title}</h1>{movie.tagline && <p className="tagline">{movie.tagline}</p>}<div className="detail-meta"><strong>★ {movie.vote_average?.toFixed(1) || 'N/A'}</strong><span>{release?.slice(0, 4) || '—'}</span><span>{runtime}</span><span>{movie.status || 'Released'}</span></div><p className="detail-overview">{movie.overview || 'No overview is available for this title.'}</p><dl className="detail-facts"><div><dt>{mediaType === 'tv' ? 'Creator' : 'Director'}</dt><dd>{director}</dd></div><div><dt>Genres</dt><dd>{movie.genres?.map((genre) => genre.name).join(', ') || 'Not available'}</dd></div><div><dt>Languages</dt><dd>{movie.spoken_languages?.map((language) => language.english_name).join(', ') || movie.original_language?.toUpperCase()}</dd></div></dl></div></section>{cast.length > 0 && <section className="cast-section"><div className="cast-header"><h2>Cast</h2>{allCast.length > 10 && <button type="button" className="row-more-button" onClick={() => setShowAllCast(!showAllCast)}>{showAllCast ? 'Show Less ⌃' : 'More ›'}</button>}</div><div className="cast-grid">{cast.map((person) => <article className="cast-card" key={person.credit_id}>{person.profile_path ? <img src={imageUrl(person.profile_path, 'w185')} alt={person.name} /> : <div className="cast-placeholder">{person.name.slice(0, 1)}</div>}<strong>{person.name}</strong><span>{person.character || 'Cast'}</span></article>)}</div>{allCast.length > 10 && <div className="movie-row-footer"><button type="button" className="more-button row-footer-button" onClick={() => setShowAllCast(!showAllCast)}>{showAllCast ? 'Show Less ⌃' : 'Show More Cast ⌄'}</button></div>}</section>}</main>
}

export default MovieDetails
