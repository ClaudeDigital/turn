import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { api } from '../api'
import { ArrowLeft, Upload } from 'lucide-react'

export default function CreateTournament() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const orderId = params.get('order')
  const [order, setOrder] = useState(null)
  const [form, setForm] = useState({ name: '', slug: '', logo: null })
  const [preview, setPreview] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (orderId) api.orders.get(orderId).then(setOrder).catch(() => {})
  }, [orderId])

  const handleName = v => {
    const slug = v.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    setForm(f => ({ ...f, name: v, slug }))
  }

  const handleLogo = e => {
    const file = e.target.files[0]
    if (file) { setForm(f => ({ ...f, logo: file })); setPreview(URL.createObjectURL(file)) }
  }

  const submit = async e => {
    e.preventDefault(); setErr(''); setLoading(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('slug', form.slug)
      if (orderId) fd.append('order_id', orderId)
      if (form.logo) fd.append('logo', form.logo)
      const t = await api.tournaments.create(fd)
      navigate(`/t/${t.slug}/admin`)
    } catch (e) { setErr(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <Link to="/dashboard" className="text-slate-400 hover:text-white"><ArrowLeft size={20}/></Link>
          <h1 className="font-bebas text-4xl text-white">KRIJO TURNIRIN</h1>
        </div>

        {order && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6 text-emerald-400 text-sm">
            ✅ Plani <strong>{order.plan}</strong> — deri {order.teams_limit} ekipe
          </div>
        )}

        <form onSubmit={submit} className="bg-slate-800 rounded-2xl p-8 space-y-6">
          {err && <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-lg border border-red-500/30">{err}</div>}

          <div>
            <label className="block text-sm text-slate-400 mb-2">Emri i Turnirit *</label>
            <input required value={form.name} onChange={e => handleName(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-amber-500 transition-colors"
              placeholder="Kupa e Prishtinës 2025"/>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Slug (URL) *</label>
            <div className="flex items-center bg-slate-700 border border-slate-600 rounded-lg overflow-hidden focus-within:border-amber-500 transition-colors">
              <span className="px-3 py-3 text-slate-500 text-sm border-r border-slate-600">/t/</span>
              <input required value={form.slug} onChange={e => setForm(f => ({...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'')}))}
                className="flex-1 bg-transparent px-3 py-3 text-white" placeholder="kupa-prishtines-2025"/>
            </div>
            <p className="text-slate-500 text-xs mt-1">Link publik: turn.gezimm.com/t/{form.slug || '...'}</p>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Logo (opsional, max 3MB)</label>
            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-amber-500 transition-colors relative overflow-hidden">
              {preview ? <img src={preview} className="absolute inset-0 w-full h-full object-contain p-2"/> : (
                <div className="text-center">
                  <Upload size={24} className="text-slate-500 mx-auto mb-2"/>
                  <span className="text-slate-500 text-sm">Kliko për të ngarkuar logon</span>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleLogo}/>
            </label>
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl text-lg transition-colors disabled:opacity-50">
            {loading ? 'Duke krijuar...' : 'Krijo Turnirin →'}
          </button>
        </form>
      </div>
    </div>
  )
}
