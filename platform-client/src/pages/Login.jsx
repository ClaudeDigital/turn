import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../App'
import { Trophy } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async e => {
    e.preventDefault(); setErr(''); setLoading(true)
    try { const d = await api.auth.login(form); await login(d); navigate('/dashboard') }
    catch (e) { setErr(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="font-bebas text-4xl text-amber-500">TURN<span className="text-white">PLATFORM</span></Link>
          <p className="text-slate-400 mt-2">Hyr në llogarinë tënde</p>
        </div>
        <form onSubmit={submit} className="bg-slate-800 rounded-2xl p-8 space-y-5">
          {err && <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-lg border border-red-500/30">{err}</div>}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Email</label>
            <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-amber-500 transition-colors" placeholder="emri@email.com"/>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Fjalëkalimi</label>
            <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-amber-500 transition-colors" placeholder="••••••"/>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg transition-colors disabled:opacity-50">
            {loading ? 'Duke hyrë...' : 'Hyr'}
          </button>
          <p className="text-center text-slate-400 text-sm">Nuk ke llogari? <Link to="/register" className="text-amber-400 hover:underline">Regjistrohu</Link></p>
        </form>
      </div>
    </div>
  )
}
