import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { api } from '../api'
import { ArrowLeft, Upload } from 'lucide-react'

export default function CreateTournament() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const orderId = params.get('order')
  const [order, setOrder] = useState(null)
  const [form, setForm] = useState({ name:'', slug:'', logo:null })
  const [preview, setPreview] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (orderId) api.orders.get(orderId).then(setOrder).catch(() => {})
  }, [orderId])

  const handleName = v => {
    const slug = v.toLowerCase()
      .replace(/ë/g,'e').replace(/ç/g,'c').replace(/ä/g,'a').replace(/ö/g,'o').replace(/ü/g,'u')
      .replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'')
    setForm(f => ({...f, name: v, slug}))
  }

  const handleLogo = e => {
    const file = e.target.files[0]
    if (file) { setForm(f => ({...f, logo: file})); setPreview(URL.createObjectURL(file)) }
  }

  const submit = async e => {
    e.preventDefault(); setErr(''); setLoading(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name); fd.append('slug', form.slug)
      if (orderId) fd.append('order_id', orderId)
      if (form.logo) fd.append('logo', form.logo)
      const t = await api.tournaments.create(fd)
      navigate(`/t/${t.slug}/admin`)
    } catch (e) { setErr(e.message) } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/dashboard" className="text-gray-500 hover:text-white transition-colors"><ArrowLeft size={20}/></Link>
          <h1 className="font-bebas text-3xl text-white tracking-wider">KRIJO TURNIRIN</h1>
        </div>

        {order && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-5 text-xs text-emerald-400">
            ✅ Plani <strong className="uppercase">{order.plan}</strong> — deri <strong>{order.teams_limit}</strong> ekipe
          </div>
        )}

        <form onSubmit={submit} className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-6 space-y-5">
          {err && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl">{err}</div>}

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Emri i Turnirit *</label>
            <input required value={form.name} onChange={e => handleName(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500/50"
              placeholder="Kupa e Prishtinës 2025"/>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Slug (URL) *</label>
            <div className="flex items-center bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden focus-within:border-amber-500/50 transition-colors">
              <span className="px-3 py-2.5 text-gray-600 text-sm border-r border-[#2a2a2a]">/t/</span>
              <input required value={form.slug}
                onChange={e => setForm(f => ({...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'').replace(/-+/g,'-')}))}
                className="flex-1 bg-transparent px-3 py-2.5 text-white text-sm focus:outline-none"
                placeholder="kupa-prishtines-2025"/>
            </div>
            {form.slug && <p className="text-xs text-gray-600 mt-1">turn.gezimm.com/t/{form.slug}</p>}
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Logo e Turnirit (opsional, max 3MB)</label>
            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-[#2a2a2a] hover:border-amber-500/40 rounded-xl cursor-pointer transition-colors relative overflow-hidden">
              {preview
                ? <img src={preview} className="absolute inset-0 w-full h-full object-contain p-2"/>
                : <div className="text-center"><Upload size={22} className="text-gray-600 mx-auto mb-2"/><span className="text-gray-600 text-xs">Kliko për të ngarkuar</span></div>}
              <input type="file" accept="image/*" className="hidden" onChange={handleLogo}/>
            </label>
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold px-4 py-3 rounded-xl text-sm transition-all">
            {loading ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/> Duke krijuar...</> : 'Krijo Turnirin →'}
          </button>
        </form>
      </div>
    </div>
  )
}
