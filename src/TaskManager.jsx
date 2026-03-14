import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function TaskManager({ session }) {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')

  const fetchTasks = async () => {
    if (!supabase) return

    setError('')
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    if (!data) {
      setTasks([])
      return
    }

    setTasks(data)
  }

  useEffect(() => {
    if (!supabase) {
      setError('Supabase client is not configured.')
      return
    }

    fetchTasks()

    const channel = supabase
      .channel('tasks-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchTasks)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const addTask = async () => {
    if (!supabase) return
    if (!title.trim()) return
    const { error } = await supabase.from('tasks').insert({ title, user_id: session.user.id })
    if (error) {
      setError(error.message)
      return
    }

    setTitle('')
  }

  const toggleTask = async (task) => {
    if (!supabase) return
    const { error } = await supabase.from('tasks').update({ is_done: !task.is_done }).eq('id', task.id)
    if (error) setError(error.message)
  }

  const deleteTask = async (id) => {
    if (!supabase) return
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) setError(error.message)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold">My Tasks</h1>
          <button onClick={() => supabase.auth.signOut()}
            className="text-sm text-gray-400 hover:text-red-500 transition">Sign out</button>
        </div>

        <div className="flex gap-2 mb-4">
          <input className="flex-1 border rounded-lg px-4 py-2 text-sm"
            placeholder="New task..." value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTask()} />
          <button onClick={addTask}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
            Add
          </button>
        </div>

        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

        {tasks.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">No tasks yet. Add one above!</p>
        )}

        <ul className="space-y-2">
          {tasks.map(task => (
            <li key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 group">
              <input type="checkbox" checked={Boolean(task.is_done)} onChange={() => toggleTask(task)}
                className="w-4 h-4 accent-indigo-600 cursor-pointer" />
              <span className={`flex-1 text-sm ${task.is_done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {task.title}
              </span>
              <button onClick={() => deleteTask(task.id)}
                className="text-gray-300 hover:text-red-400 transition opacity-0 group-hover:opacity-100 text-xs">
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
