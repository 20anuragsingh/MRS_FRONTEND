import { useState } from 'react'
import movieWall from '../assets/netflix-collection.jpg'
import Signup from './signup'
import { api } from '../api'
import '../App.css'

const Login = ({ onAuthenticated }) => {
  const [mode, setMode] = useState('signin')
  const [notice, setNotice] = useState('')
  const isSignIn = mode === 'signin'

  const switchMode = (nextMode) => {
    setMode(nextMode)
    setNotice('')
  }

  const signIn = async (event) => {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    try {
      const result = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email: fields.get('email'), password: fields.get('password') }) })
      localStorage.setItem('cinema_token', result.token)
      onAuthenticated(result)
    } catch (error) { setNotice(error.message) }
  }

  return (
    <main className="auth-page" style={{ '--movie-wall': `url(${movieWall})` }}>
      <header className="auth-header"><a className="brand" href="#top">CINEMATCH</a></header>
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-tabs">
          <button className={isSignIn ? 'active' : ''} onClick={() => switchMode('signin')} type="button">Sign In</button>
          <button className={!isSignIn ? 'active' : ''} onClick={() => switchMode('signup')} type="button">Sign Up</button>
        </div>
        <h1 id="auth-title">{isSignIn ? 'Sign In' : 'Create an account'}</h1>
        <p className="intro">{isSignIn ? 'Welcome back. Your next favorite movie is waiting.' : 'Join CineMatch and get recommendations made for you.'}</p>
        {isSignIn ? (
          <form onSubmit={signIn}>
            <input name="email" type="email" placeholder="Email" autoComplete="email" required aria-label="Email address" />
            <input name="password" type="password" placeholder="Password" autoComplete="current-password" minLength="6" required aria-label="Password" />
            <button className="submit-button" type="submit">Sign In</button>
            <div className="form-options"><label className="remember"><input type="checkbox" /> <span>Remember me</span></label><button className="text-button" type="button">Need help?</button></div>
            {notice && <p className="notice" role="status">{notice}</p>}
          </form>
        ) : <Signup onSuccess={onAuthenticated} onAccountExists={() => { setMode('signin'); setNotice('An account with this email already exists. Please sign in.') }} onError={setNotice} notice={notice} />}
        <p className="switch-copy">{isSignIn ? 'New to CineMatch?' : 'Already have an account?'} <button type="button" onClick={() => switchMode(isSignIn ? 'signup' : 'signin')}>{isSignIn ? 'Sign up now.' : 'Sign in.'}</button></p>
        <p className="privacy-copy">This page is protected by secure authentication to keep your account safe. <button type="button">Learn more.</button></p>
      </section>
    </main>
  )
}

export default Login
