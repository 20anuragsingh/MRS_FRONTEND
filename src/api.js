const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const API_URL = RAW_API_URL.replace(/\/+$/, '')

export async function api(path, options = {}) {
  const token = localStorage.getItem('cinema_token')
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  let response
  try {
    response = await fetch(`${API_URL}${cleanPath}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
  } catch (err) {
    if (err.name === 'TypeError' && err.message.toLowerCase().includes('fetch')) {
      throw new Error(`Cannot connect to backend server at ${API_URL}. Please ensure the backend is active.`, { cause: err })
    }
    throw err
  }
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error || 'Something went wrong. Please try again.')
  return body
}

export const imageUrl = (path, size = 'w500') => path ? `https://image.tmdb.org/t/p/${size}${path}` : ''
