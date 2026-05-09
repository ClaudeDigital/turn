import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { Check, ArrowLeft, Banknote, CreditCard, Clock } from 'lucide-react'

const PLANS = [
  { id:'mini',     name:'Mini',     price:5,  teams:8,  popular:false },
  { id:'standard', name:'Standard', price:12, teams:16, popular:true  },
  { id:'pro',      name:'Pro',      price:25, teams:32, popular:false },
]
const FEATURES = ['Short automatik', 'Bracket publik', 'Lojtarë & ngjarje', 'Eksport JSON']

export default function Payment() {
  const navigate = useNavigate()
  const [plan, setPlan] = useState('standard')
  const [method, setMethod] = useState('cash')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)

  const submit = async () => {
    setErr(''); setLoading(true)
    try { await api.orders.create({ plan, payment_method: method, notes }); setDone(true) }
    catch (e) { setErr(e.message) } finally { setLoading(false) }
  }

  if (done) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center">
          <Clock size={32} className="text-amber-500"/>
        </div>
        <h2 className="font-bebas text-4xl text-white tracking-wider mb-3">KËRKESA U DHA!</h2>
        <p className="text-gray-400 text-sm mb-2">Kërkesa juaj e pagesës u dërgua tek administratori.</p>
        <p className="text-gray-500 text-sm mb-8">Pas konfirmimit do të njoftoheni dhe mund të krijoni turnirin.</p>
        <Link to="/dashboard" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-3 rounded-xl text-sm transition-all">
          Shko te Paneli
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/dashboard" className="text-gray-500 hover:text-white transition-colors"><ArrowLeft size={20}/></Link>
          <h1 className="font-bebas text-3xl text-white tracking-wider">ZGJIDH PLANIN</h1>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {PLANS.map(p => (
            <div key={p.id} onClick={() => setPlan(p.id)}
              className={`bg-[#111] rounded-2xl p-5 border-2 cursor-pointer transition-all relative ${plan === p.id ? 'border-amber-500/60' : 'border-[#1a1a1a] hover:border-[#333]'}`}>
              {p.popular && <span className="absolute -top-2.5 left-4 text-[10px] font-bold text-black bg-amber-500 px-2.5 py-0.5 rounded-full uppercase">Popular</span>}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bebas text-xl text-white tracking-wider">{p.name}</p>
                  <p className="text-3xl font-bold text-white">€{p.price}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 mt-1 flex items-center justify-center ${plan === p.id ? 'border-amber-500 bg-amber-500' : 'border-[#333]'}`}>
                  {plan === p.id && <div className="w-2 h-2 bg-black rounded-full"/>}
                </div>
              </div>
              <p className="text-xs text-amber-400 font-semibold mb-3">Deri {p.teams} ekipe</p>
              <ul className="space-y-1.5">
                {FEATURES.map(f => (
                  <li key={f} className="flex gap-2 text-gray-400 text-xs">
                    <Check size={12} className="text-amber-500 mt-0.5 shrink-0"/> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Payment method */}
        <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-5 mb-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-4">Metoda e Pagesës</p>
          <div className="grid md:grid-cols-2 gap-3 mb-4">
            {[
              { id:'cash', icon: <Banknote size={18}/>, label:'Cash', sub:'Paguaj dorë në dorë — konfirmim nga admini' },
              { id:'card', icon: <CreditCard size={18}/>, label:'Kartë Bankare', sub:'Duke ardhur së shpejti', disabled:true },
            ].map(m => (
              <div key={m.id} onClick={() => !m.disabled && setMethod(m.id)}
                className={`p-4 rounded-xl border transition-all flex items-center gap-3 ${m.disabled ? 'opacity-35 cursor-not-allowed border-[#222]' : `cursor-pointer ${method === m.id ? 'border-amber-500/40 bg-amber-500/5' : 'border-[#222] hover:border-[#333]'}`}`}>
                <div className={method === m.id && !m.disabled ? 'text-amber-400' : 'text-gray-500'}>{m.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-white">{m.label}</p>
                  <p className="text-xs text-gray-500">{m.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {method === 'cash' && (
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Shënim (opsional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="P.sh. kur do ta bësh pagesën..."
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-amber-500/50"/>
              <div className="mt-3 p-3 bg-blue-500/5 border border-blue-500/15 rounded-xl text-xs text-blue-300">
                Pasi të dërgosh kërkesën, administratori do të konfirmojë pagesën dhe do të mund të krijosh turnirin.
              </div>
            </div>
          )}
          {err && <div className="mt-3 text-red-400 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/15">{err}</div>}
        </div>

        <div className="flex justify-between items-center">
          <div className="text-gray-500 text-sm">
            Totali: <span className="text-white font-bold text-xl ml-1">€{PLANS.find(p => p.id === plan)?.price}</span>
          </div>
          <button onClick={submit} disabled={loading}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold px-7 py-3 rounded-xl text-sm transition-all">
            {loading ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/> Duke dërguar...</> : 'Dërgo Kërkesën →'}
          </button>
        </div>
      </div>
    </div>
  )
}
