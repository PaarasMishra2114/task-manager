import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import TaskManager from './TaskManager'

export default function App() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    supabase.auth.onAuthStateChange((_event, session) => setSession(session))
  }, [])

  const handleAuth = async () => {
    setError('')
    const fn = isSignup ? supabase.auth.signUp : supabase.auth.signInWithPassword
    const { error } = await fn({ email, password })
    if (error) setError(error.message)
  }

  if (session) return <TaskManager session={session} />

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-6 text-center">
          {isSignup ? 'Create account' : 'Sign in'}
        </h1>
        <input className="w-full border rounded-lg px-4 py-2 mb-3 text-sm"
          placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full border rounded-lg px-4 py-2 mb-4 text-sm"
          type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <button onClick={handleAuth}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition">
          {isSignup ? 'Sign up' : 'Login'}
        </button>
        <p className="text-center text-sm mt-4 text-gray-500 cursor-pointer"
          onClick={() => setIsSignup(!isSignup)}>
          {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </p>
      </div>
    </div>
  )
}
