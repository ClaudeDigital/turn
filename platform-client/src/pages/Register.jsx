import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../App'

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name:'', email:'', password:'', phone:'' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async e => {
    e.preventDefault(); setErr(''); setLoading(true)
    try { const d = await api.auth.register(form); login(d); navigate('/dashboard') }
    catch (e) { setErr(e.message) } finally { setLoading(false) }
  }

  const fields = [
    { key:'name',     label:'Emri i plotë', type:'text',     ph:'Genta Krasniqi',   req: true },
    { key:'email',    label:'Email',         type:'email',    ph:'genta@email.com',   req: true },
    { key:'phone',    label:'Telefon (opsional)', type:'tel', ph:'+383 4X XXX XXX', req: false },
    { key:'password', label:'Fjalëkalimi',   type:'password', ph:'Min 6 karaktere',  req: true },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="font-bebas text-3xl text-white tracking-widest">
            TURN<span className="text-amber-500">PLATFORM</span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">Krijo llogarinë tënde</p>
        </div>
        <form onSubmit={submit} className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-6 space-y-4">
          {err && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl">{err}</div>}
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-xs text-gray-500 mb-1.5">{f.label}</label>
              <input type={f.type} required={f.req} value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500/50"
                placeholder={f.ph}/>
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold px-4 py-2.5 rounded-xl text-sm transition-all">
            {loading ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/> Duke u regjistruar...</> : 'Regjistrohu'}
          </button>
          <p className="text-center text-xs text-gray-500">
            Ke llogari? <Link to="/login" className="text-amber-400 hover:text-amber-300">Hyr</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
