import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../App'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email:'', password:'' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async e => {
    e.preventDefault(); setErr(''); setLoading(true)
    try { const d = await api.auth.login(form); login(d); navigate('/dashboard') }
    catch (e) { setErr(e.message) } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="font-bebas text-3xl text-white tracking-widest">
            TURN<span className="text-amber-500">PLATFORM</span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">Hyr në llogarinë tënde</p>
        </div>
        <form onSubmit={submit} className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-6 space-y-4">
          {err && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl">{err}</div>
          )}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Email</label>
            <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500/50"
              placeholder="emri@email.com"/>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Fjalëkalimi</label>
            <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500/50"
              placeholder="••••••"/>
          </div>
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold px-4 py-2.5 rounded-xl text-sm transition-all">
            {loading ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/> Duke hyrë...</> : 'Hyr'}
          </button>
          <p className="text-center text-xs text-gray-500">
            Nuk ke llogari? <Link to="/register" className="text-amber-400 hover:text-amber-300">Regjistrohu</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
