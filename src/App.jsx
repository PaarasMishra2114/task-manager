import { useState, useEffect } from 'react'
import { hasSupabaseEnv, supabase } from './supabaseClient'
import TaskManager from './TaskManager'

export default function App() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!supabase) {
      setError('Missing Supabase environment variables. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then redeploy/restart.')
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setSession(session))

    return () => subscription.unsubscribe()
  }, [])

  const handleAuth = async () => {
    if (!supabase) {
      setError('Supabase is not configured. Check your environment variables.')
      return
    }

    setError('')
    const fn = isSignup ? supabase.auth.signUp : supabase.auth.signInWithPassword
    const { error } = await fn({ email, password })
    if (error) setError(error.message)
  }

  if (session) return <TaskManager session={session} />

  if (!hasSupabaseEnv) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-lg">
          <h1 className="text-2xl font-semibold mb-3 text-center">Setup required</h1>
          <p className="text-sm text-gray-700 mb-2">The app is missing Supabase environment variables.</p>
          <p className="text-sm text-gray-700 mb-2">Add these in Vercel project settings and redeploy:</p>
          <ul className="text-sm text-gray-700 list-disc pl-5 mb-2">
            <li>VITE_SUPABASE_URL</li>
            <li>VITE_SUPABASE_ANON_KEY</li>
          </ul>
          <p className="text-sm text-gray-500">If running locally, restart the dev server after updating .env.</p>
        </div>
      </div>
    )
  }

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
