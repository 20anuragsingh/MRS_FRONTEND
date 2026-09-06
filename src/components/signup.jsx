import { useState } from 'react'
import { api } from '../api'

const Signup = ({ onSuccess, onAccountExists, onError, notice }) => {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    const fields = new FormData(event.currentTarget)
    const name = (fields.get('name') || '').trim()
    const email = (fields.get('email') || '').trim()
    const password = fields.get('password') || ''

    try {
      const result = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      })
      if (!result?.token) {
        throw new Error('Registration failed: No token received from server.')
      }
      localStorage.setItem('cinema_token', result.token)
      if (result.name) {
        localStorage.setItem('cinema_user_name', result.name)
      }
      onSuccess(result)
    } catch (error) {
      if (error.message === 'An account already exists for this email') onAccountExists()
      else onError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" type="text" placeholder="Full name" autoComplete="name" required aria-label="Full name" />
      <input name="email" type="email" placeholder="Email" autoComplete="email" required aria-label="Email address" />
      <input name="password" type="password" placeholder="Password" autoComplete="new-password" minLength="6" required aria-label="Password" />
      <button className="submit-button" type="submit" disabled={loading}>{loading ? 'Creating account…' : 'Sign Up'}</button>
      {notice && <p className="notice error-notice" role="status">{notice}</p>}
    </form>
  )
}

export default Signup
