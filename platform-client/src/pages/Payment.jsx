import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { Check, ArrowLeft, CreditCard, Banknote, Clock } from 'lucide-react'

const plans = [
  { id: 'mini', name: 'Mini', price: 5, teams: 8, features: ['Deri 8 ekipe', 'Short automatik', 'Bracket publik', 'Lojtarë & ngjarje'] },
  { id: 'standard', name: 'Standard', price: 12, teams: 16, popular: true, features: ['Deri 16 ekipe', 'Short automatik', 'Bracket publik', 'Lojtarë & ngjarje', 'Eksport JSON'] },
  { id: 'pro', name: 'Pro', price: 25, teams: 32, features: ['Deri 32 ekipe', 'Short automatik', 'Bracket publik', 'Lojtarë & ngjarje', 'Eksport JSON', 'Prioritet support'] },
]

export default function Payment() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [selected, setSelected] = useState('standard')
  const [method, setMethod] = useState('cash')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)

  const submit = async () => {
    setErr(''); setLoading(true)
    try {
      await api.orders.create({ plan: selected, payment_method: method, notes })
      setDone(true)
    } catch (e) { setErr(e.message) }
    finally { setLoading(false) }
  }

  if (done) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-amber-500/10 border-2 border-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock size={36} className="text-amber-500"/>
        </div>
        <h2 className="font-bebas text-4xl text-white mb-3">KËRKESA U DHA!</h2>
        <p className="text-slate-400 mb-2">Kërkesa juaj e pagesës cash u dërgua tek administratori.</p>
        <p className="text-slate-400 mb-8">Sapo pagesa konfirmohet, do të merrni njoftim dhe do të mund të krijoni turnirin tuaj.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/dashboard" className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg transition-colors">Shko te Paneli</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors"><ArrowLeft size={20}/></Link>
          <h1 className="font-bebas text-4xl text-white">ZGJIDH PLANIN</h1>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-5 mb-10">
          {plans.map(p => (
            <div key={p.id} onClick={() => setSelected(p.id)}
              className={`relative bg-slate-800 rounded-2xl p-6 border-2 cursor-pointer transition-all ${selected === p.id ? 'border-amber-500' : 'border-slate-700 hover:border-slate-600'}`}>
              {p.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full">MË POPULAR</span>}
              <div className={`w-5 h-5 rounded-full border-2 absolute top-4 right-4 flex items-center justify-center ${selected === p.id ? 'border-amber-500 bg-amber-500' : 'border-slate-600'}`}>
                {selected === p.id && <div className="w-2 h-2 bg-black rounded-full"/>}
              </div>
              <div className="font-bebas text-2xl text-white mb-1">{p.name}</div>
              <div className="text-4xl font-bold text-white mb-4">€{p.price}</div>
              <ul className="space-y-2">
                {p.features.map(f => <li key={f} className="flex gap-2 text-slate-300 text-sm"><Check size={15} className="text-emerald-400 flex-shrink-0 mt-0.5"/>{f}</li>)}
              </ul>
            </div>
          ))}
        </div>

        {/* Payment method */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6">
          <h2 className="font-semibold text-white mb-5">Metoda e pagesës</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {[
              { id: 'cash', icon: <Banknote size={20}/>, label: 'Cash', sub: 'Paguaj dorë në dorë — konfirmim nga admini' },
              { id: 'card', icon: <CreditCard size={20}/>, label: 'Kartë (duke ardhur)', sub: 'Pagesa online — disponueshme së shpejti', disabled: true },
            ].map(m => (
              <div key={m.id} onClick={() => !m.disabled && setMethod(m.id)}
                className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${m.disabled ? 'opacity-40 cursor-not-allowed border-slate-700' : `cursor-pointer ${method === m.id ? 'border-amber-500 bg-amber-500/5' : 'border-slate-700 hover:border-slate-600'}`}`}>
                <div className={`${method === m.id && !m.disabled ? 'text-amber-400' : 'text-slate-400'}`}>{m.icon}</div>
                <div>
                  <div className="font-semibold text-white text-sm">{m.label}</div>
                  <div className="text-slate-400 text-xs">{m.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {method === 'cash' && (
            <div>
              <label className="block text-sm text-slate-400 mb-2">Shënim (opsional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white resize-none focus:border-amber-500 transition-colors text-sm"
                placeholder="P.sh. kur dhe ku do ta bësh pagesën..."/>
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-300 text-xs">
                Pasi të dërgosh kërkesën, administratori do të marrë njoftim dhe do ta konfirmojë pagesën manuale.
              </div>
            </div>
          )}

          {err && <div className="mt-4 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/30">{err}</div>}
        </div>

        <div className="flex justify-between items-center">
          <div className="text-slate-400">Totali: <span className="text-white font-bold text-xl">€{plans.find(p=>p.id===selected)?.price}</span></div>
          <button onClick={submit} disabled={loading} className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition-colors disabled:opacity-50">
            {loading ? 'Duke dërguar...' : 'Dërgo Kërkesën →'}
          </button>
        </div>
      </div>
    </div>
  )
}
