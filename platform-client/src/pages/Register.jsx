import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../App'

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async e => {
    e.preventDefault(); setErr(''); setLoading(true)
    try { const d = await api.auth.register(form); await login(d); navigate('/dashboard') }
    catch (e) { setErr(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="font-bebas text-4xl text-amber-500">TURN<span className="text-white">PLATFORM</span></Link>
          <p className="text-slate-400 mt-2">Krijo llogarinë tënde falas</p>
        </div>
        <form onSubmit={submit} className="bg-slate-800 rounded-2xl p-8 space-y-5">
          {err && <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-lg border border-red-500/30">{err}</div>}
          {[
            { key:'name', label:'Emri i plotë', type:'text', ph:'Genta Krasniqi' },
            { key:'email', label:'Email', type:'email', ph:'genta@email.com' },
            { key:'phone', label:'Telefon (opsional)', type:'tel', ph:'+383 4X XXX XXX' },
            { key:'password', label:'Fjalëkalimi', type:'password', ph:'Min 6 karaktere' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm text-slate-400 mb-2">{f.label}</label>
              <input type={f.type} value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})}
                required={f.key !== 'phone'}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-amber-500 transition-colors" placeholder={f.ph}/>
            </div>
          ))}
          <button type="submit" disabled={loading} className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg transition-colors disabled:opacity-50">
            {loading ? 'Duke u regjistruar...' : 'Regjistrohu'}
          </button>
          <p className="text-center text-slate-400 text-sm">Ke llogari? <Link to="/login" className="text-amber-400 hover:underline">Hyr</Link></p>
        </form>
      </div>
    </div>
  )
}
