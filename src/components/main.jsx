import { useEffect, useState } from 'react'
import { api, imageUrl } from '../api'
import { useNavigate } from 'react-router-dom'

const Main = () => {
  const [popular, setPopular] = useState([])
  const [tvShows, setTvShows] = useState([])
  const [nowPlaying, setNowPlaying] = useState([])
  const [recommended, setRecommended] = useState([])

  useEffect(() => {
    Promise.allSettled([api('/tmdb/popular'), api('/tmdb/tv_popular'), api('/tmdb/now_playing'), api('/recommendations')]).then(([popularResult, tvResult, nowResult, recommendedResult]) => {
      if (popularResult.status === 'fulfilled') setPopular(popularResult.value.results || [])
      if (tvResult.status === 'fulfilled') setTvShows(tvResult.value.results || [])
      if (nowResult.status === 'fulfilled') setNowPlaying(nowResult.value.results || [])
      if (recommendedResult.status === 'fulfilled') {
        const recommendations = recommendedResult.value.recommendations || []
        setRecommended(recommendations)
        if (recommendations.length) {
          api('/tmdb/posters', { method: 'POST', body: JSON.stringify({ titles: recommendations.map((movie) => movie.name) }) })
            .then(({ posters }) => setRecommended(recommendations.map((movie) => ({ ...movie, ...(posters[movie.name] || {}) }))))
            .catch(() => {})
        }
      }
    })
  }, [])
  const featured = popular[0]
  return (
    <main id="home">
      <section className="hero-banner" style={featured?.backdrop_path ? { '--hero-image': `url(${imageUrl(featured.backdrop_path, 'original')})` } : {}}>
        <div className="hero-content">
          <span className="hero-kicker">CINEMATCH ORIGINAL</span>
          <h1>{featured?.title || 'Find your next obsession.'}</h1>
          <p>{featured?.overview || 'Your personalised screen is ready.'}</p>
          <div className="hero-actions">
            <button className="play-button" onClick={() => document.getElementById('movies')?.scrollIntoView({ behavior: 'smooth' })}>Browse movies</button>
            <button className="more-button" onClick={() => document.getElementById('recommended')?.scrollIntoView({ behavior: 'smooth' })}>ⓘ My recommendations</button>
          </div>
        </div>
      </section>
      <section className="content-rows">
        <MovieRow id="movies" title="Trending Movies" movies={popular} category="popular" />
        <MovieRow id="shows" title="Popular TV Shows" movies={tvShows} mediaType="tv" category="tv_popular" />
        <MovieRow id="latest" title="New in theatres" movies={nowPlaying} category="now_playing" />
        <MovieRow id="recommended" title="Recommended for you" movies={recommended} />
      </section>
    </main>
  )
}

const MovieRow = ({ id, title, movies, mediaType = 'movie', category }) => {
  const navigate = useNavigate()
  const [extraItems, setExtraItems] = useState([])
  const [visibleCount, setVisibleCount] = useState(12)
  const [page, setPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMorePages, setHasMorePages] = useState(true)

  const items = [...movies, ...extraItems]

  const openDetails = (movie) => {
    const tmdbId = movie.tmdb_id || movie.id
    if (tmdbId) navigate(`/details/${mediaType}/${tmdbId}`)
  }

  const handleShowMore = async () => {
    if (visibleCount < items.length) {
      setVisibleCount((prev) => Math.min(prev + 12, items.length))
      return
    }

    if (category && hasMorePages) {
      setLoadingMore(true)
      try {
        const nextPage = page + 1
        const res = await api(`/tmdb/${category}?page=${nextPage}`)
        const newResults = res.results || []
        if (newResults.length === 0) {
          setHasMorePages(false)
        } else {
          setPage(nextPage)
          setExtraItems((prev) => {
            const existingIds = new Set([...movies, ...prev].map((m) => m.id || m.name))
            const filtered = newResults.filter((m) => !existingIds.has(m.id || m.name))
            return [...prev, ...filtered]
          })
          setVisibleCount((prev) => prev + newResults.length)
        }
      } catch {
        setHasMorePages(false)
      } finally {
        setLoadingMore(false)
      }
    }
  }

  const handleShowLess = () => {
    setVisibleCount(12)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const isExpanded = visibleCount > 12
  const canShowMore = visibleCount < items.length || (Boolean(category) && hasMorePages)
  const hasMore = items.length > 12 || Boolean(category)
  const displayedMovies = items.slice(0, visibleCount)

  return items.length > 0 && (
    <section className="movie-row" id={id}>
      <div className="movie-row-header">
        <h2>{title}</h2>
        {hasMore && (
          <button
            type="button"
            className="row-more-button"
            onClick={isExpanded && !canShowMore ? handleShowLess : handleShowMore}
            disabled={loadingMore}
            aria-label={`${isExpanded && !canShowMore ? 'Show less' : 'Show more'} ${title}`}
          >
            {loadingMore ? 'Loading…' : isExpanded && !canShowMore ? 'Show Less ⌃' : 'More ›'}
          </button>
        )}
      </div>
      <div className={`poster-strip ${isExpanded ? 'expanded' : ''}`}>
        {displayedMovies.map((movie) => {
          const tmdbId = movie.tmdb_id || movie.id
          return (
            <article
              className={`movie-card ${tmdbId ? 'clickable-card' : ''}`}
              key={movie.id || movie.name}
              onClick={() => openDetails(movie)}
              onKeyDown={(event) => event.key === 'Enter' && openDetails(movie)}
              role={tmdbId ? 'button' : undefined}
              tabIndex={tmdbId ? 0 : undefined}
            >
              {movie.poster_path ? (
                <img src={imageUrl(movie.poster_path)} alt={`${movie.title || movie.name} poster`} />
              ) : (
                <div className="no-poster">{movie.title || movie.name}</div>
              )}
              <div className="movie-card-info">
                <strong>{movie.title || movie.name}</strong>
                <span>{movie.release_date?.slice(0, 4) || movie.first_air_date?.slice(0, 4) || movie.genre || 'Recommended for you'}</span>
              </div>
            </article>
          )
        })}
      </div>
      {hasMore && (
        <div className="movie-row-footer">
          {canShowMore && (
            <button
              type="button"
              className="more-button row-footer-button"
              onClick={handleShowMore}
              disabled={loadingMore}
            >
              {loadingMore ? 'Loading more…' : 'Show More ⌄'}
            </button>
          )}
          {isExpanded && (
            <button
              type="button"
              className="more-button row-footer-button row-collapse-button"
              onClick={handleShowLess}
            >
              Show Less ⌃
            </button>
          )}
        </div>
      )}
    </section>
  )
}

export default Main
