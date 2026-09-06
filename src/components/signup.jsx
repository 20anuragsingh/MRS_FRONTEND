import { api } from '../api'

const Signup = ({ onSuccess, onAccountExists, onError, notice }) => {
  const handleSubmit = async (event) => {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    try {
      const result = await api('/auth/register', { method: 'POST', body: JSON.stringify({ name: fields.get('name'), email: fields.get('email'), password: fields.get('password') }) })
      localStorage.setItem('cinema_token', result.token)
      onSuccess(result)
    } catch (error) {
      if (error.message === 'An account already exists for this email') onAccountExists()
      else onError(error.message)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" type="text" placeholder="Full name" autoComplete="name" required aria-label="Full name" />
      <input name="email" type="email" placeholder="Email" autoComplete="email" required aria-label="Email address" />
      <input name="password" type="password" placeholder="Password" autoComplete="new-password" minLength="6" required aria-label="Password" />
      <button className="submit-button" type="submit">Sign Up</button>
      {notice && <p className="notice" role="status">{notice}</p>}
    </form>
  )
}

export default Signup
